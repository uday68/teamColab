import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  MessageSquare, 
  FileText, 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Bell,
  Search,
  Plus,
  Settings,
  LogOut,
  Zap,
  Target,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const projects = [
    {
      id: 1,
      name: 'PulseCollab Platform',
      status: 'active',
      progress: 85,
      team: ['Alice', 'Bob', 'Charlie'],
      deadline: '2025-09-15',
      priority: 'high'
    },
    {
      id: 2,
      name: 'Mobile App Redesign',
      status: 'planning',
      progress: 25,
      team: ['Diana', 'Eve'],
      deadline: '2025-10-01',
      priority: 'medium'
    },
    {
      id: 3,
      name: 'API Documentation',
      status: 'review',
      progress: 90,
      team: ['Frank', 'Grace'],
      deadline: '2025-09-20',
      priority: 'low'
    }
  ];

  const recentActivities = [
    { id: 1, user: 'Alice', action: 'completed task "API Integration"', time: '2 hours ago', type: 'task' },
    { id: 2, user: 'Bob', action: 'started video call in #development', time: '3 hours ago', type: 'call' },
    { id: 3, user: 'Charlie', action: 'uploaded design files', time: '5 hours ago', type: 'file' },
    { id: 4, user: 'Diana', action: 'commented on "User Auth" task', time: '1 day ago', type: 'comment' }
  ];

  const upcomingMeetings = [
    { id: 1, title: 'Daily Standup', time: '9:00 AM', participants: 5 },
    { id: 2, title: 'Design Review', time: '2:00 PM', participants: 3 },
    { id: 3, title: 'Client Demo', time: '4:00 PM', participants: 8 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-pulse-success';
      case 'planning': return 'bg-pulse-warning';
      case 'review': return 'bg-pulse-primary';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-pulse-danger';
      case 'medium': return 'bg-pulse-warning';
      case 'low': return 'bg-pulse-success';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold pulse-primary">PulseCollab</span>
              </div>
              
              <div className="hidden md:flex items-center space-x-6 ml-8">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'overview' ? 'bg-blue-100 pulse-primary' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => setActiveTab('projects')}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'projects' ? 'bg-blue-100 pulse-primary' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Projects
                </button>
                <button 
                  onClick={() => setActiveTab('team')}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'team' ? 'bg-blue-100 pulse-primary' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Team
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-primary"
                />
              </div>
              
              <Button size="sm" className="gradient-primary">
                <Plus className="w-4 h-4 mr-1" />
                New
              </Button>
              
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              
              <Button variant="outline" size="sm">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, John! 👋</h1>
          <p className="text-gray-600">Here's what's happening with your projects today.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold pulse-primary">3</p>
                </div>
                <Target className="w-8 h-8 pulse-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Team Members</p>
                  <p className="text-2xl font-bold pulse-secondary">12</p>
                </div>
                <Users className="w-8 h-8 pulse-secondary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed Tasks</p>
                  <p className="text-2xl font-bold pulse-success">24</p>
                </div>
                <CheckCircle className="w-8 h-8 pulse-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Reviews</p>
                  <p className="text-2xl font-bold pulse-warning">7</p>
                </div>
                <AlertCircle className="w-8 h-8 pulse-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects Overview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Active Projects</span>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{project.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={`${getPriorityColor(project.priority)} text-white`}>
                            {project.priority}
                          </Badge>
                          <Badge variant="outline" className={`${getStatusColor(project.status)} text-white`}>
                            {project.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-pulse-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{project.team.join(', ')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{project.deadline}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start gradient-primary">
                  <Video className="w-4 h-4 mr-2" />
                  Start Video Call
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  New Chat
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Create Document
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Meetings */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Meetings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{meeting.title}</p>
                        <p className="text-xs text-gray-600 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {meeting.time}
                        </p>
                      </div>
                      <Badge variant="outline">{meeting.participants}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-pulse-primary rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.user}</span> {activity.action}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
