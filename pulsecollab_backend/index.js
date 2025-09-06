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
