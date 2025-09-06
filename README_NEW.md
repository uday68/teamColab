# 🚀 PulseCollab - Advanced Team Collaboration Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%5E18.3.1-blue.svg)](https://reactjs.org/)

PulseCollab is a comprehensive team collaboration platform built for the modern workplace. It combines project management, real-time communication, video conferencing, and intelligent analytics to boost team productivity and well-being.

## 🌟 Features

### 🎯 Core Collaboration
- **Real-time Chat**: Instant messaging with emoji support and file sharing
- **Video Conferencing**: WebRTC-powered video calls with screen sharing
- **Project Management**: Kanban boards, task tracking, and progress monitoring
- **Team Management**: Role-based access control and team organization
- **File Sharing**: Secure file upload and sharing capabilities

### 🔐 Authentication & Security
- **Multi-factor Authentication**: Email + TOTP 2FA support
- **OAuth Integration**: Google, GitHub, and Microsoft login
- **JWT-based Security**: Secure token-based authentication
- **Guest Access**: Temporary access for external collaborators
- **Rate Limiting**: API protection against abuse

### 📊 Advanced Analytics
- **Team Performance**: Velocity tracking and efficiency metrics
- **Project Insights**: Progress tracking and risk analysis
- **Health Monitoring**: Work-life balance and wellness insights
- **Custom Reports**: Exportable analytics data
- **Real-time Dashboards**: Live performance indicators

### 🤖 AI-Powered Features
- **Smart Suggestions**: AI-powered task and project recommendations
- **Meeting Summaries**: Automatic meeting transcription and summaries
- **Risk Analysis**: Predictive project risk assessment
- **Content Generation**: AI-assisted documentation

### 📱 Mobile Optimization
- **Responsive Design**: Mobile-first responsive interface
- **Touch Interactions**: Optimized for mobile devices
- **Offline Support**: Progressive Web App capabilities
- **Push Notifications**: Real-time mobile notifications

### 📅 Calendar & Scheduling
- **Meeting Scheduler**: Advanced calendar integration
- **Resource Booking**: Room and equipment reservation
- **Time Zone Support**: Global team coordination
- **Recurring Events**: Automated meeting scheduling

### 🔔 Notification System
- **Multi-channel Alerts**: Email, push, and in-app notifications
- **Smart Filtering**: Intelligent notification prioritization
- **Custom Preferences**: Personalized notification settings
- **Real-time Updates**: Instant notification delivery

## 🏗️ Technology Stack

### Frontend
- **React 18.3.1** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for beautiful UI components
- **Framer Motion** for smooth animations
- **Recharts** for data visualization
- **Socket.IO Client** for real-time communication

### Backend
- **Node.js** with Express.js
- **Socket.IO** for WebSocket connections
- **PostgreSQL** for primary database
- **Redis** for session storage and caching
- **JWT** for authentication
- **Multer** for file uploads
- **Nodemailer** for email notifications

### DevOps & Deployment
- **Docker** for containerization
- **Docker Compose** for multi-service orchestration
- **Nginx** as reverse proxy
- **PostgreSQL** for data persistence
- **Redis** for caching and sessions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/pulsecollab.git
cd hackathon
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Update .env with your configuration
nano .env
```

### 3. Docker Deployment (Recommended)
```bash
# For development
./deploy.sh development

# For production  
./deploy.sh production your-domain.com

# For Windows users
./deploy.bat development
```

### 4. Manual Setup (Alternative)
```bash
# Install frontend dependencies
cd pulsecollab
npm install

# Install backend dependencies
cd ../pulsecollab_backend
npm install

# Start PostgreSQL and Redis (using Docker)
docker-compose up -d postgres redis

# Start backend
npm start

