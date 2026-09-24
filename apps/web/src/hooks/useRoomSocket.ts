import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';

export interface RoomParticipant {
  user_id: number;
  display_name: string;
  username: string;
  avatar_url?: string;
  wallet?: string;
  role: 'host' | 'cohost' | 'speaker' | 'listener';
  is_hand_raised?: boolean;
  is_muted?: boolean;
  isMuted?: boolean;
}

export interface RoomMessage {
  id: number;
  room_id: number;
  user_id: number;
  display_name: string;
  username: string;
  avatar_url?: string;
  content: string;
  message_type: 'text' | 'reaction' | 'system' | 'tip';
  metadata?: any;
  created_at: string;
}

export interface PlaybackSyncData {
  roomId: number;
  action: 'play' | 'pause' | 'seek';
  state: 'playing' | 'paused';
  current_track_id?: number;
  positionMs: number;
  timestamp: number;
}

export const useRoomSocket = (
  roomId?: string | number, 
  userId?: number | null, 
  initialRole: string = 'listener',
  onVoiceStreamReceived?: (data: { userId: number; audioData: string; sampleRate?: number }) => void,
  webRtcCallbacks?: {
    onWebRTCOffer?: (data: { senderId: number; targetUserId?: number; sdp: any }) => void;
    onWebRTCAnswer?: (data: { senderId: number; targetUserId?: number; sdp: any }) => void;
    onWebRTCIceCandidate?: (data: { senderId: number; targetUserId?: number; candidate: any }) => void;
  }
) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [playbackState, setPlaybackState] = useState<PlaybackSyncData | null>(null);
  const [isRoomEnded, setIsRoomEnded] = useState(false);
  const [isKicked, setIsKicked] = useState(false);
  const [isChatLocked, setIsChatLocked] = useState(false);

  const onVoiceStreamReceivedRef = useRef(onVoiceStreamReceived);
  useEffect(() => {
    onVoiceStreamReceivedRef.current = onVoiceStreamReceived;
  }, [onVoiceStreamReceived]);

  const userIdRef = useRef(userId);
  const initialRoleRef = useRef(initialRole);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);
  const webRtcCallbacksRef = useRef(webRtcCallbacks);
  useEffect(() => {
    webRtcCallbacksRef.current = webRtcCallbacks;
  }, [webRtcCallbacks]);

  useEffect(() => {
    if (!roomId) return;

    // Reset room-specific state on room change / mount
    setMessages([]);
    setParticipants([]);
    setPlaybackState(null);
    setIsRoomEnded(false);
    setIsKicked(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Connect to NestJS WebSockets Gateway namespace /rooms
    const socket = io(`${API_URL}/rooms`, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      if (userIdRef.current) {
        socket.emit('join_room', { roomId: Number(roomId), userId: userIdRef.current, role: initialRoleRef.current });
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen for room events
    socket.on('user_joined', (data: any) => {
      if (data.participants && Array.isArray(data.participants)) {
        setParticipants(prev => {
          const prevMuteMap = new Map(prev.map(p => [Number(p.user_id), p.is_muted ?? p.isMuted]));
          return data.participants.map((p: any) => {
            const existingMute = prevMuteMap.get(Number(p.user_id));
            const isMuted = existingMute !== undefined ? existingMute : (p.is_muted ?? p.isMuted ?? false);
            return { ...p, is_muted: isMuted, isMuted };
          });
        });
      } else if (data.participant) {
        setParticipants(prev => {
          const exists = prev.some(p => Number(p.user_id) === Number(data.participant.user_id));
          if (exists) {
            return prev.map(p => Number(p.user_id) === Number(data.participant.user_id) ? { ...p, ...data.participant } : p);
          }
          return [...prev, data.participant];
        });
      } else if (data.user) {
        setParticipants(prev => {
          const exists = prev.some(p => Number(p.user_id) === Number(data.user.user_id || data.user.id));
          if (exists) return prev;
          return [...prev, {
            user_id: Number(data.user.user_id || data.user.id),
            display_name: data.user.display_name || data.user.name || 'Listener',
            username: data.user.username || 'user',
            avatar_url: data.user.avatar_url,
            role: data.role || 'listener'
          }];
        });
      }
    });

    socket.on('user_left', (data: any) => {
      if (data.participants && Array.isArray(data.participants)) {
        setParticipants(data.participants);
      } else if (data.userId || data.user_id) {
        const leftId = Number(data.userId || data.user_id);
        setParticipants(prev => {
          const leftUser = prev.find(p => Number(p.user_id) === leftId);
          if (leftUser) {
            toast(`${leftUser.display_name || leftUser.username || 'A listener'} left the room`, {
              icon: '👋',
              style: {
                background: '#0F0F23',
                color: '#A1A1AA',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '12px',
                borderRadius: '16px'
              },
              duration: 3000,
            });
          }
          return prev.filter(p => Number(p.user_id) !== leftId);
        });
      }
    });

    socket.on('playback_synced', (data: PlaybackSyncData) => {
      setPlaybackState(data);
    });

    socket.on('new_message', (msg: RoomMessage) => {
      // Only append message if it belongs to the current active room
      if (Number(msg.room_id) === Number(roomId)) {
        setMessages(prev => [...prev, msg]);
      }
    });

    socket.on('hand_raised_toggled', (data: { userId: number; isHandRaised: boolean }) => {
      setParticipants(prev => prev.map(p => {
        if (p.user_id === data.userId) {
          return { ...p, is_hand_raised: data.isHandRaised };
        }
        return p;
      }));
    });

    socket.on('participant_role_updated', (data: { targetUserId: number; newRole: any }) => {
      setParticipants(prev => prev.map(p => {
        if (p.user_id === data.targetUserId) {
          return { ...p, role: data.newRole };
        }
        return p;
      }));
    });

    socket.on('participant_mute_updated', (data: { userId: number; isMuted: boolean }) => {
      setParticipants(prev => prev.map(p => 
        Number(p.user_id) === Number(data.userId) ? { ...p, is_muted: data.isMuted, isMuted: data.isMuted } : p
      ));
    });

    socket.on('voice_stream_received', (data: { userId: number; audioData: string; sampleRate?: number }) => {
      if (onVoiceStreamReceivedRef.current) {
        onVoiceStreamReceivedRef.current(data);
      }
    });

    socket.on('chat_lock_updated', (data: { isLocked: boolean }) => {
      setIsChatLocked(data.isLocked);
    });

    socket.on('all_participants_muted', () => {
      setParticipants(prev => prev.map(p => ({ ...p, is_muted: true, isMuted: true })));
    });

    socket.on('webrtc_offer', (data: { senderId: number; targetUserId?: number; sdp: any }) => {
      if (webRtcCallbacksRef.current?.onWebRTCOffer) {
        webRtcCallbacksRef.current.onWebRTCOffer(data);
      }
    });

    socket.on('webrtc_answer', (data: { senderId: number; targetUserId?: number; sdp: any }) => {
      if (webRtcCallbacksRef.current?.onWebRTCAnswer) {
        webRtcCallbacksRef.current.onWebRTCAnswer(data);
      }
    });

    socket.on('webrtc_ice_candidate', (data: { senderId: number; targetUserId?: number; candidate: any }) => {
      if (webRtcCallbacksRef.current?.onWebRTCIceCandidate) {
        webRtcCallbacksRef.current.onWebRTCIceCandidate(data);
      }
    });

    socket.on('participant_kicked', (data: { targetUserId: number; roomId: number; participants?: any[] }) => {
      const localId = typeof window !== 'undefined'
        ? Number(localStorage.getItem('groovely_user_id') || localStorage.getItem('grooveli_user_id') || userIdRef.current)
        : Number(userIdRef.current);

      if (localId && Number(data.targetUserId) === Number(localId)) {
        setIsKicked(true);
        setMessages([]);
        setParticipants([]);
        setPlaybackState(null);
      }
      if (data.participants && Array.isArray(data.participants)) {
        setParticipants(data.participants);
      } else {
        setParticipants(prev => prev.filter(p => Number(p.user_id) !== Number(data.targetUserId)));
      }
    });

    socket.on('kicked_from_room', () => {
      setIsKicked(true);
      setMessages([]);
      setParticipants([]);
      setPlaybackState(null);
    });

    socket.on('room_ended', () => {
      setIsRoomEnded(true);
      setMessages([]);
      setParticipants([]);
      setPlaybackState(null);
    });

    return () => {
      if (userIdRef.current) {
        socket.emit('leave_room', { roomId: Number(roomId), userId: userIdRef.current });
      }
      socket.disconnect();
      setMessages([]);
      setParticipants([]);
      setPlaybackState(null);
      setIsRoomEnded(false);
      setIsKicked(false);
    };
  }, [roomId]);

  // Dynamically re-sync join_room role whenever initialRole or userId is determined
  useEffect(() => {
    if (socketRef.current && socketRef.current.connected && userId && initialRole) {
      socketRef.current.emit('join_room', { roomId: Number(roomId), userId, role: initialRole });
    }
  }, [roomId, userId, initialRole]);

  // Actions
  const emitPlaybackControl = useCallback((action: 'play' | 'pause' | 'seek', trackId?: number, positionMs: number = 0, track?: any) => {
    if (socketRef.current && roomId && userId) {
      socketRef.current.emit('playback_control', {
        roomId: Number(roomId),
        userId,
        action,
        trackId,
        track,
        positionMs,
      });
    }
  }, [roomId, userId]);

  const emitSendMessage = useCallback((content: string, messageType: string = 'text', metadata: any = {}) => {
    if (socketRef.current && roomId && userId) {
      socketRef.current.emit('send_message', {
        roomId: Number(roomId),
        userId,
        content,
        messageType,
        metadata,
      });
    }
  }, [roomId, userId]);

  const emitRaiseHand = useCallback(() => {
    if (socketRef.current && roomId && userId) {
      socketRef.current.emit('raise_hand', {
        roomId: Number(roomId),
        userId,
      });
    }
  }, [roomId, userId]);

  const emitSetParticipantRole = useCallback((targetUserId: number, newRole: 'cohost' | 'speaker' | 'listener') => {
    if (socketRef.current && roomId && userId) {
      socketRef.current.emit('set_participant_role', {
        roomId: Number(roomId),
        hostId: userId,
        targetUserId,
        newRole,
      });
    }
  }, [roomId, userId]);

  const emitEndRoom = useCallback(() => {
    if (socketRef.current && roomId && userId) {
      socketRef.current.emit('end_room', {
        roomId: Number(roomId),
        hostId: userId,
      });
    }
  }, [roomId, userId]);

  const emitToggleMute = useCallback((isMuted: boolean) => {
    if (socketRef.current && roomId && userId) {
      socketRef.current.emit('toggle_mute', {
        roomId: Number(roomId),
        userId,
        isMuted,
      });
    }
  }, [roomId, userId]);

  const emitVoiceStream = useCallback((audioData: string, sampleRate?: number) => {
    if (socketRef.current && roomId && userId) {
      socketRef.current.emit('voice_stream', {
        roomId: Number(roomId),
        userId,
        audioData,
        sampleRate,
      });
    }
  }, [roomId, userId]);

  const emitKickParticipant = useCallback((targetUserId: number) => {
    if (socketRef.current && roomId && userId) {
      socketRef.current.emit('kick_participant', {
        roomId: Number(roomId),
        hostId: userId,
        targetUserId,
      });
    }
  }, [roomId, userId]);

  const emitWebRTCOffer = useCallback((sdp: any, targetUserId?: number) => {
    if (socketRef.current && roomId && userId) {
      socketRef.current.emit('webrtc_offer', {
        roomId: Number(roomId),
        senderId: userId,
        targetUserId,
        sdp,
      });
    }
  }, [roomId, userId]);

  const emitWebRTCAnswer = useCallback((sdp: any, targetUserId?: number) => {
    if (socketRef.current && roomId && userId) {
      socketRef.current.emit('webrtc_answer', {
        roomId: Number(roomId),
        senderId: userId,
        targetUserId,
        sdp,
      });
    }
  }, [roomId, userId]);

  const emitWebRTCIceCandidate = useCallback((candidate: any, targetUserId?: number) => {
    if (socketRef.current && roomId && userId) {
      socketRef.current.emit('webrtc_ice_candidate', {
        roomId: Number(roomId),
        senderId: userId,
        targetUserId,
        candidate,
      });
    }
  }, [roomId, userId]);

  const emitToggleChatLock = useCallback((isLocked: boolean) => {
    if (socketRef.current && roomId && userId) {
      socketRef.current.emit('toggle_chat_lock', {
        roomId: Number(roomId),
        isLocked,
      });
    }
  }, [roomId, userId]);

  const emitMuteAll = useCallback(() => {
    if (socketRef.current && roomId && userId) {
      socketRef.current.emit('mute_all_participants', {
        roomId: Number(roomId),
        hostId: userId,
      });
    }
  }, [roomId, userId]);

  return {
    socket: socketRef.current,
    isConnected,
    participants,
    setParticipants,
    messages,
    setMessages,
    playbackState,
    isRoomEnded,
    isKicked,
    isChatLocked,
    setIsChatLocked,
    emitPlaybackControl,
    emitSendMessage,
    emitRaiseHand,
    emitSetParticipantRole,
    emitEndRoom,
    emitToggleMute,
    emitVoiceStream,
    emitKickParticipant,
    emitWebRTCOffer,
    emitWebRTCAnswer,
    emitWebRTCIceCandidate,
    emitToggleChatLock,
    emitMuteAll,
  };
};
