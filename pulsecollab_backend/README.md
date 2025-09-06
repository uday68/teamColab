# PulseCollab Backend

A comprehensive collaboration platform backend with WebRTC video calling, real-time chat, file sharing, and authentication.

## 🚀 Features

- **WebRTC Video Calls**: Multi-participant video conferencing with screen sharing
- **Real-time Chat**: Messaging with reactions, typing indicators, and file sharing
- **Authentication**: JWT-based auth with guest access support
- **File Sharing**: Secure file upload/download with automatic cleanup
- **Security**: Helmet, rate limiting, CORS protection
- **Color Palette**: Built-in PulseCollab brand colors

## 🛠️ Tech Stack

- **Framework**: Express.js
- **Real-time**: Socket.IO
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **Security**: Helmet, Rate limiting
- **Task Scheduling**: node-cron

## 📋 Installation

1. **Clone and navigate:**
   ```bash
   cd pulsecollab_backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment setup:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server:**
   ```bash
   npm start           # Production
   npm run dev         # Development with nodemon
   ```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/guest` - Create guest user

### WebRTC
- `GET /api/webrtc/config` - Get WebRTC configuration
- `GET /api/rooms/:roomId/participants` - Get room participants
- `GET /api/rooms/:roomId/stats` - Get room statistics

### Chat
- `GET /api/rooms/:roomId/messages` - Get chat messages
- `GET /api/rooms/:roomId/messages/search` - Search messages
- `GET /api/rooms/:roomId/chat/stats` - Get chat statistics

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files/download/:token` - Download file
- `GET /api/rooms/:roomId/files` - Get room files
- `DELETE /api/files/:fileId` - Delete file

### Rooms
- `POST /api/rooms` - Create/join room
- `GET /api/rooms/:roomId/info` - Get room information

### Configuration
- `GET /api/config` - Get app configuration and colors
- `GET /health` - Health check

## 🎨 PulseCollab Color Palette

```javascript
{
  primary: '#3A86FF',      // Vibrant blue
  secondary: '#8338EC',    // Purple accent
  success: '#06D6A0',      // Positive states
  warning: '#FFD166',      // Risk indicators
  danger: '#EF476F',       // Errors, blockers
  backgroundLight: '#F9FAFB',
  backgroundDark: '#1F2937',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  surfaceCardLight: '#FFFFFF',
  surfaceCardDark: '#2D3748',
  accentGradient: 'linear-gradient(135deg, #3A86FF 0%, #8338EC 100%)'
}
```

## 🔌 Socket.IO Events

### Room Management
- `join-room` - Join a room
- `leave-room` - Leave a room
- `user-joined` - New user joined
- `user-left` - User left room

### WebRTC Signaling
- `offer` - WebRTC offer
- `answer` - WebRTC answer
- `ice-candidate` - ICE candidate exchange

### Media Controls
- `toggle-audio` - Mute/unmute audio
- `toggle-video` - Turn video on/off
- `start-screen-share` - Start screen sharing
- `stop-screen-share` - Stop screen sharing

### Chat
- `send-message` - Send chat message
- `new-message` - New message received
- `add-reaction` - Add emoji reaction
- `remove-reaction` - Remove emoji reaction
- `typing` - Typing indicator
- `typing-update` - Typing users update

## 🛡️ Security Features

- JWT authentication with refresh tokens
- Rate limiting (100 requests per 15 minutes)
- Helmet for security headers
- CORS protection
- File type validation
- File size limits
- Input validation

## 📁 File Handling

- **Max file size**: 50MB
- **Allowed types**: Images, PDFs, documents
- **Automatic cleanup**: Files older than 30 days
- **Secure downloads**: Time-limited download tokens

## 🚦 Health Monitoring

The `/health` endpoint provides service status:

```javascript
{
  status: 'healthy',
  timestamp: '2025-01-01T00:00:00.000Z',
  version: '1.0.0',
  services: {
    webrtc: 'online',
    chat: 'online',
    auth: 'online',
    files: 'online'
  }
}
```

## 🔧 Configuration

Key configuration options in `config/app.js`:

- **WebRTC settings**: ICE servers, media constraints
- **Chat limits**: Message length, file size
- **Room settings**: Max participants, features
- **Security**: Rate limits, CORS origins
- **Feature flags**: Enable/disable features

## 📝 Development

- **Linting**: ESLint configuration
- **Hot reload**: Nodemon for development
- **Logging**: Structured logging with levels
- **Error handling**: Centralized error responses

## 🚀 Production Deployment

1. Set production environment variables
2. Configure TURN servers for WebRTC
3. Set up proper database (PostgreSQL recommended)
4. Configure Redis for session storage
5. Set up proper file storage (AWS S3, etc.)
6. Configure HTTPS and security headers
7. Set up monitoring and logging

## 📞 WebRTC Requirements

For production WebRTC:
- TURN servers for NAT traversal
- HTTPS for security
- Proper firewall configuration
- Load balancing for scalability

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

This project is part of the PulseCollab hackathon submission.
