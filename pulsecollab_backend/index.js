import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';
import { webrtcService } from './services/webrtc.js';
import { chatService } from './services/chat.js';
import { authService, authenticateToken, optionalAuth } from './services/auth.js';
import { oauthService } from './services/oauth.js';
import { notificationService } from './services/notification.js';
import { aiService } from './services/ai.js';
import { fileService } from './services/file.js';
import { db } from './services/database.js';
import { projectService, taskService } from './services/project.js';
import { teamService } from './services/team.js';
import { analyticsService, healthService } from './services/analytics.js';
import appConfig from './config/app.js';
import twoFactorRoutes from './routes/2fa.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: appConfig.server.corsOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = appConfig.server.port;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));

// Rate limiting
const limiter = rateLimit(appConfig.server.rateLimit);
app.use('/api/', limiter);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  origin: appConfig.server.corsOrigins,
  credentials: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      webrtc: 'online',
      chat: 'online',
      auth: 'online',
      files: 'online',
      database: 'online',
      projects: 'online',
      teams: 'online',
      analytics: 'online'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Initialize database on startup
db.initializeDatabase().catch(console.error);

app.get('/', (req, res) => {
  res.json({
    message: 'PulseCollab Backend API',
    version: '1.0.0',
    status: 'running',
    features: appConfig.features,
    colors: appConfig.colors
  });
});

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.body;
    await authService.logout(sessionId);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    res.json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Guest access for demos
app.post('/api/auth/guest', (req, res) => {
  const { name } = req.body;
  const guest = authService.createGuestUser(name);
  res.json({ user: guest });
});

