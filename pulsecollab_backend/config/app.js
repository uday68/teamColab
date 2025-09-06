// PulseCollab Application Configuration
export const appConfig = {
  // Brand Colors
  colors: {
    primary: '#3A86FF',      // Vibrant blue; anchors buttons, key actions
    secondary: '#8338EC',    // Purple accent for highlights, selection
    success: '#06D6A0',      // Positive states, completion bars
    warning: '#FFD166',      // Risk or approaching deadline cues
    danger: '#EF476F',       // Errors, blockers
    backgroundLight: '#F9FAFB', // Clean workspace base
    backgroundDark: '#1F2937',  // Dark mode shell
    textPrimary: '#111827',     // High contrast body text
    textSecondary: '#6B7280',   // Muted labels, metadata
    surfaceCardLight: '#FFFFFF', // Light mode panels, modals
    surfaceCardDark: '#2D3748',  // Dark mode panels, modals
    accentGradient: 'linear-gradient(135deg, #3A86FF 0%, #8338EC 100%)'
  },

  // WebRTC Configuration
  webrtc: {
    maxParticipants: 50,
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      // Add TURN servers for production
      // {
      //   urls: 'turn:your-turn-server.com:3478',
      //   username: 'username',
      //   credential: 'password'
      // }
    ],
    mediaConstraints: {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      }
    }
  },

  // Chat Configuration
  chat: {
    maxMessageLength: 2000,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedFileTypes: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    messageRetentionDays: 30,
    typingTimeout: 3000 // 3 seconds
  },

  // Room Settings
  rooms: {
    defaultSettings: {
      maxParticipants: 50,
      allowScreenShare: true,
      allowChat: true,
      allowFileSharing: true,
      recordingEnabled: false,
      waitingRoom: false,
      muteOnJoin: false,
      videoOnJoin: true
    },
    cleanupInterval: 60 * 60 * 1000, // 1 hour
    emptyRoomTimeout: 10 * 60 * 1000 // 10 minutes
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 3002,
    corsOrigins: [
      'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost:8081',
      'http://localhost:3000'
    ],
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },

  // Feature Flags
  features: {
    screenSharing: true,
    chatReactions: true,
    fileSharing: true,
    recordingEnabled: false,
    aiAssistance: true,
    virtualBackgrounds: false,
    whiteboard: true,
    breakoutRooms: false
  },

  // AI Configuration
  ai: {
    enabled: true,
    maxTokens: 1000,
    temperature: 0.7,
    // Add your AI service configuration here
    providers: {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-3.5-turbo'
      }
    }
  }
};

export default appConfig;
