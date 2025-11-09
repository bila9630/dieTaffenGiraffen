import { useState, useEffect } from 'react';
import { Mic, Loader2, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type PresentationStatus = 'idle' | 'processing';

interface PresentationModeProps {
  status: PresentationStatus;
  loadingStep: number;
  loadingFunction: string;
  currentSequence: number;
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

const PresentationMode = ({
  status,
  loadingStep,
  loadingFunction,
  currentSequence,
}: PresentationModeProps) => {
  const [audioLevelTick, setAudioLevelTick] = useState(0);

  // Animate audio level bars
  useEffect(() => {
    if (status !== 'idle') return;

    const interval = setInterval(() => {
      setAudioLevelTick(prev => prev + 1);
    }, 150);

    return () => clearInterval(interval);
  }, [status]);

  const getStatusBadge = () => {
    if (status === 'processing') {
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Processing</Badge>;
    }
    return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Connected</Badge>;
  };

  const getStatusIcon = () => {
    if (status === 'processing') {
      return <Loader2 className="h-12 w-12 text-blue-400 animate-spin" />;
    }
    return <Mic className="h-12 w-12 text-green-400" />;
  };

  const getStatusText = () => {
    if (status === 'processing') {
      return 'Processing...';
    }
    if (currentSequence >= 4) {
      return 'Listening...';
    }
    return 'Listening...';
  };

  const getStatusColor = () => {
    if (status === 'processing') {
      return 'bg-blue-500/10';
    }
    return 'bg-green-500/10';
  };

  // Simulate audio level bars with animated heights
  const barCount = 5;
  const getRandomBarHeight = (index: number) => {
    // Create a pseudo-random but smooth animation using tick
    return 16 + Math.sin(audioLevelTick / 3 + index) * 10 + Math.random() * 6;
  };

  return (
    <div className="p-4 space-y-4">
      {/* Status Badge */}
      <div className="flex items-center justify-center">
        {getStatusBadge()}
      </div>

      {/* Status Display */}
      <div className={`flex flex-col items-center justify-center p-8 rounded-lg ${getStatusColor()} transition-colors duration-300`}>
        {/* Status Icon */}
        <div className="relative mb-4">
          {getStatusIcon()}

          {/* Pulse animation for listening state */}
          {status === 'idle' && (
            <div className="absolute inset-0 animate-ping">
              <div className="h-12 w-12 rounded-full bg-green-400/30"></div>
            </div>
          )}
        </div>

        {/* Audio Level Bars - show when listening */}
        {status === 'idle' && (
          <div className="flex gap-1 mb-3 h-8 items-end">
            {Array.from({ length: barCount }).map((_, i) => (
              <div
                key={i}
                className="w-2 rounded-full bg-green-400 transition-all duration-100"
                style={{
                  height: `${getRandomBarHeight(i)}px`,
                }}
              />
            ))}
          </div>
        )}

        {/* Status Text */}
        <p className="text-sm font-medium text-foreground">{getStatusText()}</p>
      </div>

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

    </div>
  );
};

export default PresentationMode;
