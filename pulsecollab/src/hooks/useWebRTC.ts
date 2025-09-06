import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:3001';

export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface Participant extends User {
  isHost?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
  joinedAt?: Date;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: User;
  timestamp: Date;
  type?: 'text' | 'image' | 'file' | 'system';
  reactions?: Map<string, Set<string>>;
}

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(BACKEND_URL, {
      transports: ['websocket'],
      autoConnect: true
    });

    newSocket.on('connect', () => {
      console.log('Connected to server:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return { socket, isConnected };
};

export const useWebRTC = (roomId: string, user: User) => {
  const { socket } = useSocket();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreams = useRef<Map<string, MediaStream>>(new Map());

  // WebRTC configuration
  const rtcConfig: RTCConfiguration = useMemo(() => ({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  }), []);

  // Initialize local media
  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      return null;
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback((targetId: string) => {
    const pc = new RTCPeerConnection(rtcConfig);
    
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', {
          roomId,
          candidate: event.candidate,
          targetId
        });
      }
    };
    
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      remoteStreams.current.set(targetId, remoteStream);
      // Trigger re-render by updating participants
      setParticipants(prev => [...prev]);
    };
    
    pc.onconnectionstatechange = () => {
      console.log(`Connection state with ${targetId}:`, pc.connectionState);
    };
    
    peerConnections.current.set(targetId, pc);
    return pc;
  }, [socket, roomId, rtcConfig]);

  // Join room
  const joinRoom = useCallback(async () => {
    if (!socket) return;
    
    const stream = await initializeMedia();
    if (!stream) return;
    
    socket.emit('join-room', { roomId, user });
  }, [socket, roomId, user, initializeMedia]);

  // Leave room
  const leaveRoom = useCallback(() => {
    if (!socket) return;
    
    socket.emit('leave-room', { roomId });
    
    // Clean up peer connections
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();
    remoteStreams.current.clear();
    
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  }, [socket, roomId, localStream]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
        
        if (socket) {
          socket.emit('toggle-audio', {
            roomId,
            isMuted: !audioTrack.enabled
          });
        }
      }
    }
  }, [localStream, socket, roomId]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        
        if (socket) {
          socket.emit('toggle-video', {
            roomId,
            isVideoOff: !videoTrack.enabled
          });
        }
      }
    }
  }, [localStream, socket, roomId]);

  // Stop screen sharing
  const stopScreenShare = useCallback(async () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      
      peerConnections.current.forEach(async (pc) => {
        const sender = pc.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
        }
      });
    }
    
    setIsScreenSharing(false);
    
    if (socket) {
      socket.emit('stop-screen-share', { roomId });
    }
  }, [localStream, socket, roomId]);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      // Replace video track in all peer connections
      const videoTrack = screenStream.getVideoTracks()[0];
      
      peerConnections.current.forEach(async (pc) => {
        const sender = pc.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
        }
      });
      
      setIsScreenSharing(true);
      
      if (socket) {
        socket.emit('start-screen-share', { roomId });
      }
      
      // Handle screen share end
      videoTrack.onended = () => {
        stopScreenShare();
      };
      
    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  }, [socket, roomId, stopScreenShare]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleUserJoined = async (participant: Participant) => {
      console.log('User joined:', participant);
      
      if (localStream) {
        const pc = createPeerConnection(participant.id);
        
        // Add local stream to peer connection
        localStream.getTracks().forEach(track => {
          pc.addTrack(track, localStream);
        });
        
        // Create and send offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        socket.emit('offer', {
          roomId,
          offer,
          targetId: participant.id
        });
      }
    };

    const handleOffer = async ({ offer, senderId }: { offer: RTCSessionDescriptionInit, senderId: string }) => {
      if (localStream) {
        const pc = createPeerConnection(senderId);
        
        // Add local stream to peer connection
        localStream.getTracks().forEach(track => {
          pc.addTrack(track, localStream);
        });
        
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        socket.emit('answer', {
          roomId,
          answer,
          targetId: senderId
        });
      }
    };

    const handleAnswer = async ({ answer, senderId }: { answer: RTCSessionDescriptionInit, senderId: string }) => {
      const pc = peerConnections.current.get(senderId);
      if (pc) {
        await pc.setRemoteDescription(answer);
      }
    };

    const handleIceCandidate = async ({ candidate, senderId }: { candidate: RTCIceCandidate, senderId: string }) => {
      const pc = peerConnections.current.get(senderId);
      if (pc) {
        await pc.addIceCandidate(candidate);
      }
    };

    const handleUserLeft = ({ userId }: { userId: string }) => {
      console.log('User left:', userId);
      const pc = peerConnections.current.get(userId);
      if (pc) {
        pc.close();
        peerConnections.current.delete(userId);
      }
      remoteStreams.current.delete(userId);
      setParticipants(prev => prev.filter(p => p.id !== userId));
    };

    const handleRoomParticipants = (participants: Participant[]) => {
      setParticipants(participants);
    };

    const handleUserAudioToggled = ({ userId, isMuted }: { userId: string, isMuted: boolean }) => {
      setParticipants(prev => prev.map(p => 
        p.id === userId ? { ...p, isMuted } : p
      ));
    };

    const handleUserVideoToggled = ({ userId, isVideoOff }: { userId: string, isVideoOff: boolean }) => {
      setParticipants(prev => prev.map(p => 
        p.id === userId ? { ...p, isVideoOff } : p
      ));
    };

    socket.on('user-joined', handleUserJoined);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('user-left', handleUserLeft);
    socket.on('room-participants', handleRoomParticipants);
    socket.on('user-audio-toggled', handleUserAudioToggled);
    socket.on('user-video-toggled', handleUserVideoToggled);

    return () => {
      socket.off('user-joined', handleUserJoined);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('user-left', handleUserLeft);
      socket.off('room-participants', handleRoomParticipants);
      socket.off('user-audio-toggled', handleUserAudioToggled);
      socket.off('user-video-toggled', handleUserVideoToggled);
    };
  }, [socket, localStream, roomId, createPeerConnection]);

  return {
    participants,
    localStream,
    remoteStreams: remoteStreams.current,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    joinRoom,
    leaveRoom,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare
  };
};

