import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Target, 
  CheckCircle,
  AlertTriangle,
  Calendar,
  MessageSquare,
  Video,
  FileText,
  Activity,
  Award,
  Zap,
  Heart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}

interface ChartData {
  name: string;
  value?: number;
  [key: string]: string | number | undefined;
}

const mockMetrics: MetricCard[] = [
  {
    title: 'Active Projects',
    value: 12,
    change: 8.2,
    trend: 'up',
    icon: Target,
    color: '#3A86FF'
  },
  {
    title: 'Tasks Completed',
    value: 247,
    change: 12.5,
    trend: 'up',
    icon: CheckCircle,
    color: '#06D6A0'
  },
  {
    title: 'Team Members',
    value: 28,
    change: 4.1,
    trend: 'up',
    icon: Users,
    color: '#8338EC'
  },
  {
    title: 'Avg. Completion Time',
    value: '3.2 days',
    change: -5.8,
    trend: 'down',
    icon: Clock,
    color: '#FFD166'
  },
  {
    title: 'Meeting Hours',
    value: '124h',
    change: -8.3,
    trend: 'down',
    icon: Video,
    color: '#EF476F'
  },
  {
    title: 'Messages Sent',
    value: '1.2k',
    change: 15.7,
    trend: 'up',
    icon: MessageSquare,
    color: '#06D6A0'
  }
];

const projectData: ChartData[] = [
  { name: 'Jan', completed: 45, inProgress: 23, planned: 12 },
  { name: 'Feb', completed: 52, inProgress: 28, planned: 15 },
  { name: 'Mar', completed: 48, inProgress: 32, planned: 18 },
  { name: 'Apr', completed: 61, inProgress: 25, planned: 14 },
  { name: 'May', completed: 55, inProgress: 35, planned: 20 },
  { name: 'Jun', completed: 67, inProgress: 30, planned: 16 }
];

const teamVelocityData: ChartData[] = [
  { name: 'Week 1', velocity: 32, capacity: 40 },
  { name: 'Week 2', velocity: 28, capacity: 40 },
  { name: 'Week 3', velocity: 35, capacity: 40 },
  { name: 'Week 4', velocity: 42, capacity: 40 },
  { name: 'Week 5', velocity: 38, capacity: 40 },
  { name: 'Week 6', velocity: 45, capacity: 40 }
];

const riskData: Array<{ name: string; value: number; color: string }> = [
  { name: 'Low Risk', value: 65, color: '#06D6A0' },
  { name: 'Medium Risk', value: 25, color: '#FFD166' },
  { name: 'High Risk', value: 10, color: '#EF476F' }
];

const healthData: ChartData[] = [
  { name: 'Mon', workHours: 8.2, wellnessScore: 85 },
  { name: 'Tue', workHours: 9.1, wellnessScore: 78 },
  { name: 'Wed', workHours: 7.8, wellnessScore: 88 },
  { name: 'Thu', workHours: 8.5, wellnessScore: 82 },
  { name: 'Fri', workHours: 6.9, wellnessScore: 92 },
  { name: 'Sat', workHours: 2.1, wellnessScore: 95 },
  { name: 'Sun', workHours: 0.5, wellnessScore: 98 }
];

const topPerformers = [
  { name: 'Alice Johnson', tasksCompleted: 23, efficiency: 94 },
  { name: 'Bob Smith', tasksCompleted: 21, efficiency: 91 },
  { name: 'Charlie Brown', tasksCompleted: 19, efficiency: 89 },
  { name: 'Diana Prince', tasksCompleted: 18, efficiency: 87 },
  { name: 'Ethan Hunt', tasksCompleted: 17, efficiency: 85 }
];

