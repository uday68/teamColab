import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  Users, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  MapPin,
  Link,
  Bell,
  Repeat,
  X,
  Edit,
  Trash2,
  Copy,
  Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  location?: string;
  videoUrl?: string;
  type: 'meeting' | 'call' | 'event';
  priority: 'low' | 'medium' | 'high';
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly';
  reminders: number[]; // minutes before
  projectId?: string;
}

interface CalendarEvent extends Meeting {
  color: string;
}

const mockMeetings: CalendarEvent[] = [
  {
    id: '1',
    title: 'Sprint Planning',
    description: 'Plan the upcoming sprint with the development team',
    startTime: new Date(2025, 0, 10, 9, 0),
    endTime: new Date(2025, 0, 10, 10, 30),
    attendees: ['john@example.com', 'jane@example.com', 'bob@example.com'],
    type: 'meeting',
    priority: 'high',
    recurring: 'weekly',
    reminders: [15, 5],
    color: '#3A86FF',
    projectId: '1'
  },
  {
    id: '2',
    title: 'Client Demo',
    description: 'Present the latest features to the client',
    startTime: new Date(2025, 0, 12, 14, 0),
    endTime: new Date(2025, 0, 12, 15, 0),
    attendees: ['john@example.com', 'client@company.com'],
    videoUrl: 'https://meet.google.com/abc-def-ghi',
    type: 'call',
    priority: 'high',
    recurring: 'none',
    reminders: [30, 10],
    color: '#EF476F'
  },
  {
    id: '3',
    title: 'Team Lunch',
    description: 'Monthly team building lunch',
    startTime: new Date(2025, 0, 15, 12, 0),
    endTime: new Date(2025, 0, 15, 13, 0),
    attendees: ['john@example.com', 'jane@example.com', 'bob@example.com', 'alice@example.com'],
    location: 'Downtown Cafe',
    type: 'event',
    priority: 'medium',
    recurring: 'monthly',
    reminders: [60],
    color: '#06D6A0'
  }
];

const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

const reminderOptions = [
  { value: 5, label: '5 minutes before' },
  { value: 10, label: '10 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' }
];

