import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Bell, 
  Puzzle, 
  Heart, 
  Moon, 
  Sun, 
  Monitor,
  Volume2,
  Mail,
  Smartphone,
  Globe,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function AppearanceSettings() {
  const [theme, setTheme] = useState('light');
  const [density, setDensity] = useState([75]);
  
  const colorSchemes = [
    { name: 'Ocean Blue', primary: '#3A86FF', secondary: '#8338EC' },
    { name: 'Forest Green', primary: '#06D6A0', secondary: '#06A77D' },
    { name: 'Sunset Orange', primary: '#FFD166', secondary: '#EF476F' },
    { name: 'Cosmic Purple', primary: '#8338EC', secondary: '#6A28D9' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Preferences
          </CardTitle>
          <CardDescription>
            Customize the visual appearance of PulseCollab
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-3 block">Theme Mode</label>
            <div className="flex gap-2">
              {[
                { value: 'light', icon: Sun, label: 'Light' },
                { value: 'dark', icon: Moon, label: 'Dark' },
                { value: 'system', icon: Monitor, label: 'System' }
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={theme === option.value ? "default" : "outline"}
                  onClick={() => setTheme(option.value)}
                  className="flex items-center gap-2"
                >
                  <option.icon className="h-4 w-4" />
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Color Scheme</label>
            <div className="grid grid-cols-2 gap-3">
              {colorSchemes.map((scheme) => (
                <motion.div
                  key={scheme.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="border border-border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-smooth"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: scheme.primary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: scheme.secondary }}
                      />
                    </div>
                    <span className="text-sm font-medium">{scheme.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Interface Density</label>
            <div className="space-y-2">
              <Slider
                value={density}
                onValueChange={setDensity}
                max={100}
                step={25}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Compact</span>
                <span>Comfortable</span>
                <span>Spacious</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState([75]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Control how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
              </div>
              <Switch 
                checked={emailNotifications} 
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Get instant updates on your device</p>
                </div>
              </div>
              <Switch 
                checked={pushNotifications} 
                onCheckedChange={setPushNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Sound Notifications</p>
                  <p className="text-sm text-muted-foreground">Play sounds for new messages</p>
                </div>
              </div>
              <Switch 
                checked={soundEnabled} 
                onCheckedChange={setSoundEnabled}
              />
            </div>
          </div>

          {soundEnabled && (
            <div>
              <label className="text-sm font-medium mb-3 block">Notification Volume</label>
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={10}
                className="w-full"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function IntegrationsSettings() {
  const integrations = [
    { name: 'Slack', connected: true, icon: '💬' },
    { name: 'Google Calendar', connected: true, icon: '📅' },
    { name: 'Zoom', connected: false, icon: '📹' },
    { name: 'Trello', connected: true, icon: '📋' },
    { name: 'GitHub', connected: false, icon: '🐙' },
    { name: 'Figma', connected: true, icon: '🎨' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Puzzle className="h-5 w-5" />
            Connected Apps
          </CardTitle>
          <CardDescription>
            Manage your third-party integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-smooth"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <p className="font-medium">{integration.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {integration.connected ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                </div>
                <Button
                  variant={integration.connected ? "outline" : "default"}
                  size="sm"
                >
                  {integration.connected ? 'Disconnect' : 'Connect'}
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function HealthSettings() {
  const [breakReminders, setBreakReminders] = useState(true);
  const [focusTime, setFocusTime] = useState('25');
  const [workDays, setWorkDays] = useState(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Wellness & Productivity
          </CardTitle>
          <CardDescription>
            Take care of your wellbeing while staying productive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Break Reminders</p>
              <p className="text-sm text-muted-foreground">Get reminded to take regular breaks</p>
            </div>
            <Switch 
              checked={breakReminders} 
              onCheckedChange={setBreakReminders}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Focus Session Duration</label>
            <Select value={focusTime} onValueChange={setFocusTime}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="25">25 minutes (Pomodoro)</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">90 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Work Days</label>
            <div className="flex flex-wrap gap-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <Button
                  key={day}
                  variant={workDays.includes(day.toLowerCase()) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const dayLower = day.toLowerCase();
                    setWorkDays(prev => 
                      prev.includes(dayLower) 
                        ? prev.filter(d => d !== dayLower)
                        : [...prev, dayLower]
                    );
                  }}
                >
                  {day.slice(0, 3)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SettingsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Puzzle className="h-4 w-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Health</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance">
          <AppearanceSettings />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationsSettings />
        </TabsContent>

        <TabsContent value="health">
          <HealthSettings />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}