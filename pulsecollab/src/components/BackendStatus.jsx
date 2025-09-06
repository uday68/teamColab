import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, Zap, Users, MessageSquare, FileText } from 'lucide-react';

const BackendStatus = () => {
  const [status, setStatus] = useState({
    isConnected: false,
    services: {},
    config: null,
    loading: true
  });

  const checkBackendStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true }));
      
      // Check health endpoint
      const healthResponse = await fetch('http://localhost:3002/health');
      const healthData = await healthResponse.json();
      
      // Check config endpoint
      const configResponse = await fetch('http://localhost:3002/api/config');
      const configData = await configResponse.json();
      
      setStatus({
        isConnected: true,
        services: healthData.services,
        config: configData,
        loading: false
      });
    } catch (error) {
      console.error('Backend connection failed:', error);
      setStatus({
        isConnected: false,
        services: {},
        config: null,
        loading: false
      });
    }
  };

  useEffect(() => {
    checkBackendStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    if (status === 'online') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'offline') return <XCircle className="w-4 h-4 text-red-500" />;
    return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  };

  const getServiceIcon = (service) => {
    switch (service) {
      case 'webrtc': return <Users className="w-5 h-5" />;
      case 'chat': return <MessageSquare className="w-5 h-5" />;
      case 'auth': return <CheckCircle className="w-5 h-5" />;
      case 'files': return <FileText className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Backend Status</h3>
          <Badge variant={status.isConnected ? "default" : "destructive"}>
            {status.isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>

        {status.loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Checking connection...</p>
          </div>
        ) : (
          <>
            {status.isConnected ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Services Status</h4>
                  <div className="space-y-2">
                    {Object.entries(status.services).map(([service, serviceStatus]) => (
                      <div key={service} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          {getServiceIcon(service)}
                          <span className="capitalize font-medium">{service}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(serviceStatus)}
                          <span className="text-sm capitalize">{serviceStatus}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {status.config && (
                  <div>
                    <h4 className="font-medium mb-2">Features Available</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(status.config.features)
                        .filter(([_, enabled]) => enabled)
                        .map(([feature, _]) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500">
                    Server: http://localhost:3002
                  </p>
                  <p className="text-xs text-gray-500">
                    Using PulseCollab color palette ✨
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-4">
                  Unable to connect to backend server
                </p>
                <Button onClick={checkBackendStatus} variant="outline" size="sm">
                  Retry Connection
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BackendStatus;
