import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Video, 
  Settings, 
  Bell, 
  User, 
  Menu, 
  X,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'meeting', label: 'Meeting Room', icon: Video },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AppLayout({ children, currentPage, onNavigate }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -250 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          "fixed left-0 top-0 z-40 h-full bg-card border-r border-border shadow-medium",
          sidebarOpen ? "w-64" : "w-14"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 gradient-primary rounded-lg shadow-glow" />
                  <h1 className="font-semibold text-lg">PulseCollab</h1>
                </motion.div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hover:bg-accent"
              >
                {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onNavigate(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-smooth text-left",
                      isActive 
                        ? "gradient-primary text-white shadow-medium" 
                        : "hover:bg-accent text-foreground"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", isActive && "text-white")} />
                    {sidebarOpen && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between">
              {sidebarOpen && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full" />
                  <div>
                    <p className="text-sm font-medium">Alex Chen</p>
                    <p className="text-xs text-muted-foreground">Product Manager</p>
                  </div>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="hover:bg-accent"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={cn("transition-all duration-300", sidebarOpen ? "ml-64" : "ml-14")}>
        {/* Top Bar */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur-sm border-b border-border px-6"
        >
          <div className="flex items-center justify-between h-full">
            <div>
              <h2 className="text-xl font-semibold capitalize">{currentPage}</h2>
              <p className="text-sm text-muted-foreground">
                {currentPage === 'dashboard' && 'Welcome to your collaboration hub'}
                {currentPage === 'meeting' && 'Connect and collaborate in real-time'}
                {currentPage === 'settings' && 'Customize your experience'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="relative hover:bg-accent">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-danger rounded-full text-xs" />
              </Button>
              <Button variant="ghost" size="sm" className="hover:bg-accent">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}