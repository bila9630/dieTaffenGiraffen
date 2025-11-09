import { Mic, Volume2, Loader2, Check, Phone, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking';

interface VoiceModeProps {
  connectionStatus: ConnectionStatus;
  voiceStatus: VoiceStatus;
  isRecording: boolean;
  audioLevel: number;
  loadingStep: number;
  loadingFunction: string;
  transcript: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

const getLoadingSteps = (functionName: string): string[] => {
  switch (functionName) {
    case 'hiking_route_linz':
      return ['search hiking trip', 'check weather', 'display result'];
    case 'top_5_linz_attractions':
    case 'hidden_gem_linz':
      return ['search attractions', 'check rating', 'display result'];
    case 'therapy_linz':
      return ['search therapy centers', 'check availability', 'display result'];
    default:
      return [];
  }
};

const getLoadingTitle = (functionName: string): string => {
  switch (functionName) {
    case 'hiking_route_linz':
      return 'hiking linz';
    case 'top_5_linz_attractions':
      return 'top attractions';
    case 'hidden_gem_linz':
      return 'hidden gem';
    case 'therapy_linz':
      return 'couples therapy';
    default:
      return '';
  }
};

const VoiceMode = ({
  connectionStatus,
  voiceStatus,
  isRecording,
  audioLevel,
  loadingStep,
  loadingFunction,
  transcript,
  onConnect,
  onDisconnect,
}: VoiceModeProps) => {
  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Connected</Badge>;
      case 'connecting':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Connecting...</Badge>;
      case 'error':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Error</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground">Disconnected</Badge>;
    }
  };

  const getStatusIcon = () => {
    switch (voiceStatus) {
      case 'listening':
        return <Mic className="h-12 w-12 text-green-400" />;
      case 'processing':
        return <Loader2 className="h-12 w-12 text-yellow-400 animate-spin" />;
      case 'speaking':
        return <Volume2 className="h-12 w-12 text-blue-400" />;
      default:
        return <Mic className="h-12 w-12 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (voiceStatus) {
      case 'listening':
        return 'Listening...';
      case 'processing':
        return 'Thinking...';
      case 'speaking':
        return 'Speaking...';
      default:
        return 'Ready';
    }
  };

  const getStatusColor = () => {
    switch (voiceStatus) {
      case 'listening':
        return 'bg-green-500/10';
      case 'processing':
        return 'bg-yellow-500/10';
      case 'speaking':
        return 'bg-blue-500/10';
      default:
        return 'bg-muted/10';
    }
  };

  // Calculate audio level bars
  const barCount = 5;
  const activeBars = Math.ceil((audioLevel / 100) * barCount);

  return (
    <div className="p-4 space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-center">
        {getStatusBadge()}
      </div>

      {connectionStatus === 'connected' ? (
        <>
          {/* Voice Status Display */}
          <div className={`flex flex-col items-center justify-center p-8 rounded-lg ${getStatusColor()} transition-colors duration-300`}>
            {/* Status Icon */}
            <div className="relative mb-4">
              {getStatusIcon()}

              {/* Pulse animation for listening state */}
              {voiceStatus === 'listening' && (
                <div className="absolute inset-0 animate-ping">
                  <div className="h-12 w-12 rounded-full bg-green-400/30"></div>
                </div>
              )}
            </div>

            {/* Audio Level Bars */}
            {voiceStatus === 'listening' && (
              <div className="flex gap-1 mb-3 h-8 items-end">
                {Array.from({ length: barCount }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 rounded-full transition-all duration-100 ${
                      i < activeBars ? 'bg-green-400' : 'bg-muted'
                    }`}
                    style={{
                      height: `${16 + (i < activeBars ? Math.random() * 16 : 0)}px`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Status Text */}
            <p className="text-sm font-medium text-foreground">{getStatusText()}</p>
          </div>

          {/* Transcript Display */}
          {transcript && (
            <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">You said:</p>
              <p className="text-sm text-foreground">{transcript}</p>
            </div>
          )}

          {/* Loading Steps Display */}
          {loadingStep >= 0 && loadingFunction && (
            <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
              <div className="mb-2 text-sm font-semibold">{getLoadingTitle(loadingFunction)}</div>
              <div className="space-y-2">
                {getLoadingSteps(loadingFunction).map((step, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {index < loadingStep ? (
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : index === loadingStep ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted flex-shrink-0" />
                    )}
                    <span className={`text-xs ${index <= loadingStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {index === 1 && loadingStep > 1 && loadingFunction === 'hiking_route_linz' ? `${step} ✓ Perfect conditions!` : step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disconnect Button */}
          <Button
            onClick={onDisconnect}
            variant="destructive"
            className="w-full"
          >
            <PhoneOff className="h-4 w-4 mr-2" />
            Disconnect
          </Button>
        </>
      ) : (
        <>
          {/* Connect Instructions */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-10 w-10 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Voice Assistant</h3>
              <p className="text-sm text-muted-foreground">
                Connect to start a voice conversation with your travel assistant.
              </p>
            </div>
          </div>

          {/* Connect Button */}
          <Button
            onClick={onConnect}
            className="w-full"
            disabled={connectionStatus === 'connecting'}
          >
            {connectionStatus === 'connecting' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Phone className="h-4 w-4 mr-2" />
                Connect Voice
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
};

export default VoiceMode;
