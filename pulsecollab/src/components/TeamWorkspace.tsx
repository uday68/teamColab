import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Settings, 
  MoreHorizontal, 
  Calendar,
  FileText,
  MessageSquare,
  Video,
  Target,
  TrendingUp,
  Clock,
  Star,
  Search,
  Filter,
  Grid,
  List,
  ChevronRight,
  Edit,
  Trash2,
  UserPlus,
  Bell,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { colorPalette as colors, componentColors } from '@/lib/colors';

// Dummy team data using centralized color palette
const teamsData = [
  {
    id: 1,
    name: 'Product Development',
    description: 'Building the next generation of products',
    memberCount: 12,
    projectCount: 8,
    color: colors.primary[500],
    bgColor: colors.primary[50],
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
    color: colors.success[500],
    bgColor: colors.success[50],
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
    color: colors.purple[500],
    bgColor: colors.purple[50],
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
    color: colors.warning[500],
    bgColor: colors.warning[50],
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
];

const workspaceProjects = [
  {
    id: 1,
    name: 'PulseCollab Mobile App',
    description: 'Native mobile application for iOS and Android',
    progress: 75,
    status: 'In Progress',
    priority: 'High',
    dueDate: '2025-02-15',
    teamId: 1,
    color: colors.primary[500],
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
    color: colors.success[500],
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
    color: colors.purple[500],
    members: 8,
    tasks: { total: 32, completed: 29 }
  }
];

interface TeamWorkspaceProps {
  onNavigate?: (page: string) => void;
}

export function TeamWorkspace({ onNavigate }: TeamWorkspaceProps) {
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<typeof teamsData[0] | null>(null);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    color: colors.primary[500]
  });

  const filteredTeams = teamsData.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTeam = () => {
    // Mock team creation
    console.log('Creating team:', newTeam);
    setIsCreateTeamOpen(false);
    setNewTeam({ name: '', description: '', color: colors.primary[500] });
  };

  const StatusIcon = ({ status }: { status: string }) => {
    const statusColors = {
      online: componentColors.status.online,
      offline: componentColors.status.offline,
      away: componentColors.status.away
    };
    
    return (
      <div 
        className="w-3 h-3 rounded-full border-2 border-white"
        style={{ backgroundColor: statusColors[status as keyof typeof statusColors] || statusColors.offline }}
      />
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Workspace</h1>
          <p className="text-gray-600">Manage teams, projects, and collaboration</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedView(selectedView === 'grid' ? 'list' : 'grid')}
          >
            {selectedView === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: colors.primary[500] }}>
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    placeholder="Enter team name"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="teamDescription">Description</Label>
                  <Textarea
                    id="teamDescription"
                    placeholder="Describe your team's purpose"
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Team Color</Label>
                  <div className="flex gap-2 mt-2">
                    {Object.entries(colors).map(([name, colorShades]) => (
                      <button
                        key={name}
                        className={`w-8 h-8 rounded-full border-2 ${
                          newTeam.color === colorShades[500] ? 'border-gray-400' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: colorShades[500] }}
                        onClick={() => setNewTeam({ ...newTeam, color: colorShades[500] })}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateTeamOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateTeam}
                    disabled={!newTeam.name.trim()}
                    style={{ backgroundColor: colors.primary[500] }}
                  >
                    Create Team
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Team Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Teams</p>
                <p className="text-2xl font-bold text-gray-900">{teamsData.length}</p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: colors.primary[50] }}>
                <Users className="h-6 w-6" style={{ color: colors.primary[500] }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teamsData.reduce((sum, team) => sum + team.memberCount, 0)}
                </p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: colors.success[50] }}>
                <UserPlus className="h-6 w-6" style={{ color: colors.success[500] }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teamsData.reduce((sum, team) => sum + team.projectCount, 0)}
                </p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: colors.purple[50] }}>
                <Target className="h-6 w-6" style={{ color: colors.purple[500] }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Velocity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(teamsData.reduce((sum, team) => sum + team.stats.teamVelocity, 0) / teamsData.length)}%
                </p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: colors.warning[50] }}>
                <TrendingUp className="h-6 w-6" style={{ color: colors.warning[500] }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="teams" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Teams Tab */}
        <TabsContent value="teams" className="space-y-6">
          <div className={selectedView === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredTeams.map((team) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-l-4" 
                      style={{ borderLeftColor: team.color }}
                      onClick={() => setSelectedTeam(team)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: team.bgColor }}
                        >
                          <Users className="h-6 w-6" style={{ color: team.color }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{team.name}</h3>
                          <p className="text-sm text-gray-600">{team.description}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Team
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Team
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Team Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-900">{team.memberCount}</p>
                          <p className="text-xs text-gray-600">Members</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-900">{team.projectCount}</p>
                          <p className="text-xs text-gray-600">Projects</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold" style={{ color: team.color }}>
                            {team.stats.teamVelocity}%
                          </p>
                          <p className="text-xs text-gray-600">Velocity</p>
                        </div>
                      </div>

                      {/* Team Members */}
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {team.members.slice(0, 4).map((member) => (
                            <div key={member.id} className="relative">
                              <Avatar className="h-8 w-8 border-2 border-white">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-1 -right-1">
                                <StatusIcon status={member.status} />
                              </div>
                            </div>
                          ))}
                          {team.memberCount > 4 && (
                            <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">+{team.memberCount - 4}</span>
                            </div>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {workspaceProjects.map((project) => (
              <Card key={project.id} className="border-l-4" style={{ borderLeftColor: project.color }}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-600">{project.description}</p>
                    </div>
                    <Badge 
                      variant={project.priority === 'High' ? 'destructive' : 'secondary'}
                      className="ml-2"
                    >
                      {project.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-gray-600">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Tasks</p>
                        <p className="font-medium">{project.tasks.completed}/{project.tasks.total}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Due Date</p>
                        <p className="font-medium">{new Date(project.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{project.members} members</span>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamsData.flatMap(team => 
                  team.recentActivity.map((activity, index) => (
                    <div key={`${team.id}-${index}`} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: team.bgColor }}
                      >
                        <Users className="h-5 w-5" style={{ color: team.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{team.name}</p>
                        <p className="text-sm text-gray-600">{activity.message}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Team Detail Modal */}
      <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
        <DialogContent className="max-w-4xl">
          {selectedTeam && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: selectedTeam.bgColor }}
                  >
                    <Users className="h-8 w-8" style={{ color: selectedTeam.color }} />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">{selectedTeam.name}</DialogTitle>
                    <p className="text-gray-600">{selectedTeam.description}</p>
                  </div>
                </div>
              </DialogHeader>
              
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="members">Members</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold" style={{ color: selectedTeam.color }}>
                          {selectedTeam.stats.tasksCompleted}
                        </p>
                        <p className="text-sm text-gray-600">Tasks Completed</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold" style={{ color: selectedTeam.color }}>
                          {selectedTeam.stats.ongoingProjects}
                        </p>
                        <p className="text-sm text-gray-600">Ongoing Projects</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold" style={{ color: selectedTeam.color }}>
                          {selectedTeam.stats.teamVelocity}%
                        </p>
                        <p className="text-sm text-gray-600">Team Velocity</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="members" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTeam.members.map((member) => (
                      <Card key={member.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar>
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-1 -right-1">
                                <StatusIcon status={member.status} />
                              </div>
                            </div>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-gray-600">{member.role}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
