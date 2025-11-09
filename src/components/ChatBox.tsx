import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Key, Loader2, Check, Mic, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useOpenAI, getOpenAIKey, POIMarker } from '@/hooks/useOpenAI';
import { useBoxVisibility } from '@/hooks/useBoxVisibility';
import { useOpenAIRealtime } from '@/hooks/useOpenAIRealtime';
import VoiceMode from './VoiceMode';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatBoxProps {
  onZoomToLocation?: (location: string) => Promise<void>;
  onDisplayMarkers?: (markers: POIMarker[]) => Promise<void>;
  onDisplayHiddenGem?: (marker: POIMarker) => Promise<void>;
  onDisplayHikingRoute?: () => Promise<void>;
  onCloseHiddenGem?: () => void;
  onDisplayTherapy?: (marker: POIMarker) => Promise<void>;
  onCloseTherapy?: () => void;
  onShowTherapyBanner?: () => void;
}

const ChatBox = ({ onZoomToLocation, onDisplayMarkers, onDisplayHiddenGem, onDisplayHikingRoute, onCloseHiddenGem, onDisplayTherapy, onCloseTherapy, onShowTherapyBanner }: ChatBoxProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your travel planning assistant. Tell me where you\'d like to go, and I\'ll help you plan the perfect trip!',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [apiKey, setApiKey] = useState<string>(() => getOpenAIKey());
  const [tempApiKey, setTempApiKey] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { check_visitor_capacity, hiking_route_linz, showIntents, addIntent, clearIntents } = useBoxVisibility();
  const { sendMessage, isLoading, loadingStep, loadingFunction } = useOpenAI({
    onZoomToLocation,
    onDisplayMarkers,
    onDisplayHiddenGem,
    onCheckVisitorCapacity: check_visitor_capacity,
    onDisplayHikingRoute,
    onHikingRouteLinz: hiking_route_linz,
    onCloseHiddenGem,
    onDisplayTherapy,
    onCloseTherapy,
    onShowIntents: showIntents,
    onAddIntent: addIntent,
    onClearIntents: clearIntents,
    onShowTherapyBanner
  });

  // Voice mode hook
  const {
    connect: connectVoice,
    disconnect: disconnectVoice,
    connectionStatus,
    voiceStatus,
    isRecording,
    audioLevel,
    loadingStep: voiceLoadingStep,
    loadingFunction: voiceLoadingFunction,
    transcript,
  } = useOpenAIRealtime({
    onZoomToLocation,
    onDisplayMarkers,
    onDisplayHiddenGem,
    onCheckVisitorCapacity: check_visitor_capacity,
    onDisplayHikingRoute,
    onHikingRouteLinz: hiking_route_linz,
    onCloseHiddenGem,
    onDisplayTherapy,
    onCloseTherapy,
    onShowIntents: showIntents,
    onAddIntent: addIntent,
    onClearIntents: clearIntents,
  });

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, loadingStep]);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedKey = tempApiKey.trim();

    if (!trimmedKey) {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid OpenAI API key",
        variant: "destructive",
      });
      return;
    }

    if (!trimmedKey.startsWith('sk-')) {
      toast({
        title: "Invalid API Key",
        description: "OpenAI API keys should start with 'sk-'",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('openai_api_key', trimmedKey);
    setApiKey(trimmedKey);
    setTempApiKey('');
    toast({
      title: "API Key Saved",
      description: "Your OpenAI API key has been saved securely in your browser",
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');

    const aiResponse = await sendMessage(newMessage, messages, apiKey);

    if (aiResponse) {
      setMessages((prev) => [...prev, aiResponse]);
    }
  };

  const handleModeChange = (newMode: 'text' | 'voice') => {
    if (newMode === 'voice' && mode === 'text') {
      // Disconnect voice when switching to text
      disconnectVoice();
    }
    setMode(newMode);
  };

  const handleConnectVoice = () => {
    connectVoice(apiKey);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
      <div className="overflow-hidden rounded-xl border border-glass-border bg-card/70 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 bg-card/50 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
              <MessageCircle className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Travel Assistant</h3>
              <p className="text-xs text-muted-foreground">Powered by AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Mode Toggle */}
            {apiKey && (
              <div className="flex gap-1 bg-muted/50 rounded-md p-1">
                <Button
                  variant={mode === 'text' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => handleModeChange('text')}
                  className="h-6 px-2"
                >
                  <MessageSquare className="h-3 w-3" />
                </Button>
                <Button
                  variant={mode === 'voice' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => handleModeChange('voice')}
                  className="h-6 px-2"
                >
                  <Mic className="h-3 w-3" />
                </Button>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? '−' : '+'}
            </Button>
          </div>
        </div>

        {/* Content */}
        {isExpanded && (
          <>
            {!apiKey ? (
              <div className="p-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Key className="h-5 w-5 text-primary" />
                      OpenAI API Key Required
                    </CardTitle>
                    <CardDescription>
                      Enter your OpenAI API key to start chatting. Your key is stored securely in your browser.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveApiKey} className="space-y-4">
                      <div className="space-y-2">
                        <Input
                          type="password"
                          placeholder="sk-..."
                          value={tempApiKey}
                          onChange={(e) => setTempApiKey(e.target.value)}
                          className="bg-input/50 backdrop-blur-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          Get your API key from{' '}
                          <a
                            href="https://platform.openai.com/api-keys"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            OpenAI Platform
                          </a>
                        </p>
                      </div>
                      <Button type="submit" className="w-full">
                        Save API Key
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            ) : mode === 'voice' ? (
              <VoiceMode
                connectionStatus={connectionStatus}
                voiceStatus={voiceStatus}
                isRecording={isRecording}
                audioLevel={audioLevel}
                loadingStep={voiceLoadingStep}
                loadingFunction={voiceLoadingFunction}
                transcript={transcript}
                onConnect={handleConnectVoice}
                onDisconnect={disconnectVoice}
              />
            ) : (
              <ScrollArea className="h-60 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground'
                          }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <span className="mt-1 block text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {loadingStep >= 0 && loadingFunction && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg bg-secondary px-4 py-3 text-secondary-foreground">
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
                    </div>
                  )}
                  {isLoading && loadingStep < 0 && !loadingFunction && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg bg-secondary px-4 py-2 text-secondary-foreground">
                        <div className="flex gap-1">
                          <span className="animate-bounce text-sm" style={{ animationDelay: '0ms' }}>
                            .
                          </span>
                          <span className="animate-bounce text-sm" style={{ animationDelay: '150ms' }}>
                            .
                          </span>
                          <span className="animate-bounce text-sm" style={{ animationDelay: '300ms' }}>
                            .
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            )}

            {/* Input - Only show in text mode */}
            {apiKey && mode === 'text' && (
              <form onSubmit={handleSendMessage} className="border-t border-border/50 bg-card/50 p-4">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Type your destination..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1 bg-input/50 backdrop-blur-sm"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatBox;