// ===== OAUTH ROUTES =====
app.get('/api/auth/:provider/url', (req, res) => {
  try {
    const { provider } = req.params;
    const { state } = req.query;
    const authUrl = oauthService.getAuthUrl(provider, state);
    res.json({ authUrl });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/:provider/callback', async (req, res) => {
  try {
    const { provider } = req.params;
    const { code, state } = req.body;
    const result = await oauthService.handleOAuthCallback(provider, code);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/:provider/link', authenticateToken, async (req, res) => {
  try {
    const { provider } = req.params;
    const { code } = req.body;
    const result = await oauthService.linkAccount(req.user.id, provider, code);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/auth/:provider/unlink', authenticateToken, async (req, res) => {
  try {
    const { provider } = req.params;
    const result = await oauthService.unlinkAccount(req.user.id, provider);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Two-Factor Authentication
app.post('/api/auth/2fa/enable', authenticateToken, async (req, res) => {
  try {
    const result = await authService.enable2FA(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/2fa/verify', authenticateToken, async (req, res) => {
  try {
    const { token } = req.body;
    const result = await authService.verify2FA(req.user.id, token);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/2fa/disable', authenticateToken, async (req, res) => {
  try {
    const { token } = req.body;
    const result = await authService.disable2FA(req.user.id, token);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ===== NOTIFICATION-BASED 2FA ROUTES =====
twoFactorRoutes(app);

// ===== TEAM MANAGEMENT ROUTES =====
app.get('/api/teams', authenticateToken, async (req, res) => {
  try {
    const teams = await teamService.getUserTeams(req.user.id);
    res.json({ teams });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/teams/:teamId', authenticateToken, async (req, res) => {
  try {
    const team = await teamService.getTeamById(req.params.teamId, req.user.id);
    res.json({ team });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/teams', authenticateToken, async (req, res) => {
  try {
    const team = await teamService.createTeam(req.body, req.user.id);
    res.status(201).json({ team });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/teams/:teamId', authenticateToken, async (req, res) => {
  try {
    const team = await teamService.updateTeam(req.params.teamId, req.body, req.user.id);
    res.json({ team });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/teams/:teamId/members', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;
    const member = await teamService.addTeamMember(req.params.teamId, email, req.user.id);
    res.status(201).json({ member });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/teams/:teamId/members/:memberId', authenticateToken, async (req, res) => {
  try {
    await teamService.removeTeamMember(req.params.teamId, req.params.memberId, req.user.id);
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/teams/:teamId/members/:memberId/role', authenticateToken, async (req, res) => {
  try {
    const { isAdmin } = req.body;
    const member = await teamService.updateMemberRole(req.params.teamId, req.params.memberId, isAdmin, req.user.id);
    res.json({ member });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/teams/:teamId', authenticateToken, async (req, res) => {
  try {
    await teamService.deleteTeam(req.params.teamId, req.user.id);
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/teams/:teamId/analytics', authenticateToken, async (req, res) => {
  try {
    const analytics = await teamService.getTeamAnalytics(req.params.teamId, req.user.id);
    res.json({ analytics });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ===== PROJECT MANAGEMENT ROUTES =====
app.get('/api/teams/:teamId/projects', authenticateToken, async (req, res) => {
  try {
    const projects = await projectService.getProjects(req.params.teamId, req.user.id);
    res.json({ projects });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/projects/:projectId', authenticateToken, async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.projectId);
    res.json({ project });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const project = await projectService.createProject(req.body, req.user.id);
    res.status(201).json({ project });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/projects/:projectId', authenticateToken, async (req, res) => {
  try {
    const project = await projectService.updateProject(req.params.projectId, req.body, req.user.id);
    res.json({ project });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/projects/:projectId', authenticateToken, async (req, res) => {
  try {
    await projectService.deleteProject(req.params.projectId, req.user.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/projects/:projectId/analytics', authenticateToken, async (req, res) => {
  try {
    const analytics = await projectService.getProjectAnalytics(req.params.projectId);
    res.json({ analytics });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ===== TASK MANAGEMENT ROUTES =====
app.get('/api/projects/:projectId/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await taskService.getTasks(req.params.projectId, req.query);
    res.json({ tasks });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/tasks/:taskId', authenticateToken, async (req, res) => {
  try {
    const task = await taskService.getTaskById(req.params.taskId);
    res.json({ task });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const task = await taskService.createTask(req.body, req.user.id);
    res.status(201).json({ task });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/tasks/:taskId', authenticateToken, async (req, res) => {
  try {
    const task = await taskService.updateTask(req.params.taskId, req.body, req.user.id);
    res.json({ task });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/tasks/:taskId', authenticateToken, async (req, res) => {
  try {
    await taskService.deleteTask(req.params.taskId, req.user.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/tasks/:taskId/comments', authenticateToken, async (req, res) => {
  try {
    const comments = await taskService.getTaskComments(req.params.taskId);
    res.json({ comments });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/tasks/:taskId/comments', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await taskService.addTaskComment(req.params.taskId, content, req.user.id);
    res.status(201).json({ comment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ===== ANALYTICS ROUTES =====
app.get('/api/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    const analytics = await analyticsService.getDashboardAnalytics(req.user.id);
    res.json({ analytics });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/analytics/projects/:projectId/progress', authenticateToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const progress = await analyticsService.getProjectProgressChart(req.params.projectId, days);
    res.json({ progress });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/analytics/teams/:teamId/velocity', authenticateToken, async (req, res) => {
  try {
    const weeks = parseInt(req.query.weeks) || 4;
    const velocity = await analyticsService.getTeamVelocity(req.params.teamId, weeks);
    res.json({ velocity });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/analytics/projects/:projectId/burndown', authenticateToken, async (req, res) => {
  try {
    const burndown = await analyticsService.getBurndownChart(req.params.projectId);
    res.json({ burndown });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ===== HEALTH & WELLNESS ROUTES =====
app.post('/api/health/work-sessions/start', authenticateToken, async (req, res) => {
  try {
    const { projectId, taskId } = req.body;
    const session = await healthService.startWorkSession(req.user.id, projectId, taskId);
    res.status(201).json({ session });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/health/work-sessions/:sessionId/end', authenticateToken, async (req, res) => {
  try {
    const session = await healthService.endWorkSession(req.params.sessionId, req.user.id);
    res.json({ session });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/health/status', authenticateToken, async (req, res) => {
  try {
    const status = await healthService.getUserHealthStatus(req.user.id);
    res.json({ status });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/health/break', authenticateToken, async (req, res) => {
  try {
    const result = await healthService.recordBreak(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/health/teams/:teamId/overview', authenticateToken, async (req, res) => {
  try {
    const overview = await healthService.getTeamHealthOverview(req.params.teamId);
    res.json({ overview });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/health/recommendations', authenticateToken, async (req, res) => {
  try {
    const recommendations = await healthService.getWellnessRecommendations(req.user.id);
    res.json({ recommendations });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ===== NOTIFICATION ROUTES =====
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const { limit, offset, unreadOnly } = req.query;
    const result = notificationService.getUserNotifications(req.user.id, {
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0,
      unreadOnly: unreadOnly === 'true'
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/notifications/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const notification = notificationService.markAsRead(req.user.id, req.params.notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ notification });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    const result = notificationService.markAllAsRead(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/notifications/:notificationId', authenticateToken, async (req, res) => {
  try {
    const deleted = notificationService.deleteNotification(req.user.id, req.params.notificationId);
    if (!deleted) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/notifications/push/subscribe', authenticateToken, async (req, res) => {
  try {
    const { subscription } = req.body;
    const result = notificationService.subscribeToPush(req.user.id, subscription);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/notifications/push/unsubscribe', authenticateToken, async (req, res) => {
  try {
    const result = notificationService.unsubscribeFromPush(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/notifications/preferences', authenticateToken, async (req, res) => {
  try {
    const result = notificationService.updateNotificationPreferences(req.user.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ===== AI ROUTES =====
app.post('/api/ai/task-suggestions', authenticateToken, async (req, res) => {
  try {
    const { projectData, existingTasks } = req.body;
    const suggestions = await aiService.generateTaskSuggestions(projectData, existingTasks);
    res.json({ suggestions });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/ai/meeting-summary', authenticateToken, async (req, res) => {
  try {
    const { meetingData } = req.body;
    const summary = await aiService.summarizeMeeting(meetingData);
    res.json({ summary });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/ai/risk-analysis', authenticateToken, async (req, res) => {
  try {
    const { projectData, teamData } = req.body;
    const analysis = await aiService.analyzeProjectRisks(projectData, teamData);
    res.json({ analysis });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/ai/health-insights', authenticateToken, async (req, res) => {
  try {
    const { teamData, workSessions } = req.body;
    const insights = await aiService.generateHealthInsights(teamData, workSessions);
    res.json({ insights });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/ai/deadline-predictions', authenticateToken, async (req, res) => {
  try {
    const { taskData, teamVelocity } = req.body;
    const predictions = await aiService.predictDeadlines(taskData, teamVelocity);
    res.json({ predictions });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/ai/next-steps', authenticateToken, async (req, res) => {
  try {
    const { projectContext } = req.body;
    const steps = await aiService.generateNextSteps(projectContext);
    res.json({ steps });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// WebRTC Configuration
app.get('/api/webrtc/config', (req, res) => {
  res.json({
    iceServers: webrtcService.getIceServers(),
    mediaConstraints: appConfig.webrtc.mediaConstraints
  });
});

// File Upload Routes
const upload = fileService.getMulterConfig();

app.post('/api/files/upload', optionalAuth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const user = req.user || { id: 'guest', name: 'Guest' };
    const { roomId } = req.body;

    const fileData = fileService.saveFileMetadata(req.file, user, roomId);
    
    res.json({
      file: {
        id: fileData.id,
        name: fileData.originalName,
        size: fileData.size,
        type: fileData.mimetype,
        uploadedAt: fileData.uploadedAt,
        uploadedBy: fileData.uploadedBy,
        downloadLink: fileService.generateDownloadLink(fileData.id)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/files/download/:token', async (req, res) => {
  try {
    const fileId = fileService.validateDownloadToken(req.params.token);
    const file = await fileService.getFileStream(fileId);
    
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimetype);
    res.sendFile(path.resolve(file.path));
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

app.get('/api/rooms/:roomId/files', optionalAuth, (req, res) => {
  const roomId = req.params.roomId;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  
  const files = fileService.getRoomFiles(roomId, limit, offset);
  res.json({ files });
});

app.delete('/api/files/:fileId', authenticateToken, async (req, res) => {
  try {
    await fileService.deleteFile(req.params.fileId, req.user.id);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
});

// Get room participants
app.get('/api/rooms/:roomId/participants', (req, res) => {
  const roomId = req.params.roomId;
  const room = webrtcService.getRoomInfo(roomId);
  
  if (!room) {
    return res.json({ participants: [] });
  }
  
  const participants = Array.from(room.participants.values());
  res.json({ participants });
});

// Get room statistics
app.get('/api/rooms/:roomId/stats', (req, res) => {
  const roomId = req.params.roomId;
  const stats = webrtcService.getRoomStats(roomId);
  
  if (!stats) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  res.json(stats);
});

// Get chat messages for a room
app.get('/api/rooms/:roomId/messages', (req, res) => {
  const roomId = req.params.roomId;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  
  const messages = chatService.getMessages(roomId, limit, offset);
  res.json({ messages });
});

// Search messages
app.get('/api/rooms/:roomId/messages/search', (req, res) => {
  const roomId = req.params.roomId;
  const query = req.query.q;
  const limit = parseInt(req.query.limit) || 20;
  
  if (!query) {
    return res.status(400).json({ error: 'Search query required' });
  }
  
  const messages = chatService.searchMessages(roomId, query, limit);
  res.json({ messages });
});

// Get chat statistics
app.get('/api/rooms/:roomId/chat/stats', (req, res) => {
  const roomId = req.params.roomId;
  const stats = chatService.getMessageStats(roomId);
  res.json(stats);
});

// App Configuration
app.get('/api/config', (req, res) => {
  res.json({
    colors: appConfig.colors,
    features: appConfig.features,
    limits: {
      maxFileSize: appConfig.chat.maxFileSize,
      maxMessageLength: appConfig.chat.maxMessageLength,
      maxParticipants: appConfig.rooms.defaultSettings.maxParticipants
    }
  });
});

// Room Management
app.post('/api/rooms', optionalAuth, (req, res) => {
  const roomId = req.body.roomId || uuidv4();
  const user = req.user || { id: 'guest', name: 'Guest' };
  
  const { room } = webrtcService.joinRoom(roomId, user.id, {
    name: user.name,
    avatar: user.avatar || '',
    isMuted: false,
    isVideoOff: false
  });
  
  res.json({
    roomId: room.id,
    settings: room.settings,
    created: true
  });
});

app.get('/api/rooms/:roomId/info', (req, res) => {
  const roomId = req.params.roomId;
  const room = webrtcService.getRoomInfo(roomId);
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  res.json({
    id: room.id,
    participantCount: room.participants.size,
    settings: room.settings,
    createdAt: room.createdAt
  });
});

// Team Workspace endpoints
app.get('/api/teams/workspace', authenticateToken, async (req, res) => {
  try {
    // Mock team workspace data with proper color palette
    const workspaceData = {
      teams: [
        {
          id: 1,
          name: 'Product Development',
          description: 'Building the next generation of products',
          memberCount: 12,
          projectCount: 8,
          color: '#3b82f6',
          bgColor: '#eff6ff',
          status: 'active',
          avatar: '/placeholder.svg',
          members: [
            { id: 1, name: 'Alice Johnson', role: 'Team Lead', avatar: '/placeholder.svg', status: 'online' },
            { id: 2, name: 'Bob Smith', role: 'Developer', avatar: '/placeholder.svg', status: 'offline' },
            { id: 3, name: 'Carol Davis', role: 'Designer', avatar: '/placeholder.svg', status: 'online' },
          ],
          recentActivity: [
            { type: 'project', message: 'New project "Mobile App v2" created', time: '2 hours ago' },
            { type: 'member', message: 'Alice Johnson joined the team', time: '1 day ago' },
          ],
          stats: {
            tasksCompleted: 156,
            ongoingProjects: 3,
            teamVelocity: 92
          }
        },
        {
          id: 2,
          name: 'Marketing & Growth',
          description: 'Driving user acquisition and engagement',
          memberCount: 8,
          projectCount: 5,
          color: '#22c55e',
          bgColor: '#f0fdf4',
          status: 'active',
          avatar: '/placeholder.svg',
          members: [
            { id: 4, name: 'David Wilson', role: 'Marketing Manager', avatar: '/placeholder.svg', status: 'online' },
            { id: 5, name: 'Emma Brown', role: 'Content Creator', avatar: '/placeholder.svg', status: 'away' },
          ],
          recentActivity: [
            { type: 'campaign', message: 'Q4 Campaign launched successfully', time: '3 hours ago' },
          ],
          stats: {
            tasksCompleted: 89,
            ongoingProjects: 2,
            teamVelocity: 87
          }
        },
        {
          id: 3,
          name: 'Engineering',
          description: 'Backend infrastructure and platform development',
          memberCount: 15,
          projectCount: 12,
          color: '#a855f7',
          bgColor: '#faf5ff',
          status: 'active',
          avatar: '/placeholder.svg',
          members: [
            { id: 6, name: 'Frank Miller', role: 'Senior Engineer', avatar: '/placeholder.svg', status: 'online' },
            { id: 7, name: 'Grace Lee', role: 'DevOps', avatar: '/placeholder.svg', status: 'online' },
          ],
          recentActivity: [
            { type: 'deployment', message: 'Production deployment completed', time: '1 hour ago' },
          ],
          stats: {
            tasksCompleted: 234,
            ongoingProjects: 5,
            teamVelocity: 95
          }
        },
        {
          id: 4,
          name: 'Design System',
          description: 'Creating consistent user experiences',
          memberCount: 6,
          projectCount: 4,
          color: '#f59e0b',
          bgColor: '#fffbeb',
          status: 'active',
          avatar: '/placeholder.svg',
          members: [
            { id: 8, name: 'Henry Chang', role: 'Lead Designer', avatar: '/placeholder.svg', status: 'online' },
          ],
          recentActivity: [
            { type: 'design', message: 'New component library updated', time: '4 hours ago' },
          ],
          stats: {
            tasksCompleted: 67,
            ongoingProjects: 2,
            teamVelocity: 88
          }
        }
      ],
      projects: [
        {
          id: 1,
          name: 'PulseCollab Mobile App',
          description: 'Native mobile application for iOS and Android',
          progress: 75,
          status: 'In Progress',
          priority: 'High',
          dueDate: '2025-02-15',
          teamId: 1,
          color: '#3b82f6',
          members: 5,
          tasks: { total: 24, completed: 18 }
        },
        {
          id: 2,
          name: 'Q4 Marketing Campaign',
          description: 'Comprehensive marketing strategy for Q4',
          progress: 60,
          status: 'In Progress',
          priority: 'Medium',
          dueDate: '2025-01-30',
          teamId: 2,
          color: '#22c55e',
          members: 4,
          tasks: { total: 15, completed: 9 }
        },
        {
          id: 3,
          name: 'Infrastructure Upgrade',
          description: 'Scaling backend infrastructure for growth',
          progress: 90,
          status: 'Review',
          priority: 'High',
          dueDate: '2025-01-20',
          teamId: 3,
          color: '#a855f7',
          members: 8,
          tasks: { total: 32, completed: 29 }
        }
      ],
      colorPalette: {
        primary: { 50: '#eff6ff', 100: '#dbeafe', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
        success: { 50: '#f0fdf4', 100: '#dcfce7', 500: '#22c55e', 600: '#16a34a' },
        warning: { 50: '#fffbeb', 100: '#fef3c7', 500: '#f59e0b', 600: '#d97706' },
        danger: { 50: '#fef2f2', 100: '#fee2e2', 500: '#ef4444', 600: '#dc2626' },
        purple: { 50: '#faf5ff', 100: '#f3e8ff', 500: '#a855f7', 600: '#9333ea' },
        indigo: { 50: '#eef2ff', 100: '#e0e7ff', 500: '#6366f1', 600: '#4f46e5' }
      }
    };

    res.json(workspaceData);
  } catch (error) {
    console.error('Error fetching workspace data:', error);
    res.status(500).json({ error: 'Failed to fetch workspace data' });
  }
});

app.post('/api/teams/workspace/create', authenticateToken, async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const userId = req.user.id;

    // Mock team creation
    const newTeam = {
      id: Date.now(),
      name,
      description,
      color,
      bgColor: color + '20', // Add transparency
      memberCount: 1,
      projectCount: 0,
      status: 'active',
      members: [{
        id: userId,
        name: req.user.username || 'User',
        role: 'Team Lead',
        avatar: '/placeholder.svg',
        status: 'online'
      }],
      recentActivity: [{
        type: 'team',
        message: `Team "${name}" was created`,
        time: 'Just now'
      }],
      stats: {
        tasksCompleted: 0,
        ongoingProjects: 0,
        teamVelocity: 0
      }
    };

    res.json({ 
      success: true, 
      team: newTeam,
      message: 'Team created successfully'
    });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

app.get('/api/teams/:teamId/details', authenticateToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    
    // Mock team details
    const teamDetails = {
      id: parseInt(teamId),
      name: 'Product Development',
      description: 'Building the next generation of products',
      color: '#3b82f6',
      bgColor: '#eff6ff',
      members: [
        { id: 1, name: 'Alice Johnson', role: 'Team Lead', avatar: '/placeholder.svg', status: 'online', joinDate: '2024-01-15' },
        { id: 2, name: 'Bob Smith', role: 'Senior Developer', avatar: '/placeholder.svg', status: 'offline', joinDate: '2024-02-01' },
        { id: 3, name: 'Carol Davis', role: 'UI/UX Designer', avatar: '/placeholder.svg', status: 'online', joinDate: '2024-02-15' },
        { id: 4, name: 'David Wilson', role: 'Frontend Developer', avatar: '/placeholder.svg', status: 'away', joinDate: '2024-03-01' },
      ],
      projects: [
        { id: 1, name: 'Mobile App v2', progress: 75, status: 'In Progress' },
        { id: 2, name: 'Web Dashboard', progress: 45, status: 'Planning' },
        { id: 3, name: 'API Redesign', progress: 90, status: 'Review' }
      ],
      stats: {
        totalTasks: 156,
        completedTasks: 142,
        inProgressTasks: 14,
        teamVelocity: 92,
        averageTaskTime: '2.3 days',
        collaboration: 85
      },
      activity: [
        { type: 'task', message: 'Alice completed "User Authentication" task', time: '1 hour ago' },
        { type: 'project', message: 'New project "API v3" was created', time: '3 hours ago' },
        { type: 'member', message: 'David joined the team', time: '1 day ago' }
      ]
    };

    res.json(teamDetails);
  } catch (error) {
    console.error('Error fetching team details:', error);
    res.status(500).json({ error: 'Failed to fetch team details' });
  }
});

// ===== TEAM MEMBER DASHBOARD ROUTES =====
app.get('/api/team/dashboard/:memberId', authenticateToken, async (req, res) => {
  try {
    const { memberId } = req.params;
    
    // Mock team member dashboard data
    const dashboardData = {
      member: {
        id: parseInt(memberId),
        name: 'John Doe',
        role: 'Senior Developer',
        avatar: '/placeholder.svg',
        status: 'online',
        team: 'Product Development',
        joinDate: '2024-01-15',
        skillLevel: 'Senior',
        performance: {
          tasksCompleted: 45,
          onTimeDelivery: 92,
          codeQuality: 88,
          teamCollaboration: 95
        }
      },
      currentTasks: [
        {
          id: 1,
          title: 'Implement user authentication',
          priority: 'high',
          status: 'in-progress',
          dueDate: '2025-09-10',
          estimatedHours: 12,
          spentHours: 8,
          project: 'PulseCollab Platform',
          assignedBy: { name: 'Alice Johnson', role: 'Team Lead' }
        },
        {
          id: 2,
          title: 'Fix payment gateway integration',
          priority: 'critical',
          status: 'review',
          dueDate: '2025-09-08',
          estimatedHours: 8,
          spentHours: 10,
          project: 'E-commerce Module',
          assignedBy: { name: 'Bob Smith', role: 'Project Manager' }
        },
        {
          id: 3,
          title: 'Update API documentation',
          priority: 'low',
          status: 'todo',
          dueDate: '2025-09-15',
          estimatedHours: 4,
          spentHours: 0,
          project: 'API v2',
          assignedBy: { name: 'Alice Johnson', role: 'Team Lead' }
        }
      ],
      teamMembers: [
        {
          id: 1,
          name: 'Alice Johnson',
          role: 'Team Lead',
          avatar: '/placeholder.svg',
          status: 'online',
          lastActive: 'now',
          currentTask: 'Code review session'
        },
        {
          id: 2,
          name: 'Bob Smith',
          role: 'Project Manager',
          avatar: '/placeholder.svg',
          status: 'away',
          lastActive: '30 min ago',
          currentTask: 'Client meeting'
        },
        {
          id: 3,
          name: 'Carol Davis',
          role: 'Designer',
          avatar: '/placeholder.svg',
          status: 'online',
          lastActive: '5 min ago',
          currentTask: 'UI mockup design'
        },
        {
          id: 4,
          name: 'David Wilson',
          role: 'Developer',
          avatar: '/placeholder.svg',
          status: 'offline',
          lastActive: '2 hours ago',
          currentTask: 'Feature development'
        }
      ],
      recentActivity: [
        {
          id: 1,
          type: 'task_completed',
          message: 'Completed "API Integration" task',
          timestamp: '2 hours ago',
          priority: 'medium'
        },
        {
          id: 2,
          type: 'message_received',
          message: 'New urgent message from Team Lead',
          timestamp: '3 hours ago',
          priority: 'high'
        },
        {
          id: 3,
          type: 'task_assigned',
          message: 'New task assigned: "Bug fixes"',
          timestamp: '1 day ago',
          priority: 'medium'
        }
      ],
      upcomingDeadlines: [
        {
          id: 1,
          task: 'Fix payment gateway integration',
          dueDate: '2025-09-08',
          priority: 'critical',
          hoursLeft: 6
        },
        {
          id: 2,
          task: 'Implement user authentication',
          dueDate: '2025-09-10',
          priority: 'high',
          hoursLeft: 18
        }
      ]
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching team member dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// ===== TEAM MESSAGING SYSTEM ROUTES =====
app.get('/api/team/messages/:teamId', authenticateToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    // Mock team messages with priority and role-based colors
    const messages = [
      {
        id: 1,
        senderId: 1,
        senderName: 'Alice Johnson',
        senderRole: 'Team Lead',
        message: 'Team meeting at 3 PM today. Please review the sprint goals beforehand.',
        timestamp: '2025-09-06T10:30:00Z',
        priority: 'high',
        replyTime: 2, // hours
        status: 'sent',
        reactions: { '👍': 3, '✅': 2 },
        mentions: [2, 3, 4],
        isEdited: false,
        threadReplies: 2
      },
      {
        id: 2,
        senderId: 3,
        senderName: 'Carol Davis',
        senderRole: 'Designer',
        message: 'I\'ve uploaded the new UI mockups to the shared folder. Please take a look!',
        timestamp: '2025-09-06T09:15:00Z',
        priority: 'medium',
        replyTime: 4,
        status: 'delivered',
        reactions: { '🎨': 2, '👍': 1 },
        mentions: [1],
        isEdited: false,
        threadReplies: 0,
        attachments: [
          { name: 'UI_Mockup_v2.fig', size: '2.5MB', type: 'figma' }
        ]
      },
      {
        id: 3,
        senderId: 2,
        senderName: 'Bob Smith',
        senderRole: 'Project Manager',
        message: 'URGENT: Client demo moved to tomorrow morning. We need to finalize the presentation.',
        timestamp: '2025-09-06T08:45:00Z',
        priority: 'critical',
        replyTime: 1,
        status: 'read',
        reactions: { '⚠️': 5, '👍': 2 },
        mentions: [1, 3, 4, 5],
        isEdited: false,
        threadReplies: 5
      },
      {
        id: 4,
        senderId: 4,
        senderName: 'David Wilson',
        senderRole: 'Developer',
        message: 'The payment gateway integration is complete. Ready for testing.',
        timestamp: '2025-09-06T07:20:00Z',
        priority: 'medium',
        replyTime: 6,
        status: 'read',
        reactions: { '✅': 3, '🚀': 1 },
        mentions: [1, 2],
        isEdited: false,
        threadReplies: 1
      },
      {
        id: 5,
        senderId: 5,
        senderName: 'Eve Martinez',
        senderRole: 'QA Engineer',
        message: 'Found some bugs in the authentication flow. Creating tickets now.',
        timestamp: '2025-09-05T16:30:00Z',
        priority: 'high',
        replyTime: 3,
        status: 'read',
        reactions: { '🐛': 2, '👍': 1 },
        mentions: [1, 4],
        isEdited: true,
        threadReplies: 3
      }
    ];

    const totalMessages = messages.length;
    const paginatedMessages = messages.slice(offset, offset + limit);

    res.json({
      messages: paginatedMessages,
      pagination: {
        total: totalMessages,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + limit < totalMessages
      },
      teamInfo: {
        id: parseInt(teamId),
        name: 'Product Development Team',
        memberCount: 8,
        onlineCount: 5
      }
    });
  } catch (error) {
    console.error('Error fetching team messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/team/messages/:teamId/send', authenticateToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { message, priority = 'medium', mentions = [], replyTime } = req.body;
    const userId = req.user.id;

    // Mock message creation
    const newMessage = {
      id: Date.now(),
      senderId: userId,
      senderName: req.user.username || 'User',
      senderRole: req.user.role || 'Team Member',
      message,
      timestamp: new Date().toISOString(),
      priority,
      replyTime: replyTime || 24, // default 24 hours
      status: 'sent',
      reactions: {},
      mentions,
      isEdited: false,
      threadReplies: 0
    };

    // In real implementation, save to database and broadcast via socket
    res.json({
      success: true,
      message: newMessage,
      notification: `Message sent with ${priority} priority`
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.put('/api/team/messages/:messageId/priority', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { priority } = req.body;
    const userId = req.user.id;

    // Mock priority update (only sender can update)
    const updatedMessage = {
      id: parseInt(messageId),
      priority,
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    };

    res.json({
      success: true,
      message: updatedMessage,
      notification: `Message priority updated to ${priority}`
    });
  } catch (error) {
    console.error('Error updating message priority:', error);
    res.status(500).json({ error: 'Failed to update priority' });
  }
});

app.post('/api/team/messages/:messageId/react', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    // Mock reaction handling
    res.json({
      success: true,
      messageId: parseInt(messageId),
      emoji,
      userId,
      action: 'added'
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

app.get('/api/team/messages/:messageId/thread', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    
    // Mock thread replies
    const threadReplies = [
      {
        id: 1,
        parentId: parseInt(messageId),
        senderId: 2,
        senderName: 'Bob Smith',
        senderRole: 'Project Manager',
        message: 'Agreed! Let\'s prioritize this.',
        timestamp: '2025-09-06T11:00:00Z',
        reactions: { '👍': 2 }
      },
      {
        id: 2,
        parentId: parseInt(messageId),
        senderId: 4,
        senderName: 'David Wilson',
        senderRole: 'Developer',
        message: 'I can help with the implementation.',
        timestamp: '2025-09-06T11:15:00Z',
        reactions: { '🙋': 1 }
      }
    ];

    res.json({ replies: threadReplies });
  } catch (error) {
    console.error('Error fetching thread:', error);
    res.status(500).json({ error: 'Failed to fetch thread' });
  }
});

// ===== TEAM MEMBER PERFORMANCE ROUTES =====
app.get('/api/team/member/:memberId/performance', authenticateToken, async (req, res) => {
  try {
    const { memberId } = req.params;
    
    const performanceData = {
      memberId: parseInt(memberId),
      period: '30_days',
      metrics: {
        tasksCompleted: 45,
        averageResponseTime: 2.3, // hours
        onTimeDelivery: 92, // percentage
        codeQuality: 88, // percentage
        teamCollaboration: 95, // percentage
        messageReplyTime: 1.5 // hours average
      },
      trends: {
        productivity: 'increasing',
        responseTime: 'decreasing',
        quality: 'stable'
      },
      achievements: [
        { name: 'Quick Responder', description: 'Average reply time under 2 hours', earned: '2025-09-01' },
        { name: 'Quality Code', description: '90%+ code review score', earned: '2025-08-25' }
      ],
      weeklyStats: [
        { week: 'Week 1', tasks: 12, quality: 90, responseTime: 1.8 },
        { week: 'Week 2', tasks: 10, quality: 85, responseTime: 2.1 },
        { week: 'Week 3', tasks: 13, quality: 92, responseTime: 1.5 },
        { week: 'Week 4', tasks: 10, quality: 88, responseTime: 2.0 }
      ]
    };

    res.json(performanceData);
  } catch (error) {
    console.error('Error fetching performance data:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

// ===== ADMIN DASHBOARD ROUTES =====
app.get('/api/admin/overview', authenticateToken, async (req, res) => {
  try {
    // Check if user has admin privileges
    if (req.user.role !== 'admin' && req.user.role !== 'system_admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Mock admin overview data
    const adminOverview = {
      systemMetrics: {
        totalUsers: 1247,
        activeUsers: 892,
        totalTeams: 84,
        activeTeams: 76,
        totalProjects: 228,
        activeProjects: 185,
        systemUptime: '99.98%',
        storageUsed: 67,
        responseTime: '145ms',
        dailyActiveUsers: 892
      },
      userGrowth: [
        { month: 'Jan', users: 400, teams: 45, projects: 120 },
        { month: 'Feb', users: 450, teams: 52, projects: 135 },
        { month: 'Mar', users: 520, teams: 48, projects: 142 },
        { month: 'Apr', users: 580, teams: 61, projects: 158 },
        { month: 'May', users: 630, teams: 68, projects: 167 },
        { month: 'Jun', users: 720, teams: 74, projects: 185 },
        { month: 'Jul', users: 780, teams: 79, projects: 198 },
        { month: 'Aug', users: 850, teams: 84, projects: 215 },
        { month: 'Sep', users: 892, teams: 88, projects: 228 }
      ],
      systemHealth: {
        cpu: 23,
        memory: 67,
        disk: 45,
        network: 'stable',
        services: {
          database: 'healthy',
          redis: 'healthy',
          fileStorage: 'healthy',
          notifications: 'healthy',
          webrtc: 'healthy',
          auth: 'healthy'
        }
      },
      recentActivity: [
        {
          id: 1,
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          level: 'info',
          message: 'User login successful',
          user: 'alice.johnson@company.com',
          module: 'auth'
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          level: 'warning',
          message: 'High memory usage detected',
          module: 'system'
        },
        {
          id: 3,
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          level: 'info',
          message: 'New team created: Engineering',
          user: 'david.wilson@company.com',
          module: 'teams'
        }
      ]
    };

    res.json(adminOverview);
  } catch (error) {
    console.error('Error fetching admin overview:', error);
    res.status(500).json({ error: 'Failed to fetch admin overview' });
  }
});

app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    // Check admin privileges
    if (req.user.role !== 'admin' && req.user.role !== 'system_admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { search, status, role, limit = 50, offset = 0 } = req.query;

    // Mock users data
    const users = [
      {
        id: 1,
        name: 'Alice Johnson',
        email: 'alice.johnson@company.com',
        role: 'Team Lead',
        status: 'active',
        joinDate: '2024-01-15',
        lastActive: '2 minutes ago',
        teams: 2,
        projects: 8,
        avatar: '/placeholder.svg'
      },
      {
        id: 2,
        name: 'Bob Smith',
        email: 'bob.smith@company.com',
        role: 'Developer',
        status: 'active',
        joinDate: '2024-02-20',
        lastActive: '1 hour ago',
        teams: 1,
        projects: 5,
        avatar: '/placeholder.svg'
      },
      {
        id: 3,
        name: 'Carol Davis',
        email: 'carol.davis@company.com',
        role: 'Designer',
        status: 'inactive',
        joinDate: '2024-03-10',
        lastActive: '2 days ago',
        teams: 1,
        projects: 3,
        avatar: '/placeholder.svg'
      },
      {
        id: 4,
        name: 'David Wilson',
        email: 'david.wilson@company.com',
        role: 'Project Manager',
        status: 'active',
        joinDate: '2024-01-05',
        lastActive: '5 minutes ago',
        teams: 3,
        projects: 12,
        avatar: '/placeholder.svg'
      },
      {
        id: 5,
        name: 'Eve Martinez',
        email: 'eve.martinez@company.com',
        role: 'QA Engineer',
        status: 'suspended',
        joinDate: '2024-04-12',
        lastActive: '1 week ago',
        teams: 1,
        projects: 2,
        avatar: '/placeholder.svg'
      }
    ];

    // Apply filters
    let filteredUsers = users;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower)
      );
    }
    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    const total = filteredUsers.length;
    const paginatedUsers = filteredUsers.slice(offset, offset + parseInt(limit));

    res.json({
      users: paginatedUsers,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + parseInt(limit) < total
      }
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/admin/teams', authenticateToken, async (req, res) => {
  try {
    // Check admin privileges
    if (req.user.role !== 'admin' && req.user.role !== 'system_admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Mock teams data
    const teams = [
      {
        id: 1,
        name: 'Product Development',
        memberCount: 12,
        projectCount: 8,
        status: 'active',
        createdDate: '2024-01-10',
        owner: 'Alice Johnson',
        performance: 92
      },
      {
        id: 2,
        name: 'Marketing Team',
        memberCount: 8,
        projectCount: 5,
        status: 'active',
        createdDate: '2024-02-15',
        owner: 'David Wilson',
        performance: 87
      },
      {
        id: 3,
        name: 'Design Team',
        memberCount: 6,
        projectCount: 4,
        status: 'active',
        createdDate: '2024-03-01',
        owner: 'Carol Davis',
        performance: 94
      },
      {
        id: 4,
        name: 'QA Team',
        memberCount: 4,
        projectCount: 3,
        status: 'inactive',
        createdDate: '2024-04-20',
        owner: 'Eve Martinez',
        performance: 78
      }
    ];

    res.json({ teams });
  } catch (error) {
    console.error('Error fetching admin teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

app.get('/api/admin/system-logs', authenticateToken, async (req, res) => {
  try {
    // Check admin privileges
    if (req.user.role !== 'admin' && req.user.role !== 'system_admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { level, module, limit = 50, offset = 0 } = req.query;

    // Mock system logs
    const logs = [
      {
        id: 1,
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        level: 'info',
        message: 'User login successful',
        user: 'alice.johnson@company.com',
        module: 'auth'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        level: 'warning',
        message: 'High memory usage detected',
        module: 'system'
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        level: 'error',
        message: 'Failed to send notification email',
        user: 'bob.smith@company.com',
        module: 'notification'
      },
      {
        id: 4,
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        level: 'info',
        message: 'New team created: Engineering',
        user: 'david.wilson@company.com',
        module: 'teams'
      },
      {
        id: 5,
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        level: 'warning',
        message: 'Database connection timeout',
        module: 'database'
      }
    ];

    // Apply filters
    let filteredLogs = logs;
    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    if (module) {
      filteredLogs = filteredLogs.filter(log => log.module === module);
    }

    const total = filteredLogs.length;
    const paginatedLogs = filteredLogs.slice(offset, offset + parseInt(limit));

    res.json({
      logs: paginatedLogs,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + parseInt(limit) < total
      }
    });
  } catch (error) {
    console.error('Error fetching system logs:', error);
    res.status(500).json({ error: 'Failed to fetch system logs' });
  }
});

app.post('/api/admin/users/:userId/action', authenticateToken, async (req, res) => {
  try {
    // Check admin privileges
    if (req.user.role !== 'admin' && req.user.role !== 'system_admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId } = req.params;
    const { action, reason } = req.body;

    // Mock user action handling
    const actions = ['suspend', 'activate', 'delete', 'reset_password', 'change_role'];
    
    if (!actions.includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    // Log the admin action
    console.log(`Admin ${req.user.id} performed action '${action}' on user ${userId}. Reason: ${reason || 'None provided'}`);

    res.json({
      success: true,
      message: `User ${action} action completed successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error performing user action:', error);
    res.status(500).json({ error: 'Failed to perform user action' });
  }
});

app.get('/api/admin/analytics', authenticateToken, async (req, res) => {
  try {
    // Check admin privileges
    if (req.user.role !== 'admin' && req.user.role !== 'system_admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { period = '30d' } = req.query;

    // Mock analytics data
    const analytics = {
      userEngagement: {
        dailyActiveUsers: 892,
        weeklyActiveUsers: 1156,
        monthlyActiveUsers: 1247,
        avgSessionDuration: '24 minutes',
        avgPagesPerSession: 12.5
      },
      systemPerformance: {
        avgResponseTime: 145,
        uptime: 99.98,
        errorRate: 0.02,
        throughput: 1250
      },
      contentStats: {
        totalMessages: 15420,
        totalFiles: 2890,
        totalMeetings: 567,
        totalProjects: 228
      },
      securityMetrics: {
        failedLogins: 23,
        suspiciousActivity: 2,
        twoFactorEnabled: 78.5,
        passwordResets: 15
      }
    };

    res.json({ analytics, period });
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

app.put('/api/admin/settings', authenticateToken, async (req, res) => {
  try {
    // Check admin privileges
    if (req.user.role !== 'admin' && req.user.role !== 'system_admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const settings = req.body;

    // Mock settings update
    console.log('Admin settings updated:', settings);

    res.json({
      success: true,
      message: 'Settings updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating admin settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ===== PRIORITY AND COLOR CONFIGURATION =====
app.get('/api/config/message-colors', (req, res) => {
  const messageColorConfig = {
    priorities: {
      critical: {
        background: '#fee2e2',
        border: '#fca5a5',
        text: '#dc2626',
        icon: '🚨'
      },
      high: {
        background: '#fef3c7',
        border: '#fbbf24',
        text: '#d97706',
        icon: '⚠️'
      },
      medium: {
        background: '#dbeafe',
        border: '#60a5fa',
        text: '#2563eb',
        icon: 'ℹ️'
      },
      low: {
        background: '#dcfce7',
        border: '#4ade80',
        text: '#16a34a',
        icon: '📝'
      }
    },
    roles: {
      'Team Lead': {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: '#667eea',
        text: '#ffffff',
        badge: '👑'
      },
      'Project Manager': {
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        border: '#f093fb',
        text: '#ffffff',
        badge: '📋'
      },
      'Senior Developer': {
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        border: '#4facfe',
        text: '#ffffff',
        badge: '💻'
      },
      'Developer': {
        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        border: '#43e97b',
        text: '#ffffff',
        badge: '🔧'
      },
      'Designer': {
        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        border: '#fa709a',
        text: '#ffffff',
        badge: '🎨'
      },
      'QA Engineer': {
        background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        border: '#a8edea',
        text: '#374151',
        badge: '🔍'
      }
    },
    status: {
      online: '#10b981',
      away: '#f59e0b',
      busy: '#ef4444',
      offline: '#6b7280'
    }
  };

  res.json(messageColorConfig);
});

// WebRTC Signaling & Chat via Socket.IO
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins a room
  socket.on('join-room', ({ roomId, user }) => {
    socket.join(roomId);
    
    const { room, participant } = webrtcService.joinRoom(roomId, socket.id, {
      name: user.name || 'Anonymous',
      avatar: user.avatar || '',
      isMuted: false,
      isVideoOff: false
    });
    
    // Notify other participants
    socket.to(roomId).emit('user-joined', participant);
    
    // Send current participants to the new user
    const participants = Array.from(room.participants.values());
    socket.emit('room-participants', participants);
    
    console.log(`User ${participant.name} joined room ${roomId}`);
  });

  // WebRTC Signaling
  socket.on('offer', ({ roomId, offer, targetId }) => {
    socket.to(targetId).emit('offer', {
      offer,
      senderId: socket.id
    });
  });

  socket.on('answer', ({ roomId, answer, targetId }) => {
    socket.to(targetId).emit('answer', {
      answer,
      senderId: socket.id
    });
  });

  socket.on('ice-candidate', ({ roomId, candidate, targetId }) => {
    socket.to(targetId).emit('ice-candidate', {
      candidate,
      senderId: socket.id
    });
  });

  // Media controls
  socket.on('toggle-audio', ({ roomId, isMuted }) => {
    const participant = webrtcService.updateParticipant(roomId, socket.id, { isMuted });
    if (participant) {
      socket.to(roomId).emit('user-audio-toggled', {
        userId: socket.id,
        isMuted
      });
    }
  });

  socket.on('toggle-video', ({ roomId, isVideoOff }) => {
    const participant = webrtcService.updateParticipant(roomId, socket.id, { isVideoOff });
    if (participant) {
      socket.to(roomId).emit('user-video-toggled', {
        userId: socket.id,
        isVideoOff
      });
    }
  });

  // Chat functionality
  socket.on('send-message', ({ roomId, message, user }) => {
    const chatMessage = chatService.sendMessage(roomId, message, {
      id: socket.id,
      name: user.name || 'Anonymous',
      avatar: user.avatar || ''
    });
    
    // Broadcast to all users in the room
    io.to(roomId).emit('new-message', chatMessage);
    
    console.log(`Message in room ${roomId}:`, chatMessage);
  });

  // Message reactions
  socket.on('add-reaction', ({ roomId, messageId, emoji }) => {
    const message = chatService.addReaction(roomId, messageId, socket.id, emoji);
    if (message) {
      io.to(roomId).emit('reaction-added', {
        messageId,
        emoji,
        userId: socket.id,
        reactions: Object.fromEntries(message.reactions)
      });
    }
  });

  socket.on('remove-reaction', ({ roomId, messageId, emoji }) => {
    const message = chatService.removeReaction(roomId, messageId, socket.id, emoji);
    if (message) {
      io.to(roomId).emit('reaction-removed', {
        messageId,
        emoji,
        userId: socket.id,
        reactions: Object.fromEntries(message.reactions)
      });
    }
  });

  // Typing indicators
  socket.on('typing', ({ roomId, isTyping }) => {
    const typingUsers = chatService.setTyping(roomId, socket.id, isTyping);
    socket.to(roomId).emit('typing-update', {
      typingUsers: typingUsers.filter(id => id !== socket.id)
    });
  });

  // Screen sharing
  socket.on('start-screen-share', ({ roomId }) => {
    socket.to(roomId).emit('user-started-screen-share', {
      userId: socket.id
    });
  });

  socket.on('stop-screen-share', ({ roomId }) => {
    socket.to(roomId).emit('user-stopped-screen-share', {
      userId: socket.id
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    // Find which room the user was in
    const rooms = webrtcService.getAllRooms();
    for (const room of rooms) {
      if (room.participants.has(socket.id)) {
        const result = webrtcService.leaveRoom(room.id, socket.id);
        if (result) {
          socket.to(room.id).emit('user-left', {
            userId: socket.id,
            name: result.participant.name
          });
        }
        break;
      }
    }
    
    console.log('User disconnected:', socket.id);
  });

  socket.on('leave-room', ({ roomId }) => {
    socket.leave(roomId);
    const result = webrtcService.leaveRoom(roomId, socket.id);
    
    if (result) {
      socket.to(roomId).emit('user-left', {
        userId: socket.id,
        name: result.participant.name
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 PulseCollab server running on port ${PORT}`);
  console.log(`📡 WebRTC signaling server ready`);
  console.log(`💬 Chat service enabled`);
  console.log(`🔐 Authentication service ready`);
  console.log(`📁 File sharing enabled`);
  console.log(`🎨 Using PulseCollab color palette`);
});

// Cleanup services - run every hour
cron.schedule('0 * * * *', () => {
  console.log('🧹 Running cleanup tasks...');
  
  // Clean up expired sessions
  authService.cleanupExpiredSessions();
  
  // Clean up old files (older than 30 days)
  fileService.cleanupOldFiles();
  
  // Clean up old messages (older than 30 days)
  // This would be implemented in a real database scenario
  
  // Clean up old notifications
  notificationService.cleanupOldNotifications();
  
  console.log('✅ Cleanup completed');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

export { io, app, server };
