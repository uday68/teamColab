import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Users, 
  MoreHorizontal,
  Crown,
  Mail,
  Calendar,
  Settings,
  UserPlus,
  UserMinus,
  Shield,
  BarChart3,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/api';

function TeamCard({ team, onUpdate, onViewDetails }) {
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
              <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors flex items-center gap-2">
                <Users className="h-5 w-5" />
                {team.name}
                {team.is_admin && (
                  <Crown className="h-4 w-4 text-yellow-500" />
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {team.description || 'No description available'}
              </p>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {team.member_count || 0} members
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {team.project_count || 0} projects
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Joined {new Date(team.joined_at).toLocaleDateString()}
            </span>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onViewDetails(team)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MemberCard({ member, isAdmin, onUpdateRole, onRemove }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRoleToggle = async () => {
    setIsUpdating(true);
    try {
      await onUpdateRole(member.user_id, !member.is_admin);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await onRemove(member.user_id);
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
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={member.avatar_url} />
                <AvatarFallback>
                  {member.full_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{member.full_name}</h4>
                  {member.is_admin && (
                    <Badge variant="secondary" className="text-xs">
                      <Crown className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                  <Badge 
                    variant={member.status === 'online' ? 'default' : 'outline'}
                    className="text-xs"
                  >
                    {member.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{member.email}</p>
                <p className="text-xs text-muted-foreground">
                  Joined {new Date(member.joined_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {isAdmin && member.user_id !== member.id && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRoleToggle}
                  disabled={isUpdating}
                >
                  <Shield className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemove}
                  disabled={isUpdating}
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CreateTeamDialog({ onSuccess }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiService.createTeam(formData);
      
      toast({
        title: "Team created successfully",
        description: "Your new team has been created.",
      });
      
      setOpen(false);
      setFormData({
        name: '',
        description: ''
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Failed to create team",
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
          New Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Team Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter team name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Team description"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Team'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddMemberDialog({ teamId, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiService.addTeamMember(teamId, email);
      
      toast({
        title: "Member added successfully",
        description: "The user has been added to the team.",
      });
      
      setOpen(false);
      setEmail('');
      onSuccess();
    } catch (error) {
      toast({
        title: "Failed to add member",
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
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter user's email"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              The user must already have an account
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TeamAnalytics({ analytics }) {
  if (!analytics) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Members</p>
              <p className="text-2xl font-bold">{analytics.total_members || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Projects</p>
              <p className="text-2xl font-bold">{analytics.total_projects || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
              <p className="text-2xl font-bold">{analytics.total_tasks || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Progress</p>
              <p className="text-2xl font-bold">
                {Math.round(analytics.avg_project_progress || 0)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function TeamManagement() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamDetails, setTeamDetails] = useState(null);
  const [teamAnalytics, setTeamAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const response = await apiService.getTeams();
      setTeams(response.teams);
    } catch (error) {
      console.error('Failed to load teams:', error);
      toast({
        title: "Failed to load teams",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeamDetails = async (teamId) => {
    try {
      const [detailsResponse, analyticsResponse] = await Promise.all([
        apiService.getTeam(teamId),
        apiService.getTeamAnalytics(teamId)
      ]);
      
      setTeamDetails(detailsResponse.team);
      setTeamAnalytics(analyticsResponse.analytics);
    } catch (error) {
      console.error('Failed to load team details:', error);
      toast({
        title: "Failed to load team details",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (team) => {
    setSelectedTeam(team);
    loadTeamDetails(team.id);
  };

  const handleUpdateMemberRole = async (teamId, memberId, isAdmin) => {
    try {
      await apiService.updateMemberRole(teamId, memberId, isAdmin);
      toast({
        title: "Member role updated",
        description: `Member ${isAdmin ? 'promoted to admin' : 'removed from admin'}`,
      });
      loadTeamDetails(teamId);
    } catch (error) {
      toast({
        title: "Failed to update role",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (teamId, memberId) => {
    try {
      await apiService.removeTeamMember(teamId, memberId);
      toast({
        title: "Member removed",
        description: "The member has been removed from the team",
      });
      loadTeamDetails(teamId);
    } catch (error) {
      toast({
        title: "Failed to remove member",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (selectedTeam && teamDetails) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedTeam(null);
                setTeamDetails(null);
                setTeamAnalytics(null);
              }}
            >
              ← Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Users className="h-8 w-8" />
                {teamDetails.name}
                {teamDetails.is_admin && (
                  <Crown className="h-6 w-6 text-yellow-500" />
                )}
              </h1>
              <p className="text-muted-foreground">
                {teamDetails.description || 'No description available'}
              </p>
            </div>
          </div>
          {teamDetails.is_admin && (
            <AddMemberDialog 
              teamId={selectedTeam.id}
              onSuccess={() => loadTeamDetails(selectedTeam.id)}
            />
          )}
        </div>

        {teamAnalytics && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Team Analytics</h2>
            <TeamAnalytics analytics={teamAnalytics} />
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4">Team Members ({teamDetails.members?.length || 0})</h2>
          <div className="space-y-4">
            <AnimatePresence>
              {teamDetails.members?.map((member) => (
                <MemberCard
                  key={member.user_id}
                  member={member}
                  isAdmin={teamDetails.is_admin}
                  onUpdateRole={(memberId, isAdmin) => 
                    handleUpdateMemberRole(selectedTeam.id, memberId, isAdmin)
                  }
                  onRemove={(memberId) => 
                    handleRemoveMember(selectedTeam.id, memberId)
                  }
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">
            Manage your teams and collaborate with members
          </p>
        </div>
        <CreateTeamDialog onSuccess={loadTeams} />
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No teams found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first team to start collaborating
            </p>
            <CreateTeamDialog onSuccess={loadTeams} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onUpdate={loadTeams}
                onViewDetails={handleViewDetails}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