export function CalendarScheduler() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meetings, setMeetings] = useState<CalendarEvent[]>(mockMeetings);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<CalendarEvent | null>(null);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  const [newMeeting, setNewMeeting] = useState<Partial<Meeting>>({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(),
    attendees: [],
    type: 'meeting',
    priority: 'medium',
    recurring: 'none',
    reminders: [15]
  });

  useEffect(() => {
    // Initialize default end time (1 hour after start time)
    const startTime = newMeeting.startTime || new Date();
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
    setNewMeeting(prev => ({ ...prev, endTime }));
  }, [newMeeting.startTime]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getMeetingsForDate = (date: Date) => {
    if (!date) return [];
    return meetings.filter(meeting => 
      meeting.startTime.toDateString() === date.toDateString()
    );
  };

  const handleCreateMeeting = async () => {
    if (!newMeeting.title || !newMeeting.startTime || !newMeeting.endTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in the required fields.",
        variant: "destructive",
      });
      return;
    }

    const meeting: CalendarEvent = {
      id: Date.now().toString(),
      title: newMeeting.title,
      description: newMeeting.description,
      startTime: newMeeting.startTime,
      endTime: newMeeting.endTime,
      attendees: newMeeting.attendees || [],
      location: newMeeting.location,
      videoUrl: newMeeting.videoUrl,
      type: newMeeting.type || 'meeting',
      priority: newMeeting.priority || 'medium',
      recurring: newMeeting.recurring || 'none',
      reminders: newMeeting.reminders || [15],
      projectId: newMeeting.projectId,
      color: newMeeting.priority === 'high' ? '#EF476F' : 
             newMeeting.priority === 'medium' ? '#3A86FF' : '#06D6A0'
    };

    setMeetings(prev => [...prev, meeting]);
    setShowCreateDialog(false);
    setNewMeeting({
      title: '',
      description: '',
      startTime: new Date(),
      endTime: new Date(),
      attendees: [],
      type: 'meeting',
      priority: 'medium',
      recurring: 'none',
      reminders: [15]
    });

    toast({
      title: "Meeting Created",
      description: `"${meeting.title}" has been scheduled successfully.`,
    });
  };

  const handleDeleteMeeting = (meetingId: string) => {
    setMeetings(prev => prev.filter(m => m.id !== meetingId));
    setSelectedMeeting(null);
    toast({
      title: "Meeting Deleted",
      description: "The meeting has been removed from your calendar.",
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const days = getDaysInMonth(currentDate);
  const monthYear = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">Manage your meetings and schedule</p>
        </div>
        <div className="flex items-center gap-4">
          <Tabs value={view} onValueChange={(v) => setView(v as 'month' | 'week' | 'day')} className="w-auto">
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>
          </Tabs>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Schedule New Meeting</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Meeting Title *</Label>
                  <Input
                    id="title"
                    value={newMeeting.title}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Sprint Planning Meeting"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newMeeting.description}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Meeting agenda and notes..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={newMeeting.startTime?.toISOString().split('T')[0]}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        const currentStart = newMeeting.startTime || new Date();
                        date.setHours(currentStart.getHours(), currentStart.getMinutes());
                        setNewMeeting(prev => ({ ...prev, startTime: date }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Start Time</Label>
                    <Select
                      value={newMeeting.startTime?.toTimeString().slice(0, 5)}
                      onValueChange={(time) => {
                        const [hours, minutes] = time.split(':').map(Number);
                        const date = new Date(newMeeting.startTime || new Date());
                        date.setHours(hours, minutes);
                        setNewMeeting(prev => ({ ...prev, startTime: date }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={newMeeting.endTime?.toISOString().split('T')[0]}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        const currentEnd = newMeeting.endTime || new Date();
                        date.setHours(currentEnd.getHours(), currentEnd.getMinutes());
                        setNewMeeting(prev => ({ ...prev, endTime: date }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time">End Time</Label>
                    <Select
                      value={newMeeting.endTime?.toTimeString().slice(0, 5)}
                      onValueChange={(time) => {
                        const [hours, minutes] = time.split(':').map(Number);
                        const date = new Date(newMeeting.endTime || new Date());
                        date.setHours(hours, minutes);
                        setNewMeeting(prev => ({ ...prev, endTime: date }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={newMeeting.type}
                      onValueChange={(type) => setNewMeeting(prev => ({ ...prev, type: type as 'meeting' | 'call' | 'event' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="call">Video Call</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newMeeting.priority}
                      onValueChange={(priority) => setNewMeeting(prev => ({ ...prev, priority: priority as 'low' | 'medium' | 'high' }))}
                    >
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attendees">Attendees (comma separated emails)</Label>
                  <Input
                    id="attendees"
                    value={newMeeting.attendees?.join(', ')}
                    onChange={(e) => {
                      const emails = e.target.value.split(',').map(email => email.trim()).filter(Boolean);
                      setNewMeeting(prev => ({ ...prev, attendees: emails }));
                    }}
                    placeholder="john@example.com, jane@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location / Video URL</Label>
                  <Input
                    id="location"
                    value={newMeeting.location || newMeeting.videoUrl || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.startsWith('http')) {
                        setNewMeeting(prev => ({ ...prev, videoUrl: value, location: undefined }));
                      } else {
                        setNewMeeting(prev => ({ ...prev, location: value, videoUrl: undefined }));
                      }
                    }}
                    placeholder="Conference Room A or https://meet.google.com/..."
                  />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <Button onClick={handleCreateMeeting} className="flex-1">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Create Meeting
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{monthYear}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                    Today
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const dayMeetings = day ? getMeetingsForDate(day) : [];
                  const isToday = day && day.toDateString() === new Date().toDateString();
                  const isSelected = day && selectedDate && day.toDateString() === selectedDate.toDateString();
                  
                  return (
                    <motion.div
                      key={index}
                      whileHover={day ? { scale: 1.02 } : {}}
                      className={cn(
                        "min-h-[80px] p-2 border rounded-lg cursor-pointer transition-colors",
                        day ? "hover:bg-gray-50" : "bg-gray-50",
                        isToday && "bg-blue-50 border-blue-200",
                        isSelected && "bg-blue-100 border-blue-300"
                      )}
                      onClick={() => day && setSelectedDate(day)}
                    >
                      {day && (
                        <>
                          <div className={cn(
                            "text-sm font-medium mb-1",
                            isToday && "text-blue-600"
                          )}>
                            {day.getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayMeetings.slice(0, 2).map(meeting => (
                              <motion.div
                                key={meeting.id}
                                whileHover={{ scale: 1.05 }}
                                className="text-xs p-1 rounded truncate cursor-pointer"
                                style={{ backgroundColor: meeting.color + '20', color: meeting.color }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMeeting(meeting);
                                }}
                              >
                                {meeting.title}
                              </motion.div>
                            ))}
                            {dayMeetings.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{dayMeetings.length - 2} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {getMeetingsForDate(new Date()).length === 0 ? (
                <p className="text-gray-500 text-sm">No meetings scheduled for today</p>
              ) : (
                getMeetingsForDate(new Date()).map(meeting => (
                  <motion.div
                    key={meeting.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-3 border rounded-lg cursor-pointer hover:shadow-md transition-all"
                    onClick={() => setSelectedMeeting(meeting)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {meeting.type === 'call' && <Video className="h-4 w-4 text-blue-600" />}
                      {meeting.type === 'meeting' && <Users className="h-4 w-4 text-green-600" />}
                      {meeting.type === 'event' && <CalendarIcon className="h-4 w-4 text-purple-600" />}
                      <span className="font-medium text-sm">{meeting.title}</span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Upcoming Meetings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {meetings
                .filter(meeting => meeting.startTime > new Date())
                .slice(0, 3)
                .map(meeting => (
                  <motion.div
                    key={meeting.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-3 border rounded-lg cursor-pointer hover:shadow-md transition-all"
                    onClick={() => setSelectedMeeting(meeting)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant="secondary" 
                        className="text-xs"
                        style={{ backgroundColor: meeting.color + '20', color: meeting.color }}
                      >
                        {meeting.type}
                      </Badge>
                    </div>
                    <div className="font-medium text-sm mb-1">{meeting.title}</div>
                    <div className="text-xs text-gray-500">
                      {meeting.startTime.toLocaleDateString()} at {formatTime(meeting.startTime)}
                    </div>
                  </motion.div>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Meeting Details Modal */}
      <AnimatePresence>
        {selectedMeeting && (
          <Dialog open={!!selectedMeeting} onOpenChange={() => setSelectedMeeting(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="flex items-center gap-2">
                    {selectedMeeting.type === 'call' && <Video className="h-5 w-5 text-blue-600" />}
                    {selectedMeeting.type === 'meeting' && <Users className="h-5 w-5 text-green-600" />}
                    {selectedMeeting.type === 'event' && <CalendarIcon className="h-5 w-5 text-purple-600" />}
                    {selectedMeeting.title}
                  </DialogTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteMeeting(selectedMeeting.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4">
                {selectedMeeting.description && (
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedMeeting.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Start Time</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {selectedMeeting.startTime.toLocaleDateString()} at {formatTime(selectedMeeting.startTime)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">End Time</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {selectedMeeting.endTime.toLocaleDateString()} at {formatTime(selectedMeeting.endTime)}
                      </span>
                    </div>
                  </div>
                </div>

                {(selectedMeeting.location || selectedMeeting.videoUrl) && (
                  <div>
                    <Label className="text-sm font-medium">Location</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedMeeting.videoUrl ? (
                        <>
                          <Link className="h-4 w-4 text-gray-400" />
                          <a 
                            href={selectedMeeting.videoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Join Video Call
                          </a>
                        </>
                      ) : (
                        <>
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{selectedMeeting.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {selectedMeeting.attendees.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Attendees ({selectedMeeting.attendees.length})</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedMeeting.attendees.map(email => (
                        <div key={email} className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`} />
                            <AvatarFallback className="text-xs">
                              {email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{email}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Badge variant={selectedMeeting.priority === 'high' ? 'destructive' : 'secondary'}>
                    {selectedMeeting.priority} priority
                  </Badge>
                  {selectedMeeting.recurring !== 'none' && (
                    <Badge variant="outline">
                      <Repeat className="h-3 w-3 mr-1" />
                      {selectedMeeting.recurring}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  {selectedMeeting.videoUrl && (
                    <Button className="flex-1" asChild>
                      <a href={selectedMeeting.videoUrl} target="_blank" rel="noopener noreferrer">
                        <Video className="h-4 w-4 mr-2" />
                        Join Call
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button variant="outline" size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
