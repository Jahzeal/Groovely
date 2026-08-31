import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface RoomParticipant {
  user_id: number;
  display_name: string;
  username: string;
  avatar_url?: string;
  wallet?: string;
  role: 'host' | 'cohost' | 'speaker' | 'listener';
  is_hand_raised?: boolean;
  is_muted?: boolean;
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

export const useRoomSocket = (roomId?: string | number, userId?: number | null, initialRole: string = 'listener') => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [playbackState, setPlaybackState] = useState<PlaybackSyncData | null>(null);
  const [isRoomEnded, setIsRoomEnded] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Connect to NestJS WebSockets Gateway namespace /rooms
    const socket = io(`${API_URL}/rooms`, {
      transports: ['polling', 'websocket'],
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      if (userId) {
        socket.emit('join_room', { roomId: Number(roomId), userId, role: initialRole });
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen for room events
    socket.on('user_joined', (data: any) => {
      if (data.participants && Array.isArray(data.participants)) {
        setParticipants(data.participants);
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
        setParticipants(prev => prev.filter(p => Number(p.user_id) !== leftId));
      }
    });

    socket.on('playback_synced', (data: PlaybackSyncData) => {
      setPlaybackState(data);
    });

    socket.on('new_message', (msg: RoomMessage) => {
      setMessages(prev => [...prev, msg]);
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

    socket.on('room_ended', () => {
      setIsRoomEnded(true);
    });

    return () => {
      if (userId) {
        socket.emit('leave_room', { roomId: Number(roomId), userId });
      }
      socket.disconnect();
    };
  }, [roomId, userId]);

  // Dynamically re-sync join_room role whenever initialRole is determined (e.g. Host ID fetched)
  useEffect(() => {
    if (socketRef.current && isConnected && userId && initialRole) {
      socketRef.current.emit('join_room', { roomId: Number(roomId), userId, role: initialRole });
    }
  }, [roomId, userId, initialRole, isConnected]);

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

  return {
    socket: socketRef.current,
    isConnected,
    participants,
    setParticipants,
    messages,
    setMessages,
    playbackState,
    isRoomEnded,
    emitPlaybackControl,
    emitSendMessage,
    emitRaiseHand,
    emitSetParticipantRole,
    emitEndRoom,
  };
};
