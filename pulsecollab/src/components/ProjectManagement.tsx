import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Filter, 
  Search, 
  MoreHorizontal,
  Calendar,
  User,
  Tag,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Users,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/api';

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

const statusColors = {
  todo: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  blocked: 'bg-red-100 text-red-800'
};

function ProjectCard({ project, onUpdate, onViewTasks }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleProgressUpdate = async (newProgress) => {
    setIsUpdating(true);
    try {
      await apiService.updateProject(project.id, { progress_percent: newProgress });
      onUpdate();
    } catch (error) {
      console.error('Failed to update progress:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                {project.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {project.description}
              </p>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={project.risk_level === 'high' ? 'destructive' : 'secondary'}>
              {project.risk_level} risk
            </Badge>
            <Badge variant="outline">
              {project.task_count || 0} tasks
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{project.progress_percent || 0}%</span>
            </div>
            <Progress 
              value={project.progress_percent || 0} 
              className="h-2"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Due: {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'No deadline'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{project.completed_tasks || 0}/{project.task_count || 0}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onViewTasks(project)}
            >
              <Target className="h-4 w-4 mr-2" />
              View Tasks
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleProgressUpdate((project.progress_percent || 0) + 10)}
              disabled={isUpdating || (project.progress_percent || 0) >= 100}
            >
              <TrendingUp className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TaskCard({ task, onUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      await apiService.updateTask(task.id, { status: newStatus });
      onUpdate();
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="group"
    >
      <Card className="hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                {task.title}
              </h4>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Badge 
              className={`text-xs ${priorityColors[task.priority] || priorityColors.medium}`}
            >
              {task.priority}
            </Badge>
            <Badge 
              variant="outline" 
              className={`text-xs ${statusColors[task.status] || statusColors.todo}`}
            >
              {task.status.replace('_', ' ')}
            </Badge>
          </div>

          {task.assignee_name && (
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="h-6 w-6">
                <AvatarImage src={task.assignee_avatar} />
                <AvatarFallback className="text-xs">
                  {task.assignee_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{task.assignee_name}</span>
            </div>
          )}

          {task.due_date && (
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            </div>
          )}

          <div className="flex gap-1">
            {task.status !== 'completed' && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs"
                onClick={() => handleStatusChange('completed')}
                disabled={isUpdating}
              >
                Complete
              </Button>
            )}
            {task.status === 'todo' && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs"
                onClick={() => handleStatusChange('in_progress')}
                disabled={isUpdating}
              >
                Start
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CreateProjectDialog({ teamId, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    due_date: '',
    priority: 'medium'
  });
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiService.createProject({
        ...formData,
        team_id: teamId
      });
      
      toast({
        title: "Project created successfully",
        description: "Your new project has been created and is ready for tasks.",
      });
      
      setOpen(false);
      setFormData({
        name: '',
        description: '',
        start_date: '',
        due_date: '',
        priority: 'medium'
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Failed to create project",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter project name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Project description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateTaskDialog({ projectId, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    estimate_hours: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiService.createTask({
        ...formData,
        project_id: projectId,
        estimate_hours: formData.estimate_hours ? parseInt(formData.estimate_hours) : null
      });
      
      toast({
        title: "Task created successfully",
        description: "Your new task has been added to the project.",
      });
      
      setOpen(false);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        estimate_hours: ''
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Failed to create task",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Task description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="estimate_hours">Estimate (hours)</Label>
              <Input
                id="estimate_hours"
                type="number"
                value={formData.estimate_hours}
                onChange={(e) => setFormData({ ...formData, estimate_hours: e.target.value })}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ProjectManagement() {
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentTeam, setCurrentTeam] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // For demo purposes, we'll use the first team
        const teamsResponse = await apiService.getTeams();
        if (teamsResponse.teams.length > 0) {
          const team = teamsResponse.teams[0];
          setCurrentTeam(team);
          await loadProjects(team.id);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);


  const loadProjects = async (teamId) => {
    try {
      const response = await apiService.getProjects(teamId);
      setProjects(response.projects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadTasks = async (projectId) => {
    try {
      const response = await apiService.getTasks(projectId);
      setTasks(response.tasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const handleProjectUpdate = () => {
    if (currentTeam) {
      loadProjects(currentTeam.id);
    }
  };

  const handleTaskUpdate = () => {
    if (selectedProject) {
      loadTasks(selectedProject.id);
    }
  };

  const handleViewTasks = (project) => {
    setSelectedProject(project);
    setActiveTab('tasks');
    loadTasks(project.id);
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Management</h1>
          <p className="text-muted-foreground">
            Manage your projects and tasks efficiently
          </p>
        </div>
        {currentTeam && (
          <CreateProjectDialog 
            teamId={currentTeam.id} 
            onSuccess={handleProjectUpdate} 
          />
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Tasks {selectedProject && `(${selectedProject.name})`}
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-4 mt-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {activeTab === 'tasks' && (
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <TabsContent value="projects" className="space-y-6">
          {filteredProjects.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first project to get started
                </p>
                {currentTeam && (
                  <CreateProjectDialog 
                    teamId={currentTeam.id} 
                    onSuccess={handleProjectUpdate} 
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onUpdate={handleProjectUpdate}
                    onViewTasks={handleViewTasks}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          {selectedProject && (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <h3 className="font-semibold">{selectedProject.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {filteredTasks.length} tasks
                </p>
              </div>
              <CreateTaskDialog 
                projectId={selectedProject.id}
                onSuccess={handleTaskUpdate}
              />
            </div>
          )}

          {!selectedProject ? (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No project selected</h3>
                <p className="text-muted-foreground">
                  Select a project to view and manage its tasks
                </p>
              </CardContent>
            </Card>
          ) : filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first task for this project
                </p>
                <CreateTaskDialog 
                  projectId={selectedProject.id}
                  onSuccess={handleTaskUpdate}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence>
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={handleTaskUpdate}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
