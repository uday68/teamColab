import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  Share, 
  Users, 
  MessageSquare,
  Settings,
  Monitor,
  Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface ParticipantProps {
  name: string;
  isHost?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
  avatar: string;
}

function VideoGrid({ participants }: { participants: ParticipantProps[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 h-full">
      {participants.map((participant, index) => (
        <motion.div
          key={participant.name}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
          className="relative bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl overflow-hidden border border-border/50"
        >
          {participant.isVideoOff ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold text-lg mb-2 mx-auto">
                  {participant.name.split(' ').map(n => n[0]).join('')}
                </div>
                <p className="text-sm font-medium">{participant.name}</p>
              </div>
            </div>
          ) : (
            <div className="relative h-full bg-gradient-to-br from-muted/20 to-accent/20">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
                {participant.name}
              </div>
            </div>
          )}
          
          {/* Status indicators */}
          <div className="absolute top-3 right-3 flex gap-1">
            {participant.isHost && (
              <span className="bg-success text-success-foreground px-2 py-1 rounded text-xs font-medium">
                Host
              </span>
            )}
            {participant.isMuted && (
              <div className="bg-danger rounded-full p-1">
                <MicOff className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function MeetingControls({ 
  isMuted, 
  isVideoOff, 
  onToggleMute, 
  onToggleVideo, 
  onEndCall 
}: {
  isMuted: boolean;
  isVideoOff: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
}) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="flex items-center justify-center gap-3 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4"
    >
      <Button
        variant={isMuted ? "destructive" : "secondary"}
        size="lg"
        onClick={onToggleMute}
        className="rounded-full w-12 h-12 transition-smooth"
      >
        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </Button>
      
      <Button
        variant={isVideoOff ? "destructive" : "secondary"}
        size="lg"
        onClick={onToggleVideo}
        className="rounded-full w-12 h-12 transition-smooth"
      >
        {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
      </Button>
      
      <Button
        variant="secondary"
        size="lg"
        className="rounded-full w-12 h-12 transition-smooth"
      >
        <Share className="h-5 w-5" />
      </Button>
      
      <Button
        variant="secondary"
        size="lg"
        className="rounded-full w-12 h-12 transition-smooth"
      >
        <Users className="h-5 w-5" />
      </Button>
      
      <Button
        variant="secondary"
        size="lg"
        className="rounded-full w-12 h-12 transition-smooth"
      >
        <MessageSquare className="h-5 w-5" />
      </Button>
      
      <Button
        variant="destructive"
        size="lg"
        onClick={onEndCall}
        className="rounded-full w-12 h-12 ml-4 transition-smooth hover:scale-105"
      >
        <Phone className="h-5 w-5" />
      </Button>
    </motion.div>
  );
}

function Whiteboard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full bg-white rounded-xl border border-border/50 shadow-soft relative overflow-hidden"
    >
      <div className="absolute top-4 left-4 flex gap-2">
        <div className="w-4 h-4 bg-danger rounded-full" />
        <div className="w-4 h-4 bg-warning rounded-full" />
        <div className="w-4 h-4 bg-success rounded-full" />
      </div>
      
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <Edit3 className="h-12 w-12 mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Collaborative Whiteboard</p>
          <p className="text-sm">Start drawing and brainstorming together</p>
        </div>
      </div>
    </motion.div>
  );
}

function TextEditor() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full bg-card rounded-xl border border-border/50 shadow-soft p-6"
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50">
          <h3 className="font-semibold">Meeting Notes</h3>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Monitor className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 bg-background rounded-lg p-4 font-mono text-sm">
          <p className="text-muted-foreground mb-4"># Meeting: Q4 Planning Session</p>
          <p className="text-muted-foreground mb-2">**Date:** {new Date().toLocaleDateString()}</p>
          <p className="text-muted-foreground mb-4">**Attendees:** Alex Chen, Sarah Kim, Mike Johnson</p>
          <p className="text-foreground">## Agenda</p>
          <p className="text-foreground">- [ ] Review Q3 metrics</p>
          <p className="text-foreground">- [ ] Discuss Q4 roadmap</p>
          <p className="text-foreground">- [ ] Resource allocation</p>
          <p className="text-foreground mt-4">## Notes</p>
          <div className="w-2 h-4 bg-primary animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}

export function MeetingRoom() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const participants: ParticipantProps[] = [
    { name: 'Alex Chen', isHost: true, avatar: 'AC' },
    { name: 'Sarah Kim', isMuted: true, avatar: 'SK' },
    { name: 'Mike Johnson', avatar: 'MJ' },
    { name: 'Emma Davis', isVideoOff: true, avatar: 'ED' },
  ];

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col gap-6">
      {/* Main Meeting Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Area */}
        <div className="lg:col-span-2">
          <VideoGrid participants={participants} />
        </div>
        
        {/* Side Panel */}
        <div className="space-y-4">
          <Tabs defaultValue="whiteboard" className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="whiteboard" className="h-[400px] lg:h-[calc(100%-3rem)]">
              <Whiteboard />
            </TabsContent>
            
            <TabsContent value="notes" className="h-[400px] lg:h-[calc(100%-3rem)]">
              <TextEditor />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Controls */}
      <MeetingControls
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        onToggleMute={() => setIsMuted(!isMuted)}
        onToggleVideo={() => setIsVideoOff(!isVideoOff)}
        onEndCall={() => {}}
      />
    </div>
  );
}