export const useChat = (roomId: string, user: User) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  // Send message
  const sendMessage = useCallback((text: string) => {
    if (!socket || !text.trim()) return;
    
    socket.emit('send-message', {
      roomId,
      message: { text: text.trim() },
      user
    });
  }, [socket, roomId, user]);

  // Set typing status
  const setTyping = useCallback((isTyping: boolean) => {
    if (!socket) return;
    
    socket.emit('typing', { roomId, isTyping });
  }, [socket, roomId]);

  // Add reaction
  const addReaction = useCallback((messageId: string, emoji: string) => {
    if (!socket) return;
    
    socket.emit('add-reaction', { roomId, messageId, emoji });
  }, [socket, roomId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    };

    const handleTypingUpdate = ({ typingUsers }: { typingUsers: string[] }) => {
      setTypingUsers(typingUsers);
    };

    const handleReactionAdded = ({ messageId, emoji, userId, reactions }: {
      messageId: string;
      emoji: string;
      userId: string;
      reactions: Record<string, string[]>;
    }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              reactions: new Map(Object.entries(reactions).map(([k, v]) => [k, new Set(v)]))
            }
          : msg
      ));
    };

    socket.on('new-message', handleNewMessage);
    socket.on('typing-update', handleTypingUpdate);
    socket.on('reaction-added', handleReactionAdded);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('typing-update', handleTypingUpdate);
      socket.off('reaction-added', handleReactionAdded);
    };
  }, [socket]);

  return {
    messages,
    typingUsers,
    sendMessage,
    setTyping,
    addReaction
  };
};
