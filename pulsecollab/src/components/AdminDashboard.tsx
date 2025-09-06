import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Shield,
  Users,
  Settings,
  BarChart3,
  Server,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  UserPlus,
  UserMinus,
  Clock,
  MessageSquare,
  Video,
  FileText,
  Trash2,
  Edit,
  Eye,
  Search,
  Filter,
  Download,
  RefreshCw,
  Bell,
  Globe,
  Lock,
  Unlock,
  Crown,
  Building,
  Calendar,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Target,
  Zap,
  Heart,
  Star,
  Award,
  Flag,
  Archive,
  Copy,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Types
interface SystemMetric {
  name: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  status: 'healthy' | 'warning' | 'critical';
  icon: React.ElementType;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  lastActive: string;
  teams: number;
  projects: number;
  avatar: string;
}

interface Team {
  id: number;
  name: string;
  memberCount: number;
  projectCount: number;
  status: 'active' | 'inactive';
  createdDate: string;
  owner: string;
  performance: number;
}

interface SystemLog {
  id: number;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  user?: string;
  module: string;
}

interface AdminDashboardProps {
  className?: string;
}

// Mock data
const systemMetrics: SystemMetric[] = [
  {
    name: 'Total Users',
    value: '1,247',
    change: 12.5,
    trend: 'up',
    status: 'healthy',
    icon: Users
  },
  {
    name: 'Active Teams',
    value: '84',
    change: 8.2,
    trend: 'up',
    status: 'healthy',
    icon: Building
  },
  {
    name: 'System Uptime',
    value: '99.98%',
    change: 0.02,
    trend: 'up',
    status: 'healthy',
    icon: Server
  },
  {
    name: 'Storage Used',
    value: '67%',
    change: 4.1,
    trend: 'up',
    status: 'warning',
    icon: Database
  },
  {
    name: 'Daily Active Users',
    value: '892',
    change: -2.3,
    trend: 'down',
    status: 'warning',
    icon: Activity
  },
  {
    name: 'Response Time',
    value: '145ms',
    change: -8.7,
    trend: 'down',
    status: 'healthy',
    icon: Clock
  }
];

const usageData = [
  { name: 'Jan', users: 400, teams: 45, projects: 120 },
  { name: 'Feb', users: 450, teams: 52, projects: 135 },
  { name: 'Mar', users: 520, teams: 48, projects: 142 },
  { name: 'Apr', users: 580, teams: 61, projects: 158 },
  { name: 'May', users: 630, teams: 68, projects: 167 },
  { name: 'Jun', users: 720, teams: 74, projects: 185 },
  { name: 'Jul', users: 780, teams: 79, projects: 198 },
  { name: 'Aug', users: 850, teams: 84, projects: 215 },
  { name: 'Sep', users: 892, teams: 88, projects: 228 }
];

const roleDistribution = [
  { name: 'Team Members', value: 65, color: '#3b82f6' },
  { name: 'Team Leads', value: 20, color: '#8b5cf6' },
  { name: 'Project Managers', value: 10, color: '#10b981' },
  { name: 'Admins', value: 5, color: '#f59e0b' }
];

