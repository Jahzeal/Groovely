'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import { Play, Pause, ExternalLink, Loader2, Volume2, VolumeX } from 'lucide-react';
import { apiFetch, resolveIpfsUrl } from '@/lib/api';

export default function EmbedTrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [track, setTrack] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function fetchTrack() {
      try {
        const res = await apiFetch(`/api/track/${id}`);
        if (res && res.ok) {
          const json = await res.json();
          const data = json.data || json;
          setTrack(data.track || data);
        }
      } catch (e) {
        console.error('Failed to load track for embed', e);
      } finally {
        setLoading(false);
      }
    }
    fetchTrack();
  }, [id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [track]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-[#070a14] text-white flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 text-accent-purple animate-spin" />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="w-full h-screen bg-[#070a14] text-zinc-500 flex items-center justify-center p-4 text-xs font-bold">
        Track not found
      </div>
    );
  }

  const audioSrc = resolveIpfsUrl(track.audio_url);
  const coverSrc = track.cover_url || 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
  const grooveliUrl = `https://grooveli.com/marketplace/${track.id}`;

  return (
    <div className="w-full h-full min-h-[140px] bg-[#090d1a] text-white p-3.5 flex flex-col justify-between select-none font-sans overflow-hidden border border-white/10 rounded-2xl shadow-xl">
      {audioSrc && (
        <audio ref={audioRef} src={audioSrc} preload="metadata" />
      )}

      {/* Top Section: Artwork + Info + Actions */}
      <div className="flex items-center gap-3">
        {/* Cover Artwork */}
        <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-lg shrink-0 border border-white/10 bg-black/40">
          <img src={coverSrc} alt={track.title} className="w-full h-full object-cover" />
          <button
            onClick={togglePlay}
            className="absolute inset-0 bg-black/40 hover:bg-black/50 flex items-center justify-center transition-all cursor-pointer group"
          >
            {isPlaying ? (
              <Pause size={18} fill="white" className="text-white drop-shadow" />
            ) : (
              <Play size={18} fill="white" className="text-white ml-0.5 drop-shadow" />
            )}
          </button>
        </div>

        {/* Title & Artist */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black text-white truncate">{track.title}</h3>
            <span className="text-[8px] font-black uppercase tracking-wider bg-accent-purple/20 text-accent-purple px-1.5 py-0.5 rounded border border-accent-purple/30 shrink-0">
              {track.category || 'Music'}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-medium truncate mt-0.5">
            {track.artist_name || track.creator_name || 'Grooveli Artist'}
          </p>
        </div>

        {/* Listen on Grooveli CTA */}
        <a
          href={grooveliUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-purple hover:bg-accent-purple/90 text-white text-[10px] font-black uppercase tracking-wider shadow-md shrink-0 transition-all hover:scale-105"
        >
          <span>Grooveli</span>
          <ExternalLink size={11} />
        </a>
      </div>

      {/* Bottom Section: Progress Scrubber Bar */}
      <div className="flex items-center gap-2.5 pt-2">
        <span className="text-[9px] font-mono text-zinc-500 w-7 text-right">
          {formatTime(currentTime)}
        </span>

        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#8A2BE2]"
        />

        <span className="text-[9px] font-mono text-zinc-500 w-7">
          {formatTime(duration)}
        </span>

        <button
          onClick={toggleMute}
          className="text-zinc-500 hover:text-white transition-colors cursor-pointer p-0.5"
        >
          {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>
      </div>
    </div>
  );
}
