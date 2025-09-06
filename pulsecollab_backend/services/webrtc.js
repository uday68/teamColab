// WebRTC service utilities
export class WebRTCService {
  constructor() {
    this.rooms = new Map();
    this.connections = new Map();
  }

  // ICE servers configuration (you can add TURN servers for production)
  getIceServers() {
    return [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ];
  }

  // Create or join a room
  joinRoom(roomId, userId, userInfo) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        participants: new Map(),
        createdAt: new Date(),
        settings: {
          maxParticipants: 50,
          allowScreenShare: true,
          allowChat: true,
          recordingEnabled: false
        }
      });
    }

    const room = this.rooms.get(roomId);
    const participant = {
      id: userId,
      ...userInfo,
      joinedAt: new Date(),
      isHost: room.participants.size === 0,
      status: 'joined'
    };

    room.participants.set(userId, participant);
    return { room, participant };
  }

  // Leave room
  leaveRoom(roomId, userId) {
    if (!this.rooms.has(roomId)) return null;
    
    const room = this.rooms.get(roomId);
    const participant = room.participants.get(userId);
    
    if (participant) {
      room.participants.delete(userId);
      
      // Clean up empty rooms
      if (room.participants.size === 0) {
        this.rooms.delete(roomId);
      }
      
      return { room, participant };
    }
    
    return null;
  }

  // Get room info
  getRoomInfo(roomId) {
    return this.rooms.get(roomId) || null;
  }

  // Update participant status
  updateParticipant(roomId, userId, updates) {
    if (!this.rooms.has(roomId)) return null;
    
    const room = this.rooms.get(roomId);
    const participant = room.participants.get(userId);
    
    if (participant) {
      Object.assign(participant, updates);
      return participant;
    }
    
    return null;
  }

  // Get all active rooms
  getAllRooms() {
    return Array.from(this.rooms.values());
  }

  // Room statistics
  getRoomStats(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    return {
      id: roomId,
      participantCount: room.participants.size,
      duration: Date.now() - room.createdAt.getTime(),
      participants: Array.from(room.participants.values()),
      settings: room.settings
    };
  }
}

export const webrtcService = new WebRTCService();