const mockUsers: User[] = [
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

const mockTeams: Team[] = [
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

const systemLogs: SystemLog[] = [
  {
    id: 1,
    timestamp: '2025-09-06T14:30:00Z',
    level: 'info',
    message: 'User login successful',
    user: 'alice.johnson@company.com',
    module: 'auth'
  },
  {
    id: 2,
    timestamp: '2025-09-06T14:25:00Z',
    level: 'warning',
    message: 'High memory usage detected',
    module: 'system'
  },
  {
    id: 3,
    timestamp: '2025-09-06T14:20:00Z',
    level: 'error',
    message: 'Failed to send notification email',
    user: 'bob.smith@company.com',
    module: 'notification'
  },
  {
    id: 4,
    timestamp: '2025-09-06T14:15:00Z',
    level: 'info',
    message: 'New team created: Engineering',
    user: 'david.wilson@company.com',
    module: 'teams'
  },
  {
    id: 5,
    timestamp: '2025-09-06T14:10:00Z',
    level: 'warning',
    message: 'Database connection timeout',
    module: 'database'
  }
];

export function AdminDashboard({ className }: AdminDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    uptime: '99.98%',
    cpu: 23,
    memory: 67,
    disk: 45,
    network: 'stable'
  });

  // Filter users based on search term
  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUserAction = (action: string, user: User) => {
    switch (action) {
      case 'view':
        setSelectedUser(user);
        setIsUserDialogOpen(true);
        break;
      case 'edit':
        // Handle edit user
        console.log('Edit user:', user.name);
        break;
      case 'suspend':
        // Handle suspend user
        console.log('Suspend user:', user.name);
        break;
      case 'delete':
        // Handle delete user
        console.log('Delete user:', user.name);
        break;
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
              <Badge className="bg-blue-100 text-blue-800">System Administrator</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* System Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {systemMetrics.map((metric, index) => (
                <motion.div
                  key={metric.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                          <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                          <div className="flex items-center mt-1">
                            {metric.trend === 'up' ? (
                              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                            ) : metric.trend === 'down' ? (
                              <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                            ) : (
                              <Activity className="h-3 w-3 text-gray-600 mr-1" />
                            )}
                            <span 
                              className={`text-xs font-medium ${
                                metric.trend === 'up' ? 'text-green-600' : 
                                metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                              }`}
                            >
                              {Math.abs(metric.change)}%
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <metric.icon className="h-6 w-6 text-gray-600" />
                          <Badge className={`text-xs mt-1 ${getStatusColor(metric.status)}`}>
                            {metric.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Usage Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Platform Usage Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={usageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="users" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Users"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="teams" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        name="Teams"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="projects" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="Projects"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Role Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>User Role Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={roleDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {roleDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent System Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {systemLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-start space-x-3">
                        <Badge className={`text-xs ${getLogLevelColor(log.level)}`}>
                          {log.level}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{log.message}</p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                            {log.user && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{log.user}</span>
                              </>
                            )}
                            <span className="mx-2">•</span>
                            <span>{log.module}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-sm text-gray-600">{systemStatus.cpu}%</span>
                  </div>
                  <Progress value={systemStatus.cpu} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className="text-sm text-gray-600">{systemStatus.memory}%</span>
                  </div>
                  <Progress value={systemStatus.memory} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Disk Usage</span>
                    <span className="text-sm text-gray-600">{systemStatus.disk}%</span>
                  </div>
                  <Progress value={systemStatus.disk} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Uptime</span>
                    <Badge className="bg-green-100 text-green-800">{systemStatus.uptime}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Network Status</span>
                    <Badge className="bg-green-100 text-green-800">{systemStatus.network}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Teams</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.teams}</TableCell>
                      <TableCell>{user.projects}</TableCell>
                      <TableCell className="text-sm text-gray-600">{user.lastActive}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUserAction('view', user)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUserAction('edit', user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUserAction('suspend', user)}
                          >
                            {user.status === 'suspended' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUserAction('delete', user)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Team Management</h2>
              <Button>
                <Building className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTeams.map((team) => (
                <Card key={team.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <Badge className={getStatusColor(team.status)}>
                        {team.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Members:</span>
                        <span className="font-medium ml-2">{team.memberCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Projects:</span>
                        <span className="font-medium ml-2">{team.projectCount}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Performance:</span>
                        <span className="font-medium">{team.performance}%</span>
                      </div>
                      <Progress value={team.performance} className="h-2" />
                    </div>

                    <div className="text-sm">
                      <span className="text-gray-600">Owner:</span>
                      <span className="font-medium ml-2">{team.owner}</span>
                    </div>

                    <div className="text-sm">
                      <span className="text-gray-600">Created:</span>
                      <span className="ml-2">{new Date(team.createdDate).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Logs */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>System Logs</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Select defaultValue="all">
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Filter by level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {systemLogs.map((log) => (
                      <div key={log.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Badge className={`text-xs ${getLogLevelColor(log.level)}`}>
                          {log.level.toUpperCase()}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{log.message}</p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                            {log.user && (
                              <>
                                <span className="mx-2">•</span>
                                <Users className="w-3 h-3 mr-1" />
                                <span>{log.user}</span>
                              </>
                            )}
                            <span className="mx-2">•</span>
                            <span className="font-medium">{log.module}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={usageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="users" 
                        stackId="1"
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.8}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resource Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { name: 'CPU', value: systemStatus.cpu },
                      { name: 'Memory', value: systemStatus.memory },
                      { name: 'Disk', value: systemStatus.disk },
                      { name: 'Network', value: 85 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Enable user registration</Label>
                      <p className="text-xs text-gray-500">Allow new users to register</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Email notifications</Label>
                      <p className="text-xs text-gray-500">Send system notifications via email</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Maintenance mode</Label>
                      <p className="text-xs text-gray-500">Temporarily disable user access</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Two-factor authentication</Label>
                      <p className="text-xs text-gray-500">Require 2FA for all users</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Session timeout</Label>
                      <p className="text-xs text-gray-500">Auto logout after inactivity</p>
                    </div>
                    <Select defaultValue="30">
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Password requirements</Label>
                      <p className="text-xs text-gray-500">Enforce strong passwords</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Details Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View and manage user information
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar} />
                  <AvatarFallback className="text-lg">
                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <Badge className={getStatusColor(selectedUser.status)}>
                    {selectedUser.status}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Role</Label>
                  <p className="font-medium">{selectedUser.role}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Join Date</Label>
                  <p className="font-medium">{new Date(selectedUser.joinDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Teams</Label>
                  <p className="font-medium">{selectedUser.teams}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Projects</Label>
                  <p className="font-medium">{selectedUser.projects}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Last Active</Label>
                  <p className="font-medium">{selectedUser.lastActive}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
              Close
            </Button>
            <Button>Edit User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