# Start frontend (in another terminal)
cd ../pulsecollab
npm run dev
```

## 📖 API Documentation

### Authentication Endpoints
```
POST /api/auth/register    - User registration
POST /api/auth/login       - User login
POST /api/auth/logout      - User logout
POST /api/auth/refresh     - Token refresh
POST /api/auth/2fa/setup   - Setup 2FA
POST /api/auth/2fa/verify  - Verify 2FA
```

### Project Management
```
GET    /api/projects          - List projects
POST   /api/projects          - Create project
PUT    /api/projects/:id      - Update project
DELETE /api/projects/:id      - Delete project
GET    /api/projects/:id/tasks - List project tasks
POST   /api/projects/:id/tasks - Create task
```

### Team Management
```
GET    /api/teams             - List teams
POST   /api/teams             - Create team
PUT    /api/teams/:id         - Update team
DELETE /api/teams/:id         - Delete team
POST   /api/teams/:id/members - Add team member
DELETE /api/teams/:id/members/:userId - Remove member
```

### Real-time Events (WebSocket)
```
connect              - User connection
disconnect           - User disconnection
join-room           - Join chat/video room
leave-room          - Leave room
send-message        - Send chat message
video-offer         - WebRTC video offer
video-answer        - WebRTC video answer
screen-share-start  - Start screen sharing
```

## 🔧 Configuration

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pulsecollab
DB_USER=postgres
DB_PASSWORD=your-password

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Application
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### OAuth Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3001/api/auth/oauth/google/callback`

#### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3001/api/auth/oauth/github/callback`

## 🎨 UI Components

The application uses a comprehensive design system built with shadcn/ui:

- **Forms**: Input, Textarea, Select, Checkbox, Radio buttons
- **Navigation**: Sidebar, Breadcrumbs, Pagination, Tabs
- **Feedback**: Alert, Toast, Progress, Badge
- **Data Display**: Table, Card, Avatar, Tooltip
- **Overlays**: Dialog, Sheet, Popover, Context Menu

## 📊 Database Schema

### Core Tables
- `users` - User accounts and profiles
- `teams` - Team information and settings
- `projects` - Project details and metadata
- `tasks` - Task tracking and assignments
- `meetings` - Meeting scheduling and records
- `messages` - Chat messages and threads
- `files` - File uploads and metadata
- `notifications` - Notification queue and history

### Analytics Tables
- `user_activity` - User interaction tracking
- `project_metrics` - Project performance data
- `team_health` - Team wellness indicators

## 🔒 Security Features

### Authentication
- Bcrypt password hashing
- JWT with short expiration + refresh tokens
- Optional 2FA with TOTP
- OAuth integration for SSO
- Guest access with limited permissions

### API Security
- Helmet.js for HTTP headers
- Rate limiting per IP and user
- CORS configuration
- Input validation and sanitization
- SQL injection prevention

### Data Protection
- Encrypted sensitive data
- Secure file upload validation
- Access control middleware
- Audit logging for sensitive operations

## 📱 Mobile Features

### Responsive Design
- Mobile-first approach
- Touch-optimized interactions
- Adaptive layouts for all screen sizes
- Optimized images and assets

### Progressive Web App
- Service worker for offline functionality
- App-like experience on mobile devices
- Push notification support
- Installable on mobile home screen

## 🚀 Deployment

### Production Deployment
```bash
# Using Docker Compose (Recommended)
./deploy.sh production your-domain.com

# Manual deployment
npm run build
npm run start:prod
```

### Infrastructure Requirements
- **CPU**: 2+ cores recommended
- **RAM**: 4GB+ recommended
- **Storage**: 20GB+ for application and database
- **Network**: HTTPS certificate for production

### Scaling Considerations
- Horizontal scaling with load balancers
- Database read replicas for heavy read workloads
- Redis cluster for session storage
- CDN for static asset delivery

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- ESLint + Prettier for code formatting
- TypeScript for type safety
- Conventional commits for commit messages
- Component-driven development
- Test-driven development encouraged

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI framework
- [Express.js](https://expressjs.com/) - Backend framework
- [Socket.IO](https://socket.io/) - Real-time communication
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

## 📞 Support

For support and questions:
- 📧 Email: support@pulsecollab.com
- 💬 Discord: [Join our community](https://discord.gg/pulsecollab)
- 📖 Documentation: [docs.pulsecollab.com](https://docs.pulsecollab.com)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/pulsecollab/issues)

---

**Built with ❤️ for the Odoo Hackathon**
