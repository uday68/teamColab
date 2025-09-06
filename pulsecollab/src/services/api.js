const API_BASE_URL = 'http://localhost:3002/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('accessToken');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // ===== AUTHENTICATION METHODS =====
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.accessToken) {
      this.setToken(data.accessToken);
    }
    
    return data;
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updateProfile(updates) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // ===== TEAM METHODS =====
  async getTeams() {
    return this.request('/teams');
  }

  async getTeam(teamId) {
    return this.request(`/teams/${teamId}`);
  }

  async createTeam(teamData) {
    return this.request('/teams', {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
  }

  async updateTeam(teamId, updates) {
    return this.request(`/teams/${teamId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTeam(teamId) {
    return this.request(`/teams/${teamId}`, { method: 'DELETE' });
  }

  async addTeamMember(teamId, email) {
    return this.request(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async removeTeamMember(teamId, memberId) {
    return this.request(`/teams/${teamId}/members/${memberId}`, {
      method: 'DELETE',
    });
  }

  async updateMemberRole(teamId, memberId, isAdmin) {
    return this.request(`/teams/${teamId}/members/${memberId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ isAdmin }),
    });
  }

  async getTeamAnalytics(teamId) {
    return this.request(`/teams/${teamId}/analytics`);
  }

  // ===== PROJECT METHODS =====
  async getProjects(teamId) {
    return this.request(`/teams/${teamId}/projects`);
  }

  async getProject(projectId) {
    return this.request(`/projects/${projectId}`);
  }

  async createProject(projectData) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(projectId, updates) {
    return this.request(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProject(projectId) {
    return this.request(`/projects/${projectId}`, { method: 'DELETE' });
  }

  async getProjectAnalytics(projectId) {
    return this.request(`/projects/${projectId}/analytics`);
  }

  // ===== TASK METHODS =====
  async getTasks(projectId, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/projects/${projectId}/tasks${queryParams ? `?${queryParams}` : ''}`;
    return this.request(endpoint);
  }

  async getTask(taskId) {
    return this.request(`/tasks/${taskId}`);
  }

  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(taskId, updates) {
    return this.request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(taskId) {
    return this.request(`/tasks/${taskId}`, { method: 'DELETE' });
  }

  async getTaskComments(taskId) {
    return this.request(`/tasks/${taskId}/comments`);
  }

  async addTaskComment(taskId, content) {
    return this.request(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // ===== ANALYTICS METHODS =====
  async getDashboardAnalytics() {
    return this.request('/analytics/dashboard');
  }

  async getProjectProgress(projectId, days = 30) {
    return this.request(`/analytics/projects/${projectId}/progress?days=${days}`);
  }

  async getTeamVelocity(teamId, weeks = 4) {
    return this.request(`/analytics/teams/${teamId}/velocity?weeks=${weeks}`);
  }

  async getBurndownChart(projectId) {
    return this.request(`/analytics/projects/${projectId}/burndown`);
  }

  // ===== HEALTH & WELLNESS METHODS =====
  async startWorkSession(projectId = null, taskId = null) {
    return this.request('/health/work-sessions/start', {
      method: 'POST',
      body: JSON.stringify({ projectId, taskId }),
    });
  }

  async endWorkSession(sessionId) {
    return this.request(`/health/work-sessions/${sessionId}/end`, {
      method: 'PUT',
    });
  }

  async getHealthStatus() {
    return this.request('/health/status');
  }

  async recordBreak() {
    return this.request('/health/break', { method: 'POST' });
  }

  async getTeamHealthOverview(teamId) {
    return this.request(`/health/teams/${teamId}/overview`);
  }

  async getWellnessRecommendations() {
    return this.request('/health/recommendations');
  }

  // ===== FILE METHODS =====
  async uploadFile(file, roomId = null) {
    const formData = new FormData();
    formData.append('file', file);
    if (roomId) {
      formData.append('roomId', roomId);
    }

    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }

  async getRoomFiles(roomId, limit = 50, offset = 0) {
    return this.request(`/rooms/${roomId}/files?limit=${limit}&offset=${offset}`);
  }

  async deleteFile(fileId) {
    return this.request(`/files/${fileId}`, { method: 'DELETE' });
  }

  // ===== MEETING & ROOM METHODS =====
  async createRoom(roomId = null) {
    return this.request('/rooms', {
      method: 'POST',
      body: JSON.stringify({ roomId }),
    });
  }

  async getRoomInfo(roomId) {
    return this.request(`/rooms/${roomId}/info`);
  }

  async getRoomParticipants(roomId) {
    return this.request(`/rooms/${roomId}/participants`);
  }

  async getRoomStats(roomId) {
    return this.request(`/rooms/${roomId}/stats`);
  }

  async getRoomMessages(roomId, limit = 50, offset = 0) {
    return this.request(`/rooms/${roomId}/messages?limit=${limit}&offset=${offset}`);
  }

  async searchMessages(roomId, query, limit = 20) {
    return this.request(`/rooms/${roomId}/messages/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  async getChatStats(roomId) {
    return this.request(`/rooms/${roomId}/chat/stats`);
  }

  // ===== CONFIG METHODS =====
  async getAppConfig() {
    return this.request('/config');
  }

  async getWebRTCConfig() {
    return this.request('/webrtc/config');
  }
}

export const apiService = new ApiService();
export default apiService;
