import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  MessageSquare, 
  Video,
  Bell,
  Search,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MobileNavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  action: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'message' | 'meeting' | 'task' | 'system';
  read: boolean;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings }
];

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Message',
    message: 'Alice sent you a message in Team Chat',
    time: '2 min ago',
    type: 'message',
    read: false
  },
  {
    id: '2',
    title: 'Meeting Reminder',
    message: 'Sprint Review meeting starts in 15 minutes',
    time: '10 min ago',
    type: 'meeting',
    read: false
  },
  {
    id: '3',
    title: 'Task Completed',
    message: 'Bob completed "API Documentation" task',
    time: '1 hour ago',
    type: 'task',
    read: true
  }
];

function MobileNavigation({ currentPage, onNavigate }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(true)}
              className="p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">PulseCollab</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="relative p-2">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500">
                2
              </Badge>
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Mobile Side Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              className="lg:hidden fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="p-2"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <nav className="p-4 space-y-2">
                {navigationItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? 'default' : 'ghost'}
                    className="w-full justify-start gap-3"
                    onClick={() => {
                      onNavigate(item.id);
                      setIsOpen(false);
                    }}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex items-center justify-around py-2">
          {navigationItems.slice(0, 4).map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 p-2 h-auto ${
                currentPage === item.id ? 'text-blue-600' : 'text-gray-600'
              }`}
              onClick={() => onNavigate(item.id)}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1 p-2 h-auto text-gray-600"
            onClick={() => setIsOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="text-xs">More</span>
          </Button>
        </div>
      </nav>
    </>
  );
}

interface MobileDashboardProps {
  onNavigate: (page: string) => void;
}

export function MobileDashboard({ onNavigate }: MobileDashboardProps) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const quickActions: QuickAction[] = [
    {
      id: 'new-task',
      label: 'New Task',
      icon: Plus,
      color: '#3A86FF',
      action: () => console.log('Create new task')
    },
    {
      id: 'start-meeting',
      label: 'Start Meeting',
      icon: Video,
      color: '#06D6A0',
      action: () => console.log('Start meeting')
    },
    {
      id: 'send-message',
      label: 'Send Message',
      icon: MessageSquare,
      color: '#8338EC',
      action: () => console.log('Send message')
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: Calendar,
      color: '#FFD166',
      action: () => onNavigate('calendar')
    }
  ];

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    onNavigate(page);
  };

  return (
    <div className="lg:hidden min-h-screen bg-gray-50">
      <MobileNavigation currentPage={currentPage} onNavigate={handleNavigation} />
      
      {/* Main Content */}
      <main className="pt-16 pb-20 px-4">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search projects, tasks, people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <motion.div
                key={action.id}
                whileTap={{ scale: 0.95 }}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                onClick={action.action}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: action.color + '20' }}
                  >
                    <action.icon 
                      className="h-5 w-5" 
                      style={{ color: action.color }}
                    />
                  </div>
                  <span className="font-medium text-gray-900">{action.label}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Activity</h2>
          <Card>
            <CardContent className="p-4 space-y-4">
              {mockNotifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    notification.type === 'message' ? 'bg-blue-100' :
                    notification.type === 'meeting' ? 'bg-green-100' :
                    notification.type === 'task' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    {notification.type === 'message' && <MessageSquare className="h-4 w-4 text-blue-600" />}
                    {notification.type === 'meeting' && <Video className="h-4 w-4 text-green-600" />}
                    {notification.type === 'task' && <Plus className="h-4 w-4 text-purple-600" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">{notification.title}</h3>
                    <p className="text-gray-600 text-sm">{notification.message}</p>
                    <p className="text-gray-400 text-xs mt-1">{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Today's Schedule</h2>
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-3 h-3 bg-blue-600 rounded-full" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">Sprint Review</p>
                  <p className="text-gray-600 text-xs">10:00 AM - 11:00 AM</p>
                </div>
                <Button size="sm" variant="outline" className="text-xs">
                  Join
                </Button>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-3 h-3 bg-green-600 rounded-full" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">Team Standup</p>
                  <p className="text-gray-600 text-xs">2:00 PM - 2:30 PM</p>
                </div>
                <Button size="sm" variant="outline" className="text-xs">
                  Join
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Progress */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Project Progress</h2>
          <div className="space-y-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 text-sm">PulseCollab Platform</h3>
                  <Badge className="bg-green-100 text-green-800 text-xs">On Track</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }} />
                </div>
                <p className="text-gray-600 text-xs">85% Complete • Due Jan 30</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 text-sm">Mobile App Redesign</h3>
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">At Risk</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '45%' }} />
                </div>
                <p className="text-gray-600 text-xs">45% Complete • Due Feb 15</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