const recentActivities = [
  {
    id: 1,
    type: 'task_completed',
    user: 'Alice Johnson',
    description: 'completed "API Documentation"',
    time: '2 hours ago',
    icon: CheckCircle,
    color: '#06D6A0'
  },
  {
    id: 2,
    type: 'meeting_scheduled',
    user: 'Bob Smith',
    description: 'scheduled "Sprint Review" meeting',
    time: '4 hours ago',
    icon: Calendar,
    color: '#3A86FF'
  },
  {
    id: 3,
    type: 'project_created',
    user: 'Charlie Brown',
    description: 'created project "Mobile App Redesign"',
    time: '6 hours ago',
    icon: Target,
    color: '#8338EC'
  },
  {
    id: 4,
    type: 'document_shared',
    user: 'Diana Prince',
    description: 'shared "Design Guidelines" document',
    time: '1 day ago',
    icon: FileText,
    color: '#FFD166'
  }
];

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedProject, setSelectedProject] = useState('all');

  const handleExportData = () => {
    // Simulate data export
    const data = {
      metrics: mockMetrics,
      projectData,
      teamVelocityData,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulsecollab-analytics-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track team performance and project insights</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="pulsecollab">PulseCollab Platform</SelectItem>
              <SelectItem value="mobile">Mobile App</SelectItem>
              <SelectItem value="web">Web Dashboard</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportData} variant="outline">
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {mockMetrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    <div className="flex items-center mt-2">
                      {metric.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      ) : metric.trend === 'down' ? (
                        <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                      ) : (
                        <Activity className="h-4 w-4 text-gray-600 mr-1" />
                      )}
                      <span 
                        className={`text-sm font-medium ${
                          metric.trend === 'up' ? 'text-green-600' : 
                          metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}
                      >
                        {Math.abs(metric.change)}%
                      </span>
                    </div>
                  </div>
                  <div 
                    className="p-3 rounded-full"
                    style={{ backgroundColor: metric.color + '20' }}
                  >
                    <metric.icon 
                      className="h-6 w-6" 
                      style={{ color: metric.color }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
          <TabsTrigger value="health">Team Health</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Project Progress Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={projectData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="completed" 
                      stackId="1"
                      stroke="#06D6A0" 
                      fill="#06D6A0" 
                      fillOpacity={0.8}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="inProgress" 
                      stackId="1"
                      stroke="#3A86FF" 
                      fill="#3A86FF" 
                      fillOpacity={0.8}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="planned" 
                      stackId="1"
                      stroke="#FFD166" 
                      fill="#FFD166" 
                      fillOpacity={0.8}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Risk Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Project Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div 
                      className="p-2 rounded-full"
                      style={{ backgroundColor: activity.color + '20' }}
                    >
                      <activity.icon 
                        className="h-4 w-4" 
                        style={{ color: activity.color }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span> {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Velocity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={teamVelocityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="velocity" fill="#3A86FF" />
                    <Bar dataKey="capacity" fill="#E5E5E5" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Status Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">PulseCollab Platform</span>
                    <Badge className="bg-green-100 text-green-800">On Track</Badge>
                  </div>
                  <Progress value={85} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>85% Complete</span>
                    <span>Due: Jan 30, 2025</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Mobile App Redesign</span>
                    <Badge className="bg-yellow-100 text-yellow-800">At Risk</Badge>
                  </div>
                  <Progress value={45} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>45% Complete</span>
                    <span>Due: Feb 15, 2025</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Team Dashboard</span>
                    <Badge className="bg-green-100 text-green-800">Ahead</Badge>
                  </div>
                  <Progress value={92} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>92% Complete</span>
                    <span>Due: Feb 28, 2025</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Team Performance Tab */}
        <TabsContent value="team" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((performer, index) => (
                    <motion.div
                      key={performer.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{performer.name}</p>
                          <p className="text-xs text-gray-500">{performer.tasksCompleted} tasks completed</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{performer.efficiency}%</p>
                        <p className="text-xs text-gray-500">efficiency</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Collaboration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Messages Sent</span>
                  </div>
                  <span className="text-2xl font-bold">1,247</span>
                </div>
                <Progress value={78} className="h-2" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Video Calls</span>
                  </div>
                  <span className="text-2xl font-bold">89</span>
                </div>
                <Progress value={65} className="h-2" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Documents Shared</span>
                  </div>
                  <span className="text-2xl font-bold">156</span>
                </div>
                <Progress value={82} className="h-2" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Collaboration Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">8.4</span>
                    <span className="text-sm text-gray-500">/10</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Team Health Tab */}
        <TabsContent value="health" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Work-Life Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={healthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="workHours" fill="#3A86FF" />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="wellnessScore" 
                      stroke="#06D6A0" 
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Health Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">Good Work-Life Balance</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Team is maintaining healthy work hours with good wellness scores.
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Attention Needed</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Tuesday showed higher work hours. Consider scheduling breaks.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Daily Hours</span>
                    <span className="font-medium">7.2h</span>
                  </div>
                  <Progress value={72} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Wellness Score</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <Progress value={87} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Break Compliance</span>
                    <span className="font-medium">94%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
