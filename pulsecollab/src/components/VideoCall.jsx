import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Send, Users, ArrowLeft } from 'lucide-react';
import webrtcService from '@/services/webrtc';
import BackendStatus from './BackendStatus';

const VideoCall = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState(new Map());

  const localVideoRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize WebRTC service
    webrtcService.init();

    // Set up event callbacks
    webrtcService.on('onUserJoined', (participant) => {
      console.log('New participant joined:', participant);
    });

    webrtcService.on('onUserLeft', (data) => {
      setParticipants(prev => prev.filter(p => p.id !== data.userId));
    });

    webrtcService.on('onMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    webrtcService.on('onStreamAdded', (peerId, stream) => {
      setRemoteStreams(prev => new Map(prev.set(peerId, stream)));
    });

    webrtcService.on('onStreamRemoved', (peerId) => {
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(peerId);
        return newMap;
      });
    });

    webrtcService.on('onParticipantsUpdate', (participantList) => {
      setParticipants(participantList);
    });

    return () => {
      webrtcService.cleanup();
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom of messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const joinCall = async () => {
    if (!roomId || !username) return;

    try {
      const user = {
        name: username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
      };

      await webrtcService.joinRoom(roomId, user);

      // Set local video
      if (localVideoRef.current && webrtcService.localStream) {
        localVideoRef.current.srcObject = webrtcService.localStream;
      }

      setIsConnected(true);
    } catch (error) {
      console.error('Error joining call:', error);
      alert('Failed to join call. Please check your camera/microphone permissions.');
    }
  };

  const leaveCall = () => {
    webrtcService.leaveRoom();
    setIsConnected(false);
    setParticipants([]);
    setMessages([]);
    setRemoteStreams(new Map());
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  };

  const toggleMute = () => {
    const muted = webrtcService.toggleAudio();
    setIsMuted(muted);
  };

  const toggleVideo = () => {
    const videoOff = webrtcService.toggleVideo();
    setIsVideoOff(videoOff);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      webrtcService.sendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto mt-8">
          {/* Header with back button */}
          <div className="flex items-center mb-8">
            <a 
              href="/" 
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back to Home
            </a>
            <h1 className="text-2xl font-bold text-gray-800">PulseCollab Video Call Demo</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Login Form */}
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Join Video Call
                  </h2>
                  <p className="text-gray-600 mt-2">Start or join a video call room</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name
                    </label>
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room ID
                    </label>
                    <Input
                      type="text"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      placeholder="Enter room ID or create new"
                      className="w-full"
                    />
                  </div>

                  <Button
                    onClick={joinCall}
                    disabled={!roomId || !username}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Join Call
                  </Button>

                  <div className="text-center text-sm text-gray-500">
                    <p>💡 Try room ID: "demo" to test with others</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Backend Status */}
            <div className="space-y-6">
              <BackendStatus />
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">🚀 Features Demo</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Video className="w-4 h-4 text-blue-600" />
                      <span>Multi-participant video calls</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-green-600" />
                      <span>Real-time chat messaging</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mic className="w-4 h-4 text-purple-600" />
                      <span>Audio/video controls</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Send className="w-4 h-4 text-teal-600" />
                      <span>Screen sharing ready</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">Room: {roomId}</h1>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Users size={16} />
              <span>{participants.length}</span>
            </Badge>
          </div>
          
          <Button
            onClick={leaveCall}
            variant="destructive"
            className="flex items-center space-x-2"
          >
            <PhoneOff size={16} />
            <span>Leave</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Local Video */}
              <Card className="relative overflow-hidden bg-black">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  You {isMuted && '(muted)'} {isVideoOff && '(video off)'}
                </div>
              </Card>

              {/* Remote Videos */}
              {Array.from(remoteStreams.entries()).map(([peerId, stream]) => (
                <Card key={peerId} className="relative overflow-hidden bg-black">
                  <video
                    autoPlay
                    playsInline
                    className="w-full h-48 object-cover"
                    ref={(video) => {
                      if (video && stream) {
                        video.srcObject = stream;
                      }
                    }}
                  />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    Participant
                  </div>
                </Card>
              ))}

              {/* Placeholder for empty slots */}
              {Array.from({ length: Math.max(0, 6 - remoteStreams.size - 1) }).map((_, index) => (
                <Card key={`empty-${index}`} className="bg-gray-800 border-gray-700">
                  <div className="h-48 flex items-center justify-center text-gray-400">
                    <Users size={48} />
                  </div>
                </Card>
              ))}
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-4 mt-6">
              <Button
                onClick={toggleMute}
                variant={isMuted ? "destructive" : "secondary"}
                size="lg"
                className="rounded-full p-4"
              >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </Button>

              <Button
                onClick={toggleVideo}
                variant={isVideoOff ? "destructive" : "secondary"}
                size="lg"
                className="rounded-full p-4"
              >
                {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
              </Button>
            </div>
          </div>

          {/* Chat Panel */}
          <div className="lg:col-span-1">
            <Card className="h-96 flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Chat</h3>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <img
                        src={message.sender.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender.name}`}
                        alt={message.sender.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {message.sender.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 ml-8">{message.text}</p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} size="sm">
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
