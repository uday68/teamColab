import { io } from 'socket.io-client';

class WebRTCService {
  constructor() {
    this.socket = null;
    this.localStream = null;
    this.peers = new Map();
    this.room = null;
    this.user = null;
    this.callbacks = {
      onUserJoined: () => {},
      onUserLeft: () => {},
      onMessage: () => {},
      onStreamAdded: () => {},
      onStreamRemoved: () => {},
      onParticipantsUpdate: () => {},
    };
  }

  // Initialize socket connection
  init(serverUrl = 'http://localhost:3002') {
    this.socket = io(serverUrl, {
      transports: ['websocket']
    });

    this.setupSocketEvents();
    return this.socket;
  }

  // Set up socket event listeners
  setupSocketEvents() {
    this.socket.on('connect', () => {
      console.log('Connected to PulseCollab server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('user-joined', (participant) => {
      console.log('User joined:', participant);
      this.callbacks.onUserJoined(participant);
    });

    this.socket.on('user-left', (data) => {
      console.log('User left:', data);
      this.removePeer(data.userId);
      this.callbacks.onUserLeft(data);
    });

    this.socket.on('room-participants', (participants) => {
      console.log('Room participants:', participants);
      this.callbacks.onParticipantsUpdate(participants);
    });

    this.socket.on('offer', async ({ offer, senderId }) => {
      await this.handleOffer(offer, senderId);
    });

    this.socket.on('answer', async ({ answer, senderId }) => {
      await this.handleAnswer(answer, senderId);
    });

    this.socket.on('ice-candidate', async ({ candidate, senderId }) => {
      await this.handleIceCandidate(candidate, senderId);
    });

    this.socket.on('new-message', (message) => {
      this.callbacks.onMessage(message);
    });

    this.socket.on('user-audio-toggled', (data) => {
      console.log('User audio toggled:', data);
    });

    this.socket.on('user-video-toggled', (data) => {
      console.log('User video toggled:', data);
    });
  }

  // Get user media
  async getUserMedia(constraints = { video: true, audio: true }) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  // Join a room
  async joinRoom(roomId, user) {
    this.room = roomId;
    this.user = user;

    // Get user media first
    await this.getUserMedia();

    // Join room via socket
    this.socket.emit('join-room', { roomId, user });
  }

  // Leave room
  leaveRoom() {
    if (this.room) {
      this.socket.emit('leave-room', { roomId: this.room });
      this.cleanup();
    }
  }

  // Create peer connection
  createPeerConnection(peerId) {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('Remote stream received from:', peerId);
      this.callbacks.onStreamAdded(peerId, event.streams[0]);
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('ice-candidate', {
          roomId: this.room,
          candidate: event.candidate,
          targetId: peerId
        });
      }
    };

    this.peers.set(peerId, peerConnection);
    return peerConnection;
  }

  // Handle WebRTC offer
  async handleOffer(offer, senderId) {
    const peerConnection = this.createPeerConnection(senderId);
    
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    this.socket.emit('answer', {
      roomId: this.room,
      answer,
      targetId: senderId
    });
  }

  // Handle WebRTC answer
  async handleAnswer(answer, senderId) {
    const peerConnection = this.peers.get(senderId);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  // Handle ICE candidate
  async handleIceCandidate(candidate, senderId) {
    const peerConnection = this.peers.get(senderId);
    if (peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  // Create offer for new peer
  async createOffer(peerId) {
    const peerConnection = this.createPeerConnection(peerId);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    this.socket.emit('offer', {
      roomId: this.room,
      offer,
      targetId: peerId
    });
  }

  // Toggle audio
  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        this.socket.emit('toggle-audio', {
          roomId: this.room,
          isMuted: !audioTrack.enabled
        });
        return !audioTrack.enabled;
      }
    }
    return false;
  }

  // Toggle video
  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        this.socket.emit('toggle-video', {
          roomId: this.room,
          isVideoOff: !videoTrack.enabled
        });
        return !videoTrack.enabled;
      }
    }
    return false;
  }

  // Send chat message
  sendMessage(text) {
    if (this.socket && this.room) {
      this.socket.emit('send-message', {
        roomId: this.room,
        message: { text },
        user: this.user
      });
    }
  }

  // Remove peer
  removePeer(peerId) {
    const peerConnection = this.peers.get(peerId);
    if (peerConnection) {
      peerConnection.close();
      this.peers.delete(peerId);
      this.callbacks.onStreamRemoved(peerId);
    }
  }

  // Cleanup
  cleanup() {
    // Close all peer connections
    this.peers.forEach((peerConnection) => {
      peerConnection.close();
    });
    this.peers.clear();

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    this.room = null;
    this.user = null;
  }

  // Set callbacks
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event] = callback;
    }
  }

  // Get WebRTC stats
  async getStats(peerId) {
    const peerConnection = this.peers.get(peerId);
    if (peerConnection) {
      return await peerConnection.getStats();
    }
    return null;
  }
}

export default new WebRTCService();
