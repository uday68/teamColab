import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Clock, 
  MessageSquare, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  TrendingUp,
  Star,
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Reply,
  Flag,
  Bell,
  Settings,
  Target,
  Award,
  Timer,
  Plus
} from 'lucide-react';

interface TeamMemberDashboardProps {
  memberId: string;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  avatar: string;
  status: string;
  team: string;
  joinDate: string;
  skillLevel: string;
  performance: {
    tasksCompleted: number;
    onTimeDelivery: number;
    codeQuality: number;
    teamCollaboration: number;
  };
}

interface Task {
  id: number;
  title: string;
  priority: string;
  status: string;
  dueDate: string;
  estimatedHours: number;
  spentHours: number;
  project: string;
  assignedBy: { name: string; role: string };
}

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: string;
  priority: string;
  replyTime: number;
  status: string;
  reactions: Record<string, number>;
  threadReplies: number;
}

interface DashboardData {
  member: TeamMember;
  currentTasks: Task[];
  teamMembers: Array<{
    id: number;
    name: string;
    role: string;
    avatar: string;
    status: string;
    lastActive: string;
    currentTask: string;
  }>;
  upcomingDeadlines: Array<{
    id: number;
    task: string;
    dueDate: string;
    priority: string;
    hoursLeft: number;
  }>;
}

