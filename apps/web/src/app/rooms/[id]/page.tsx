'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, ListMusic, 
  Mic, MicOff, Volume2, VolumeX, Send, Lock, Unlock, PhoneOff, 
  Users, MessageSquare, Radio, Share2, Sparkles, Heart, Flame, Hand, 
  ArrowLeft, Check, Copy, ChevronDown, Plus, Upload, Loader2
} from 'lucide-react';
import { apiFetch, cachedApiFetch, resolveIpfsUrl } from '@/lib/api';
import { useRoomSocket } from '@/hooks/useRoomSocket';
import toast from 'react-hot-toast';

export default function LiveRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const roomId = resolvedParams?.id;
  const router = useRouter();

  // Current logged in user ID from localStorage (null if unauthenticated)
  const currentUserId = typeof window !== 'undefined'
    ? (() => {
        const stored = localStorage.getItem('groovely_user_id') || localStorage.getItem('grooveli_user_id');
        return stored ? Number(stored) : null;
      })()
    : null;

  const [room, setRoom] = useState<any>(null);
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [libraryTracks, setLibraryTracks] = useState<any[]>([]);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [playlistSearchQuery, setPlaylistSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Invite Modal & Search State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteSearchQuery, setInviteSearchQuery] = useState('');
  const [inviteCreators, setInviteCreators] = useState<any[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<number[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isInviteModalOpen) return;
    const query = inviteSearchQuery.trim().replace(/^@/, '');
    const endpoint = query ? `/api/fan/creators?q=${encodeURIComponent(query)}` : '/api/fan/creators';

    async function fetchInviteCreators() {
      try {
        const res = await apiFetch(endpoint);
        if (res?.ok) {
          const body = await res.json();
          if (body?.data?.creators) setInviteCreators(body.data.creators);
          else if (body?.creators) setInviteCreators(body.creators);
        }
      } catch (err) {
        console.warn('Failed to fetch creators for invite modal:', err);
      }
    }

    const timer = setTimeout(fetchInviteCreators, 200);
    return () => clearTimeout(timer);
  }, [isInviteModalOpen, inviteSearchQuery]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      toast.success('Room link copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleSendInvite = (creator: any) => {
    if (!invitedUsers.includes(creator.id)) {
      setInvitedUsers(prev => [...prev, creator.id]);
      toast.success(`Invite sent to @${creator.username || creator.display_name}!`);
    }
  };

  // Hidden File Input for Creator Audio Upload
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingTrack, setIsUploadingTrack] = useState(false);

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|aac|flac|ogg)$/i)) {
      toast.error('Please select a valid audio file (.mp3, .wav, .m4a, .flac)');
      return;
    }

    setIsUploadingTrack(true);
    const toastId = toast.loading(`Processing audio: ${file.name}...`);

    try {
      const audioObjectUrl = URL.createObjectURL(file);
      const trackTitle = file.name.replace(/\.[^/.]+$/, '');

      const newUploadedTrack = {
        id: Date.now(),
        title: trackTitle,
        artist_name: 'You (Creator)',
        cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
        audio_url: audioObjectUrl,
        duration: '03:30',
        isLocalUpload: true,
      };

      // Try uploading to backend API
      try {
        const formData = new FormData();
        formData.append('audio', file);
        formData.append('title', trackTitle);
        const uploadRes = await apiFetch(`/api/rooms/${roomId}/playlist`, {
          method: 'POST',
          body: formData,
        });
        if (uploadRes && uploadRes.ok) {
          const json = await uploadRes.json();
          if (json?.data) {
            newUploadedTrack.id = json.data.id || newUploadedTrack.id;
          }
        }
      } catch (err) {
        console.warn('Backend track upload fallback to browser Object URL:', err);
      }

      setLibraryTracks(prev => [newUploadedTrack, ...prev]);
      setPlaylist(prev => [newUploadedTrack, ...prev]);
      setCurrentTrack(newUploadedTrack);
      setIsPlaying(true);
      emitPlaybackControl('play', newUploadedTrack.id, 0, newUploadedTrack);
      setIsPlaylistModalOpen(false);

      toast.success(`Now streaming live: ${trackTitle}`, { id: toastId });
    } catch (err) {
      console.error('Audio upload failed:', err);
      toast.error('Failed to process audio file', { id: toastId });
    } finally {
      setIsUploadingTrack(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // User Role Detection (Creator vs Fan)
  const [userRole, setUserRole] = useState<string>('fan');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('groovely_role') || localStorage.getItem('grooveli_role') || 'fan';
      setUserRole(role.toLowerCase());
    }
  }, []);

  // WebSockets Hook Integration & Room Host Authorization
  const isRoomHost = Boolean(currentUserId && room?.host_id && String(currentUserId) === String(room.host_id));
  const isHostOrCreator = isRoomHost;
  const socketRole = isRoomHost ? 'host' : 'listener';
  const {
    isConnected: isSocketConnected,
    participants,
    setParticipants,
    messages,
    setMessages,
    playbackState,
    isRoomEnded,
    emitPlaybackControl,
    emitSendMessage,
    emitRaiseHand,
    emitEndRoom,
    emitToggleMute,
    emitVoiceStream,
  } = useRoomSocket(roomId, currentUserId ?? undefined, socketRole, handleVoiceStreamReceived);

  // Live Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'activity'>('chat');
  const [chatMessage, setChatMessage] = useState('');
  const [isChatLocked, setIsChatLocked] = useState(false);

  // Floating Reactions State
  const [floatingReactions, setFloatingReactions] = useState<{ id: number; emoji: string; left: number }[]>([]);

  useEffect(() => {
    if (!roomId) return;

    async function initRoomAndJoin() {
      try {
        // 1. Fetch full room details first to determine room.host_id
        const { data } = await cachedApiFetch(`/api/rooms/${roomId}`, {
          onBackgroundUpdate: (fresh: any) => {
            if (fresh?.data) {
              setRoom(fresh.data.room);
              if (fresh.data.participants) setParticipants(fresh.data.participants);
              if (fresh.data.playlist) setPlaylist(fresh.data.playlist);
              if (fresh.data.messages) setMessages(fresh.data.messages);
            }
          }
        });

        let loadedRoomHostId = null;
        if (data?.data) {
          setRoom(data.data.room);
          loadedRoomHostId = data.data.room?.host_id;
          if (data.data.participants) setParticipants(data.data.participants);
          if (data.data.playlist) setPlaylist(data.data.playlist);
          if (data.data.messages) setMessages(data.data.messages);

          if (data.data.room?.current_track_title) {
            setCurrentTrack({
              id: data.data.room.current_track_id,
              title: data.data.room.current_track_title,
              cover_url: data.data.room.current_track_cover,
              audio_url: data.data.room.current_track_audio,
              artist_name: data.data.room.current_track_artist || data.data.room.host_name,
            });
          }
        }

        // 2. Record participant join in NestJS / PostgreSQL DB with accurate role
        const determinedRole = Boolean(currentUserId && loadedRoomHostId && String(currentUserId) === String(loadedRoomHostId)) ? 'host' : 'listener';
        try {
          await apiFetch(`/api/rooms/${roomId}/join`, {
            method: 'POST',
            body: JSON.stringify({ role: determinedRole }),
          });
        } catch (jErr) {
          console.warn('Join room DB endpoint notice:', jErr);
        }

        // Fetch Creator Tracks, Fan Trending & Marketplace Tracks for Playlist Selector
        try {
          const [cRes, mRes, fRes] = await Promise.allSettled([
            apiFetch('/api/creator/tracks'),
            apiFetch('/api/market/trending'),
            apiFetch('/api/fan/trending')
          ]);

          const extractTracks = (body: any): any[] => {
            if (!body) return [];
            if (Array.isArray(body)) return body;
            if (Array.isArray(body.data?.tracks)) return body.data.tracks;
            if (Array.isArray(body.tracks)) return body.tracks;
            if (Array.isArray(body.data)) return body.data;
            return [];
          };

          let dbTracks: any[] = [];
          if (cRes.status === 'fulfilled' && cRes.value?.ok) {
            const body = await cRes.value.json();
            dbTracks = [...dbTracks, ...extractTracks(body)];
          }
          if (mRes.status === 'fulfilled' && mRes.value?.ok) {
            const body = await mRes.value.json();
            dbTracks = [...dbTracks, ...extractTracks(body)];
          }
          if (fRes.status === 'fulfilled' && fRes.value?.ok) {
            const body = await fRes.value.json();
            dbTracks = [...dbTracks, ...extractTracks(body)];
          }

          const uniqueDbTracks = dbTracks.filter((t, i, self) => 
            i === self.findIndex(ot => String(ot.id || ot.track_id) === String(t.id || t.track_id))
          );

          setLibraryTracks(uniqueDbTracks);
        } catch (tErr) {
          console.warn('Could not fetch library tracks:', tErr);
        }
      } catch (err) {
        console.error('Failed to load room details:', err);
      } finally {
        setLoading(false);
      }
    }

    initRoomAndJoin();
  }, [roomId, userRole]);

  // Fetch fresh Creator & Library Tracks whenever Playlist modal opens (Creator Only)
  useEffect(() => {
    if (!isPlaylistModalOpen) return;
    if (!isHostOrCreator) return;

    async function loadFreshLibraryTracks() {
      try {
        const [cRes, mRes, fRes] = await Promise.allSettled([
          apiFetch('/api/creator/tracks'),
          apiFetch('/api/market/trending'),
          apiFetch('/api/fan/trending')
        ]);

        const extractTracks = (body: any): any[] => {
          if (!body) return [];
          if (Array.isArray(body)) return body;
          if (Array.isArray(body.data?.tracks)) return body.data.tracks;
          if (Array.isArray(body.tracks)) return body.tracks;
          if (Array.isArray(body.data)) return body.data;
          return [];
        };

        let dbTracks: any[] = [];
        if (cRes.status === 'fulfilled' && cRes.value?.ok) {
          const body = await cRes.value.json();
          dbTracks = [...dbTracks, ...extractTracks(body)];
        }
        if (mRes.status === 'fulfilled' && mRes.value?.ok) {
          const body = await mRes.value.json();
          dbTracks = [...dbTracks, ...extractTracks(body)];
        }
        if (fRes.status === 'fulfilled' && fRes.value?.ok) {
          const body = await fRes.value.json();
          dbTracks = [...dbTracks, ...extractTracks(body)];
        }

        const unique = dbTracks.filter((t, i, self) => 
          i === self.findIndex(ot => String(ot.id || ot.track_id) === String(t.id || t.track_id))
        );

        setLibraryTracks(unique);
      } catch (err) {
        console.warn('Failed to load fresh library tracks for modal:', err);
      }
    }

    loadFreshLibraryTracks();
  }, [isPlaylistModalOpen]);

  // Sync WebSockets playback state changes & track switching to local player for all room listeners
  useEffect(() => {
    if (!playbackState) return;

    const targetState = playbackState.state === 'playing';
    setIsPlaying(targetState);

    if (playbackState.positionMs !== undefined && Math.abs(currentTimeMs - playbackState.positionMs) > 2000) {
      setCurrentTimeMs(playbackState.positionMs);
      if (audioRef.current && !isNaN(playbackState.positionMs)) {
        audioRef.current.currentTime = playbackState.positionMs / 1000;
      }
    }

    const newTrackId = playbackState.current_track_id || (playbackState as any).trackId;
    if (newTrackId && String(currentTrack?.id) !== String(newTrackId)) {
      const matchInLibrary = libraryTracks.find((t: any) => String(t.id || t.track_id) === String(newTrackId));
      const matchInPlaylist = playlist.find((t: any) => String(t.id || t.track_id) === String(newTrackId));
      const targetTrack = matchInLibrary || matchInPlaylist;

      if (targetTrack) {
        setCurrentTrack(targetTrack);
        if (audioRef.current) {
          const audioSrc = resolveIpfsUrl(targetTrack.audio_url || targetTrack.url);
          if (audioSrc) {
            audioRef.current.src = audioSrc;
            if (targetState) {
              audioRef.current.play().catch((e) => console.warn('Audio play sync error:', e));
            }
          }
        }
      } else {
        // Fetch track details from backend API
        apiFetch(`/api/tracks/${newTrackId}`, { skipAuthRedirect: true })
          .then(async (res) => {
            if (res && res.ok) {
              const body = await res.json();
              const fetched = body?.data?.track || body?.data || body;
              if (fetched && (fetched.id || fetched.track_id)) {
                setCurrentTrack(fetched);
                if (audioRef.current) {
                  const audioSrc = resolveIpfsUrl(fetched.audio_url || fetched.url);
                  if (audioSrc) {
                    audioRef.current.src = audioSrc;
                    if (targetState) {
                      audioRef.current.play().catch((e) => console.warn('Audio play sync error:', e));
                    }
                  }
                }
              }
            }
          })
          .catch((err) => console.warn('Could not sync track details:', err));
      }
    } else if (audioRef.current) {
      if (targetState && audioRef.current.paused) {
        audioRef.current.play().catch((e) => console.warn('Audio play sync error:', e));
      } else if (!targetState && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    }
  }, [playbackState]);

  // Listen for WebSockets room_ended event to notify fans and redirect
  useEffect(() => {
    if (isRoomEnded && !isHostOrCreator) {
      toast.error('The host has ended this live room session.', {
        id: 'room-ended-notification',
        duration: 5000,
      });
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      setTimeout(() => {
        router.push('/rooms');
      }, 1500);
    }
  }, [isRoomEnded, isHostOrCreator, router]);

  // Handle Sending Chat Messages over WebSockets
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    // Broadcast over WebSockets
    if (typeof emitSendMessage === 'function') {
      emitSendMessage(chatMessage.trim(), 'text');
    }
    setChatMessage('');
  };

  // Handle Floating Emoji Reactions (💜, 🔥, 💯, 🚀, 👋)
  const triggerReaction = (emoji: string) => {
    const reaction = {
      id: Date.now(),
      emoji,
      left: Math.floor(Math.random() * 70) + 15,
    };
    if (typeof setFloatingReactions === 'function') {
      setFloatingReactions(prev => [...prev, reaction]);
      setTimeout(() => {
        setFloatingReactions(prev => prev.filter(r => r.id !== reaction.id));
      }, 2500);
    }
  };



  // Browser Microphone & WebAudio WebRTC Live Voice Streaming State
  const [isMicActive, setIsMicActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  function handleVoiceStreamReceived(data: { userId: number; audioData: string }) {
    if (!data.audioData) return;
    try {
      const audio = new Audio(data.audioData);
      audio.volume = 1.0;
      audio.play().catch(e => console.warn('Voice chunk playback notice:', e));
    } catch (e) {
      console.warn('Voice stream playback decode error:', e);
    }
  }

  const toggleMicrophone = async () => {
    if (isMicActive) {
      if (mediaRecorderRef.current) {
        try { mediaRecorderRef.current.stop(); } catch (e) {}
        mediaRecorderRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setIsMicActive(false);
      setAudioLevel(0);
      if (typeof emitToggleMute === 'function') {
        emitToggleMute(true);
      }
      toast.success('Microphone muted');
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        const checkAudioLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          const sum = dataArray.reduce((acc, val) => acc + val, 0);
          const average = sum / dataArray.length;
          setAudioLevel(average);
          animFrameRef.current = requestAnimationFrame(checkAudioLevel);
        };

        checkAudioLevel();

        // Initialize MediaRecorder for WebSockets voice chunk streaming to all room listeners
        try {
          let mimeType = 'audio/webm;codecs=opus';
          if (!MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
          }
          const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = async (event) => {
            if (event.data && event.data.size > 0) {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64data = reader.result as string;
                if (base64data && typeof emitVoiceStream === 'function') {
                  emitVoiceStream(base64data);
                }
              };
              reader.readAsDataURL(event.data);
            }
          };

          mediaRecorder.start(250);
        } catch (recErr) {
          console.warn('MediaRecorder voice stream notice:', recErr);
        }

        setIsMicActive(true);
        if (typeof emitToggleMute === 'function') {
          emitToggleMute(false);
        }
        toast.success('Microphone active - You are live on stage!');
      } catch (err) {
        console.error('Microphone access error:', err);
        toast.error('Could not access microphone');
      }
    }
  };

  const handleEndRoom = async () => {
    if (isHostOrCreator) {
      if (confirm('Are you sure you want to end this live room for all participants?')) {
        try {
          if (typeof emitEndRoom === 'function') {
            emitEndRoom();
          }
          await apiFetch(`/api/rooms/${roomId}/end`, { method: 'POST' });
        } catch (err) {
          console.warn('Backend end room warning:', err);
        } finally {
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
          }
          toast.success('Room session ended');
          router.push('/dashboard/rooms');
        }
      }
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      toast.success('Left listening room');
      router.push('/rooms');
    }
  };

  // Derive real stage speakers and listeners from WebSockets/DB participants
  const normalizedParticipants = (participants || []).map(p => {
    if (room?.host_id && String(p.user_id) === String(room.host_id)) {
      return { ...p, role: 'host' as const, display_name: p.display_name || room?.host_name };
    }
    // Guarantee non-host users cannot hold host role
    return { ...p, role: (p.role === 'host' ? 'listener' : p.role) || 'listener' };
  });

  const stageSpeakers = normalizedParticipants.filter(p => p.role === 'host' || p.role === 'cohost' || p.role === 'speaker');
  const roomListeners = normalizedParticipants.filter(p => p.role === 'listener' && String(p.user_id) !== String(room?.host_id));

  // Fallback to room host if stage speakers state is initializing
  const displaySpeakers = stageSpeakers.length > 0 ? stageSpeakers : [
    {
      user_id: room?.host_id || -1,
      display_name: room?.host_name || 'Creator Host',
      username: room?.host_username || 'host',
      avatar_url: room?.host_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: 'host' as const,
      is_muted: false,
    }
  ];

  const handleMuteAll = () => {
    if (!isHostOrCreator) {
      toast.error('Only the room host can mute all speakers');
      return;
    }
    if (isMicActive) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      setIsMicActive(false);
      setAudioLevel(0);
    }
    setParticipants(prev => prev.map(p => ({ ...p, is_muted: true })));
    toast.success('Muted all stage speakers');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-['Space_Grotesk',sans-serif] flex flex-col overflow-x-hidden">
      {/* ── LIVE AUDIO STREAM ENGINE ── */}
      <audio
        ref={audioRef}
        src={resolveIpfsUrl(currentTrack?.audio_url || currentTrack?.url || room?.current_track_audio)}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTimeMs(0);
        }}
        onTimeUpdate={(e) => {
          const target = e.currentTarget;
          if (target && target.currentTime) {
            setCurrentTimeMs(Math.floor(target.currentTime * 1000));
          }
        }}
        onLoadedMetadata={(e) => {
          const target = e.currentTarget;
          if (target && target.duration && !isNaN(target.duration)) {
            setDurationMs(Math.floor(target.duration * 1000));
          }
        }}
        className="hidden"
      />
      
      {/* ── TOP HEADER BAR (Figma Spec) ── */}
      <header className="h-[76px] px-6 sm:px-10 border-b border-[#232B3E] bg-[#0F172A]/90 backdrop-blur-md flex items-center justify-between z-30">
        
        {/* Left: Live Status Badges */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push(isHostOrCreator ? '/dashboard/rooms' : '/rooms')}
            className="p-2 text-zinc-400 hover:text-white rounded-lg bg-[#192134] border border-[#2D3548] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Frame 102: LIVE NOW Red Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#FF0044]/10 border border-[#FF0044]/30 text-[#FF0044] text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#FF0044] animate-ping" />
            <span>LIVE NOW</span>
          </div>

          {/* Frame 103: Listener Count */}
          <div className="hidden sm:flex items-center gap-2 text-zinc-400 text-xs font-medium">
            <Users size={16} className="text-zinc-400" />
            <span>{roomListeners.length} {roomListeners.length === 1 ? 'listener' : 'listeners'}</span>
          </div>
        </div>

        {/* Center: Room Title */}
        <h1 className="font-['Clash_Display',sans-serif] text-lg sm:text-2xl font-bold text-white tracking-wide truncate max-w-md text-center">
          {room?.title || 'Midnight Lo-Fi & Crypto Talk'}
        </h1>

        {/* Right: End Room & Share Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="px-4 py-2.5 bg-[#8A2BE2] hover:bg-[#7823c9] text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(138,43,226,0.4)] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 size={15} />
            <span>Invite & Share</span>
          </button>

          <button
            onClick={handleEndRoom}
            className="px-5 py-2.5 bg-[#FF0044] hover:bg-[#d60039] text-white font-bold text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(255,0,68,0.4)] flex items-center gap-1.5 cursor-pointer"
          >
            <PhoneOff size={15} />
            <span>{isHostOrCreator ? 'End Room' : 'Leave Room'}</span>
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT GRID (1512px Figma Layout) ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 max-w-[1600px] mx-auto w-full">
        
        {/* ── LEFT COLUMN (4 Cols): CURRENT PLAYING TRACK & PLAYER CONTROLS ── */}
        <div className="lg:col-span-4 flex flex-col items-center space-y-6 bg-[#0F172A] p-6 rounded-3xl border border-[#232B3E]">
          
          {/* Rectangle 6: Album Artwork (320x320px) */}
          <div className="relative group w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden border border-[#232B3E] shadow-xl bg-[#192134]">
            <img
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              src={
                resolveIpfsUrl(
                  currentTrack?.cover_url ||
                  currentTrack?.cover_image ||
                  currentTrack?.image ||
                  room?.current_track_cover ||
                  room?.cover_url ||
                  room?.cover_image ||
                  room?.image_url ||
                  room?.cover ||
                  room?.host_avatar ||
                  room?.avatar_url
                ) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(room?.host_name || room?.host_username || room?.title || 'Creator')}`
              }
              alt="Room Cover Artwork"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                const target = e.currentTarget;
                const fallback = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(room?.host_name || room?.host_username || room?.title || 'Creator')}`;
                if (target.src !== fallback) {
                  target.src = fallback;
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-80 pointer-events-none" />
            
            {/* Playing Badge */}
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest text-[#00FF85] flex items-center gap-1.5 z-10">
              <span className="w-2 h-2 rounded-full bg-[#00FF85] animate-ping" />
              <span>{isPlaying ? 'NOW STREAMING' : 'AUDIO PAUSED'}</span>
            </div>
          </div>

          {/* Track Info */}
          <div className="text-center space-y-1 w-full max-w-[320px]">
            <h2 className="font-['Clash_Display',sans-serif] text-xl font-bold text-white tracking-wide truncate">
              {currentTrack?.title || room?.current_track_title || room?.title || 'Midnight Afrobeat Stems'}
            </h2>
            <p className="text-xs text-zinc-400 font-medium truncate">
              {currentTrack?.artist_name || room?.current_track_artist || room?.host_name || 'Creator Host'}
            </p>
          </div>

          {/* Media Player Controls (Play / Pause) - Creator Only */}
          <div className="flex items-center justify-center gap-6 pt-2">
            <button 
              onClick={() => {
                if (!isHostOrCreator) {
                  toast.error('Only room creators can play or pause the live stream sound');
                  return;
                }
                const nextState = !isPlaying;
                setIsPlaying(nextState);
                if (audioRef.current) {
                  const targetSrc = resolveIpfsUrl(currentTrack?.audio_url || currentTrack?.url || room?.current_track_audio);
                  if (targetSrc && audioRef.current.src !== targetSrc) {
                    audioRef.current.src = targetSrc;
                  }
                  if (nextState) audioRef.current.play().catch(e => console.warn(e));
                  else audioRef.current.pause();
                }
                emitPlaybackControl(nextState ? 'play' : 'pause', currentTrack?.id || room?.current_track_id, currentTimeMs, currentTrack);
              }}
              className={`w-16 h-16 rounded-full text-white flex items-center justify-center transition-all shadow-[0_0_25px_rgba(138,43,226,0.6)] cursor-pointer hover:scale-105 active:scale-95 ${
                isHostOrCreator ? 'bg-[#8A2BE2] hover:bg-[#7823c9]' : 'bg-zinc-700/60 opacity-60 cursor-not-allowed'
              }`}
            >
              {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
            </button>
          </div>

          {/* Timecode & Progress Slider */}
          <div className="w-full max-w-[320px] space-y-2">
            <div className="relative w-full h-1.5 bg-[#CACACA]/30 rounded-full overflow-hidden cursor-pointer">
              <div 
                className="h-full bg-[#8A2BE2] rounded-full transition-all duration-200" 
                style={{ width: `${durationMs > 0 ? Math.min(100, (currentTimeMs / durationMs) * 100) : 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-[#CACACA]">
              <span>
                {(() => {
                  const sec = Math.floor((currentTimeMs || 0) / 1000);
                  const m = Math.floor(sec / 60);
                  const s = sec % 60;
                  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                })()}
              </span>
              <span>
                {(() => {
                  if (!durationMs) return '00:00';
                  const sec = Math.floor(durationMs / 1000);
                  const m = Math.floor(sec / 60);
                  const s = sec % 60;
                  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                })()}
              </span>
            </div>
          </div>

          {/* Additional Player Actions (Upload, Playlist) - Creator Only */}
          {isHostOrCreator && (
            <div className="flex items-center justify-between w-full max-w-[320px] pt-4 border-t border-[#232B3E] text-[#CACACA]">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAudioUpload} 
                accept="audio/*,.mp3,.wav,.m4a,.flac" 
                className="hidden" 
              />

              <button 
                onClick={triggerFileUpload}
                disabled={isUploadingTrack}
                className="hover:text-white transition-colors bg-[#8A2BE2] hover:bg-[#7823c9] text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-[0_0_15px_rgba(138,43,226,0.4)] cursor-pointer disabled:opacity-50"
              >
                {isUploadingTrack ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                <span>Upload Audio</span>
              </button>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsPlaylistModalOpen(true)}
                  className="hover:text-accent-purple transition-colors p-2 cursor-pointer bg-[#192134] border border-[#2D3548] rounded-xl flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white"
                >
                  <ListMusic size={15} className="text-accent-purple" />
                  <span>Playlist</span>
                </button>
              </div>
            </div>
          )}

          {/* Fan Action Toolbar (Raise Hand, Tip Creator) - Fan Only */}
          {!isHostOrCreator && (
            <div className="flex items-center justify-between w-full max-w-[320px] pt-4 border-t border-[#232B3E] text-[#CACACA]">
              <button
                onClick={() => {
                  if (typeof emitRaiseHand === 'function') {
                    emitRaiseHand();
                    toast.success('Hand raised - Host notified!');
                  }
                }}
                className="bg-[#192134] hover:bg-[#8A2BE2]/20 border border-[#2D3548] hover:border-[#8A2BE2] text-white px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                <Hand size={15} className="text-[#00FF85]" />
                <span>Raise Hand</span>
              </button>

              <button
                onClick={() => {
                  toast.success(`Support ${room?.host_name || 'Creator'} with a Tip!`, { icon: '💜' });
                }}
                className="bg-gradient-to-r from-[#8A2BE2] to-[#FF0044] hover:opacity-90 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(138,43,226,0.4)]"
              >
                <Sparkles size={15} />
                <span>Tip Host</span>
              </button>
            </div>
          )}

        </div>

        {/* ── CENTER COLUMN (4 Cols): ON STAGE & LIVE LISTENERS GRID ── */}
        <div className="lg:col-span-4 flex flex-col space-y-8">
          
          {/* ON STAGE SECTION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#CACACA]">
                ON STAGE
              </h3>
              {isHostOrCreator && (
                <button 
                  onClick={handleMuteAll}
                  className="flex items-center gap-1.5 text-xs font-bold text-accent-purple hover:underline cursor-pointer"
                >
                  <MicOff size={14} />
                  <span>Mute All</span>
                </button>
              )}
            </div>

            {/* Stage Speakers Grid */}
            <div className="flex items-center gap-6 overflow-x-auto pb-2">
              {displaySpeakers.map((speaker: any, idx: number) => {
                const isCurrentUser = Boolean(
                  speaker.user_id && 
                  currentUserId && 
                  String(speaker.user_id) === String(currentUserId) && 
                  (isRoomHost || speaker.role === 'host' || speaker.role === 'cohost' || speaker.role === 'speaker')
                );
                const activeMute = isCurrentUser ? !isMicActive : (speaker.is_muted || speaker.isMuted);

                return (
                  <div 
                    key={idx} 
                    onClick={isCurrentUser ? toggleMicrophone : undefined}
                    className={`flex flex-col items-center gap-2 group ${isCurrentUser ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className={`relative w-16 h-16 rounded-full p-1 border-2 transition-all duration-150 ${isCurrentUser && isMicActive && audioLevel > 10 ? 'border-[#00FF85] shadow-[0_0_25px_rgba(0,255,133,0.8)] scale-110' : 'border-[#4E0AA6] shadow-[0_0_15px_rgba(78,10,166,0.5)]'}`}>
                      <img
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        src={speaker.avatar_url || speaker.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${speaker.display_name || speaker.username || 'Speaker'}`}
                        alt={speaker.display_name || speaker.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[#0F172A] flex items-center justify-center transition-colors ${activeMute ? 'bg-[#FF0044] text-white' : 'bg-[#00FF85] text-black font-bold'}`}>
                        {activeMute ? <MicOff size={12} /> : <Mic size={12} />}
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-xs font-bold text-white group-hover:text-accent-purple transition-colors flex items-center justify-center gap-1">
                        <span>{speaker.display_name || speaker.name}</span>
                        {isCurrentUser && isMicActive && audioLevel > 10 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF85] animate-ping" />
                        )}
                      </p>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        speaker.role === 'host' || String(speaker.user_id) === String(room?.host_id)
                          ? 'text-[#8A2BE2] bg-[#8A2BE2]/10 border-[#8A2BE2]/30'
                          : (speaker.user_role === 'creator' || speaker.role === 'speaker' || speaker.role === 'cohost')
                          ? 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30'
                          : 'text-zinc-400 bg-zinc-800 border-zinc-700'
                      }`}>
                        {speaker.role === 'host' || String(speaker.user_id) === String(room?.host_id)
                          ? 'HOST'
                          : (speaker.user_role === 'creator' || speaker.role === 'speaker')
                          ? 'CREATOR'
                          : 'FAN'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Add Co-Host Slot */}
              <div 
                onClick={() => setIsInviteModalOpen(true)}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-[#192134] border border-dashed border-[#2D3548] group-hover:border-[#8A2BE2] flex items-center justify-center text-zinc-400 group-hover:text-accent-purple transition-colors shadow-[0_0_15px_rgba(138,43,226,0.2)]">
                  <Plus size={20} />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 group-hover:text-white transition-colors">Invite</span>
              </div>
            </div>
          </div>

          {/* LISTENERS GRID */}
          <div className="flex-1 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#CACACA]">
              LISTENERS ({roomListeners.length > 0 ? roomListeners.length : (room?.active_listeners || 1)})
            </h3>

            {/* Listener Avatar Cards Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-4 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
              {roomListeners.length > 0 ? (
                roomListeners.map((listener: any, i: number) => {
                  const isCurrentFan = Boolean(listener.user_id && currentUserId && String(listener.user_id) === String(currentUserId));
                  const fanActiveMute = isCurrentFan ? !isMicActive : (listener.is_muted || listener.isMuted);

                  return (
                    <div 
                      key={i} 
                      onClick={isCurrentFan ? toggleMicrophone : undefined}
                      className={`flex flex-col items-center gap-1.5 group ${isCurrentFan ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <div className={`relative w-14 h-14 rounded-full border-2 p-0.5 transition-all ${isCurrentFan && isMicActive && audioLevel > 10 ? 'border-[#00FF85] shadow-[0_0_20px_rgba(0,255,133,0.8)]' : 'border-[#4E0AA6]/50 bg-[#192134]'}`}>
                        <img
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                          src={listener.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${listener.display_name || listener.username || i}`}
                          alt={listener.display_name || listener.username}
                          className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#0F172A] flex items-center justify-center transition-colors ${fanActiveMute ? 'bg-[#FF0044] text-white' : 'bg-[#00FF85] text-black font-bold'}`}>
                          {fanActiveMute ? <MicOff size={10} /> : <Mic size={10} />}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-white truncate max-w-[70px] text-center">
                        {listener.display_name || listener.username}
                      </span>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                        listener.user_role === 'creator'
                          ? 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20'
                          : 'text-zinc-400 bg-zinc-800/80 border-zinc-700/50'
                      }`}>
                        {listener.user_role === 'creator' ? 'CREATOR' : 'FAN'}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-4 py-8 text-center bg-[#0F172A]/40 rounded-2xl border border-[#232B3E]">
                  <p className="text-xs text-zinc-400 font-medium">Be the first listener to join this room!</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN (4 Cols): CHAT & FLOATING EMOJI REACTIONS (Frame 99) ── */}
        <div className="lg:col-span-4 relative bg-[#192134] border border-[#232B3E] rounded-3xl overflow-hidden flex flex-col h-[740px] shadow-2xl">
          
          {/* Header Tabs: Chat vs Activity */}
          <div className="h-[56px] bg-[#232B3E] flex items-center border-b border-[#2D3548]">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 h-full font-bold text-sm flex items-center justify-center transition-colors relative ${activeTab === 'chat' ? 'text-accent-purple' : 'text-zinc-400 hover:text-white'}`}
            >
              <span>Chat</span>
              {activeTab === 'chat' && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#8A2BE2]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 h-full font-bold text-sm flex items-center justify-center transition-colors relative ${activeTab === 'activity' ? 'text-accent-purple' : 'text-zinc-400 hover:text-white'}`}
            >
              <span>Activity</span>
              {activeTab === 'activity' && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#8A2BE2]" />
              )}
            </button>

            <button
              onClick={() => setIsChatLocked(!isChatLocked)}
              className="px-4 text-accent-purple hover:text-white transition-colors flex items-center gap-1 text-xs font-bold"
            >
              {isChatLocked ? <Lock size={16} /> : <Unlock size={16} />}
              <span>{isChatLocked ? 'Locked' : 'Lock Chat'}</span>
            </button>
          </div>

          {/* Chat Stream Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.length > 0 ? (
              messages.map((msg: any, i: number) => (
                <div
                  key={msg.id || i}
                  className={`p-3 rounded-xl transition-all ${msg.role === 'host' || msg.isHost ? 'bg-[#8A2BE2]/10 border border-[#8A2BE2]/30' : 'bg-[#0F172A]/50 border border-transparent'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${msg.role === 'host' || msg.isHost ? 'text-accent-purple' : 'text-[#E5E5E5]'}`}>
                      {msg.display_name || msg.username || msg.name || 'User'}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (msg.time || 'Live')}
                    </span>
                  </div>
                  <p className="text-sm font-normal text-white leading-relaxed">
                    {msg.content || msg.text}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-zinc-400">
                <MessageSquare className="w-10 h-10 mb-2 text-[#8A2BE2]/50" />
                <p className="text-xs font-bold text-white mb-1">No Messages Yet</p>
                <p className="text-[11px] text-zinc-400">Be the first to say hello in this live room!</p>
              </div>
            )}
          </div>

          {/* Floating Emoji Stream Canvas */}
          <div className="absolute inset-x-0 bottom-24 h-48 pointer-events-none overflow-hidden">
            {floatingReactions.map(r => (
              <div
                key={r.id}
                style={{ left: `${r.left}%` }}
                className="absolute bottom-0 text-3xl animate-bounce duration-1000 opacity-90 transition-all"
              >
                {r.emoji}
              </div>
            ))}
          </div>

          {/* Floating Emoji Bar (Frame 136: 💜 🔥 💯 🚀 👋) */}
          <div className="px-4 py-2 bg-[#0F172A]/60 backdrop-blur-md border-t border-[#2D3548] flex items-center justify-center gap-3">
            {['💜', '🔥', '💯', '🚀', '👋'].map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => triggerReaction(emoji)}
                className="text-2xl hover:scale-125 transition-transform p-1 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Footer Input Bar */}
          <form onSubmit={handleSendMessage} className="p-4 bg-[#0F172A] border-t border-[#2D3548] flex items-center gap-3">
            <input
              type="text"
              placeholder={isChatLocked ? 'Chat locked by host' : 'Say something...'}
              disabled={isChatLocked}
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="flex-1 bg-[#192134] border border-[#2D3548] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#8A2BE2]"
            />
            <button
              type="submit"
              disabled={isChatLocked || !chatMessage.trim()}
              className="w-11 h-11 bg-[#8A2BE2] hover:bg-[#7823c9] text-white rounded-xl flex items-center justify-center transition-all shadow-[0_0_15px_rgba(138,43,226,0.5)] disabled:opacity-40 cursor-pointer"
            >
              <Send size={18} />
            </button>
          </form>

        </div>
      </div>

      {/* ── ROOM PLAYLIST / LIBRARY TRACK SELECTOR MODAL (Creator Only) ── */}
      {isPlaylistModalOpen && isHostOrCreator && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-[#232B3E] rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#2D3548] pb-4">
              <div className="flex items-center gap-3">
                <ListMusic className="text-accent-purple w-6 h-6" />
                <div>
                  <h3 className="font-['Clash_Display',sans-serif] text-xl font-bold text-white">
                    Select Track from Library
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium">Choose a track to stream live in this room</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={triggerFileUpload}
                  disabled={isUploadingTrack}
                  className="px-3.5 py-2 bg-[#8A2BE2] hover:bg-[#7823c9] text-white font-bold text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(138,43,226,0.4)] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isUploadingTrack ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  <span>Upload Audio</span>
                </button>

                <button 
                  onClick={() => setIsPlaylistModalOpen(false)}
                  className="text-zinc-400 hover:text-white p-2 rounded-lg bg-[#192134] border border-[#2D3548] cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Search Library Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search tracks in your library..."
                value={playlistSearchQuery}
                onChange={(e) => setPlaylistSearchQuery(e.target.value)}
                className="w-full bg-[#192134] border border-[#2D3548] focus:border-[#8A2BE2] rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Track List */}
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
              {libraryTracks.filter((t: any) => {
                const q = playlistSearchQuery.trim().toLowerCase();
                if (!q) return true;
                return (t.title || '').toLowerCase().includes(q) || (t.artist_name || t.creator || '').toLowerCase().includes(q);
              }).length > 0 ? (
                libraryTracks
                  .filter((t: any) => {
                    const q = playlistSearchQuery.trim().toLowerCase();
                    if (!q) return true;
                    return (t.title || '').toLowerCase().includes(q) || (t.artist_name || t.creator || '').toLowerCase().includes(q);
                  })
                  .map((track: any) => (
                    <div
                      key={track.id}
                      onClick={() => {
                        setCurrentTrack(track);
                        setIsPlaying(true);
                        if (audioRef.current && (track.audio_url || track.url)) {
                          const resolvedSrc = resolveIpfsUrl(track.audio_url || track.url);
                          if (resolvedSrc) {
                            audioRef.current.src = resolvedSrc;
                            audioRef.current.play().catch(e => console.warn('Audio playback error:', e));
                          }
                        }
                        emitPlaybackControl('play', track.id, 0, track);
                        setIsPlaylistModalOpen(false);
                        toast.success(`Now streaming live: ${track.title}`);
                      }}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer group ${currentTrack?.id === track.id ? 'bg-[#8A2BE2]/15 border-[#8A2BE2]' : 'bg-[#192134] border-[#2D3548] hover:border-[#8A2BE2]'}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                          src={track.cover_url || track.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80'}
                          alt={track.title}
                          className="w-12 h-12 rounded-xl object-cover border border-[#2D3548] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white group-hover:text-accent-purple truncate transition-colors">{track.title}</p>
                          <p className="text-xs text-zinc-400 truncate">{track.artist_name || track.creator || 'Creator'}</p>
                        </div>
                      </div>

                      <button
                        className="px-4 py-2 bg-[#8A2BE2] hover:bg-[#7823c9] text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(138,43,226,0.4)] flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Play size={14} fill="currentColor" />
                        <span>Play in Room</span>
                      </button>
                    </div>
                  ))
              ) : (
                <div className="text-center py-10 bg-[#192134] rounded-2xl border border-[#2D3548] p-6">
                  <ListMusic className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-white mb-1">No Uploaded Tracks</p>
                  <p className="text-xs text-zinc-400 mb-4">Upload an audio file from your device to stream it live right now.</p>
                  <button
                    onClick={triggerFileUpload}
                    disabled={isUploadingTrack}
                    className="px-5 py-2.5 bg-[#8A2BE2] hover:bg-[#7823c9] text-white font-bold text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(138,43,226,0.4)] inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isUploadingTrack ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    <span>Select Audio File from Device</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ROOM INVITE & SHARE MODAL ── */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-[#232B3E] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#2D3548] pb-4">
              <div className="flex items-center gap-3">
                <Share2 className="text-accent-purple w-6 h-6" />
                <div>
                  <h3 className="font-['Clash_Display',sans-serif] text-xl font-bold text-white">
                    Invite Creators & Friends
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium">Search creators or copy live room link</p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsInviteModalOpen(false)}
                className="text-zinc-400 hover:text-white p-2 rounded-lg bg-[#192134] border border-[#2D3548] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Copy Live Room Link Section */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Share Live Room Link
              </label>
              <div className="flex items-center gap-2 bg-[#192134] border border-[#2D3548] rounded-2xl p-2 pl-4">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== 'undefined' ? window.location.href : `https://www.groovelinetwork.com/rooms/${roomId}`}
                  className="flex-1 bg-transparent text-xs text-zinc-300 font-mono focus:outline-none truncate select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${isCopied ? 'bg-[#00FF85] text-black' : 'bg-[#8A2BE2] hover:bg-[#7823c9] text-white shadow-[0_0_15px_rgba(138,43,226,0.4)]'}`}
                >
                  {isCopied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{isCopied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Search Creator Input */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Search Platform Creators to Invite
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by creator name or @username..."
                  value={inviteSearchQuery}
                  onChange={(e) => setInviteSearchQuery(e.target.value)}
                  className="w-full bg-[#192134] border border-[#2D3548] focus:border-[#8A2BE2] rounded-2xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Creator Search Results List */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                {inviteCreators
                  .filter((c: any) => {
                    const q = inviteSearchQuery.trim().toLowerCase().replace(/^@/, '');
                    if (!q) return true;
                    return (c.display_name || c.name || '').toLowerCase().includes(q) || (c.username || '').toLowerCase().includes(q);
                  })
                  .map((creator: any) => {
                    const isInvited = invitedUsers.includes(creator.id);
                    return (
                      <div
                        key={creator.id}
                        className="p-3 bg-[#192134] border border-[#2D3548] rounded-2xl flex items-center justify-between gap-3 transition-colors hover:border-zinc-500"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                            src={creator.avatar_url || creator.profile_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                            alt={creator.display_name || creator.name}
                            className="w-9 h-9 rounded-full object-cover border border-[#2D3548] shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{creator.display_name || creator.name || 'Platform Creator'}</p>
                            <p className="text-[10px] text-zinc-400 font-mono">@{creator.username || `creator${creator.id}`}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSendInvite(creator)}
                          disabled={isInvited}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${isInvited ? 'bg-[#232B3E] text-zinc-400 cursor-default' : 'bg-[#8A2BE2] hover:bg-[#7823c9] text-white shadow-[0_0_12px_rgba(138,43,226,0.3)]'}`}
                        >
                          {isInvited ? <Check size={12} /> : <Plus size={12} />}
                          <span>{isInvited ? 'Invited' : 'Invite'}</span>
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