const TeamMemberDashboard: React.FC<TeamMemberDashboardProps> = ({ memberId }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'messages' | 'performance'>('overview');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messagePriority, setMessagePriority] = useState('medium');
  const [loading, setLoading] = useState(true);

  // Mock data - In real app, fetch from API
  useEffect(() => {
    const mockData = {
      member: {
        id: 1,
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

    const mockMessages = [
      {
        id: 1,
        senderId: 1,
        senderName: 'Alice Johnson',
        senderRole: 'Team Lead',
        message: 'Team meeting at 3 PM today. Please review the sprint goals beforehand.',
        timestamp: '2025-09-06T10:30:00Z',
        priority: 'high',
        replyTime: 2,
        status: 'sent',
        reactions: { '👍': 3, '✅': 2 },
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
        threadReplies: 0
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
        threadReplies: 5
      }
    ];

    setDashboardData(mockData);
    setMessages(mockMessages);
    setLoading(false);
  }, [memberId]);

  const getPriorityColor = (priority: string) => {
    const priorityColors = {
      critical: { bg: '#fee2e2', border: '#fca5a5', text: '#dc2626' },
      high: { bg: '#fef3c7', border: '#fbbf24', text: '#d97706' },
      medium: { bg: '#dbeafe', border: '#60a5fa', text: '#2563eb' },
      low: { bg: '#dcfce7', border: '#4ade80', text: '#16a34a' }
    };
    return priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium;
  };

  const getRoleColor = (role: string) => {
    const roleColors = {
      'Team Lead': { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', badge: '👑' },
      'Project Manager': { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', badge: '📋' },
      'Senior Developer': { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', badge: '💻' },
      'Developer': { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', badge: '🔧' },
      'Designer': { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', badge: '🎨' },
      'QA Engineer': { bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', badge: '🔍' }
    };
    return roleColors[role as keyof typeof roleColors] || roleColors['Developer'];
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      online: '#10b981',
      away: '#f59e0b',
      busy: '#ef4444',
      offline: '#6b7280'
    };
    return statusColors[status as keyof typeof statusColors] || statusColors.offline;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diff = now.getTime() - messageTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      senderId: dashboardData?.member.id,
      senderName: dashboardData?.member.name,
      senderRole: dashboardData?.member.role,
      message: newMessage,
      timestamp: new Date().toISOString(),
      priority: messagePriority,
      replyTime: messagePriority === 'critical' ? 1 : messagePriority === 'high' ? 2 : 24,
      status: 'sent',
      reactions: {},
      threadReplies: 0
    };

    setMessages([message, ...messages]);
    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={dashboardData?.member.avatar} />
                <AvatarFallback>{dashboardData?.member.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{dashboardData?.member.name}</h1>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{dashboardData?.member.role}</span>
                  <span 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getStatusColor(dashboardData?.member.status) }}
                  ></span>
                  <span className="text-xs text-gray-500 capitalize">{dashboardData?.member.status}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Target },
              { id: 'tasks', label: 'My Tasks', icon: CheckCircle },
              { id: 'messages', label: 'Team Messages', icon: MessageSquare },
              { id: 'performance', label: 'Performance', icon: Award }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'tasks' | 'messages' | 'performance')}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Performance Metrics */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tasks Completed</span>
                        <span className="font-semibold">{dashboardData?.member.performance.tasksCompleted}</span>
                      </div>
                      <Progress value={dashboardData?.member.performance.tasksCompleted} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">On-Time Delivery</span>
                        <span className="font-semibold">{dashboardData?.member.performance.onTimeDelivery}%</span>
                      </div>
                      <Progress value={dashboardData?.member.performance.onTimeDelivery} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Code Quality</span>
                        <span className="font-semibold">{dashboardData?.member.performance.codeQuality}%</span>
                      </div>
                      <Progress value={dashboardData?.member.performance.codeQuality} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Team Collaboration</span>
                        <span className="font-semibold">{dashboardData?.member.performance.teamCollaboration}%</span>
                      </div>
                      <Progress value={dashboardData?.member.performance.teamCollaboration} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData?.currentTasks.map((task: Task) => {
                      const priorityColor = getPriorityColor(task.priority);
                      return (
                        <div key={task.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium">{task.title}</h3>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="outline" 
                                style={{ 
                                  backgroundColor: priorityColor.bg,
                                  borderColor: priorityColor.border,
                                  color: priorityColor.text
                                }}
                              >
                                {task.priority}
                              </Badge>
                              <Badge variant="outline">{task.status}</Badge>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Project:</span> {task.project}
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Progress: {task.spentHours}/{task.estimatedHours}h</span>
                            <span>Due: {task.dueDate}</span>
                          </div>
                          <div className="mt-2">
                            <Progress value={(task.spentHours / task.estimatedHours) * 100} className="h-2" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Upcoming Deadlines */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Timer className="w-5 h-5" />
                    <span>Upcoming Deadlines</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData?.upcomingDeadlines.map((deadline) => {
                      const priorityColor = getPriorityColor(deadline.priority);
                      return (
                        <div key={deadline.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{deadline.task}</p>
                            <p className="text-xs text-gray-600">{deadline.dueDate}</p>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant="outline" 
                              style={{ 
                                backgroundColor: priorityColor.bg,
                                borderColor: priorityColor.border,
                                color: priorityColor.text
                              }}
                            >
                              {deadline.hoursLeft}h left
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Team Members */}
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData?.teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span 
                            className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                            style={{ backgroundColor: getStatusColor(member.status) }}
                          ></span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData?.currentTasks.map((task: Task) => {
                const priorityColor = getPriorityColor(task.priority);
                return (
                  <Card key={task.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Badge 
                          variant="outline" 
                          style={{ 
                            backgroundColor: priorityColor.bg,
                            borderColor: priorityColor.border,
                            color: priorityColor.text
                          }}
                        >
                          {task.priority}
                        </Badge>
                        <Badge variant="outline">{task.status}</Badge>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2">{task.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">Project: {task.project}</p>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{task.spentHours}/{task.estimatedHours}h</span>
                        </div>
                        <Progress value={(task.spentHours / task.estimatedHours) * 100} className="h-3" />
                        
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Due: {task.dueDate}</span>
                          </div>
                        </div>
                        
                        <div className="pt-3 border-t">
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              View Details
                            </Button>
                            <Button size="sm" className="flex-1">
                              Update Status
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Message List */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Team Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {messages.map((message) => {
                      const priorityColor = getPriorityColor(message.priority);
                      const roleColor = getRoleColor(message.senderRole);
                      
                      return (
                        <div key={message.id} className="border rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback 
                                style={{ background: roleColor.bg }}
                                className="text-white text-xs"
                              >
                                {message.senderName.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-sm">{message.senderName}</span>
                                <span className="text-xs">{roleColor.badge}</span>
                                <Badge 
                                  variant="outline" 
                                  className="text-xs"
                                  style={{ 
                                    backgroundColor: priorityColor.bg,
                                    borderColor: priorityColor.border,
                                    color: priorityColor.text
                                  }}
                                >
                                  {message.priority}
                                </Badge>
                                <span className="text-xs text-gray-500">{formatTimeAgo(message.timestamp)}</span>
                              </div>
                              
                              <p className="text-sm text-gray-900 mb-2">{message.message}</p>
                              
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Reply in {message.replyTime}h</span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  {Object.entries(message.reactions).map(([emoji, count]) => (
                                    <span key={emoji} className="flex items-center space-x-1">
                                      <span>{emoji}</span>
                                      <span>{count as number}</span>
                                    </span>
                                  ))}
                                </div>
                                
                                {message.threadReplies > 0 && (
                                  <span>{message.threadReplies} replies</span>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-2 mt-2">
                                <Button size="sm" variant="ghost">
                                  <Reply className="w-3 h-3 mr-1" />
                                  Reply
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <Smile className="w-3 h-3 mr-1" />
                                  React
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <Flag className="w-3 h-3 mr-1" />
                                  Priority
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Message Input */}
                  <div className="mt-6 border-t pt-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm font-medium">Priority:</span>
                      <select 
                        value={messagePriority} 
                        onChange={(e) => setMessagePriority(e.target.value)}
                        className="text-xs border rounded px-2 py-1"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      />
                      <Button size="sm" variant="ghost">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button size="sm" onClick={sendMessage}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Message Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Message Priority Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { priority: 'critical', label: 'Critical', time: '1h', desc: 'Urgent issues' },
                    { priority: 'high', label: 'High', time: '2h', desc: 'Important tasks' },
                    { priority: 'medium', label: 'Medium', time: '24h', desc: 'Regular updates' },
                    { priority: 'low', label: 'Low', time: 'No limit', desc: 'General info' }
                  ].map((item) => {
                    const color = getPriorityColor(item.priority);
                    return (
                      <div key={item.priority} className="text-xs">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: color.border }}
                          ></div>
                          <span className="font-medium">{item.label}</span>
                          <span className="text-gray-500">({item.time})</span>
                        </div>
                        <p className="text-gray-600 ml-5">{item.desc}</p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Role Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries({
                    'Team Lead': '👑',
                    'Project Manager': '📋',
                    'Senior Developer': '💻',
                    'Developer': '🔧',
                    'Designer': '🎨',
                    'QA Engineer': '🔍'
                  }).map(([role, badge]) => {
                    const color = getRoleColor(role);
                    return (
                      <div key={role} className="flex items-center space-x-2 text-xs">
                        <div 
                          className="w-4 h-4 rounded text-white flex items-center justify-center text-xs"
                          style={{ background: color.bg }}
                        >
                          {badge}
                        </div>
                        <span>{role}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Tasks Completed</p>
                      <p className="text-2xl font-bold text-green-600">45</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Response Time</p>
                      <p className="text-2xl font-bold text-blue-600">2.3h</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Code Quality</p>
                      <p className="text-2xl font-bold text-purple-600">88%</p>
                    </div>
                    <Star className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Team Rating</p>
                      <p className="text-2xl font-bold text-orange-600">95%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { week: 'Week 1', tasks: 12, quality: 90, responseTime: 1.8 },
                    { week: 'Week 2', tasks: 10, quality: 85, responseTime: 2.1 },
                    { week: 'Week 3', tasks: 13, quality: 92, responseTime: 1.5 },
                    { week: 'Week 4', tasks: 10, quality: 88, responseTime: 2.0 }
                  ].map((week, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="font-medium mb-3">{week.week}</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <span className="text-sm text-gray-600">Tasks: {week.tasks}</span>
                          <Progress value={(week.tasks / 15) * 100} className="h-2 mt-1" />
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Quality: {week.quality}%</span>
                          <Progress value={week.quality} className="h-2 mt-1" />
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Response: {week.responseTime}h</span>
                          <Progress value={100 - (week.responseTime * 20)} className="h-2 mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMemberDashboard;
