import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { extractDestinationsFromText, type Destination } from '@/lib/austrianDestinations';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatBoxProps {
  onDestinationsFound?: (destinations: Destination[]) => void;
}

const ChatBox = ({ onDestinationsFound }: ChatBoxProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Grüß Gott! I\'m your Austrian travel assistant. I specialize in helping you discover the beautiful destinations across Austria - from the majestic Alps to charming villages and historic cities. What would you like to explore?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const envApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  const [apiKey, setApiKey] = useState<string>(() => {
    return envApiKey || localStorage.getItem('openai_api_key') || '';
  });
  const [tempApiKey, setTempApiKey] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key to continue",
        variant: "destructive",
      });
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an Austrian travel specialist. Keep responses SHORT and concise (2-3 sentences max). Focus on Austrian destinations: Vienna, Salzburg, Innsbruck, Graz, Hallstatt, Wachau Valley, Austrian Alps. Be brief but enthusiastic. List destinations clearly without long descriptions.',
            },
            ...messages.map((msg) => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.text,
            })),
            {
              role: 'user',
              content: newMessage.text,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from ChatGPT');
      }

      const data = await response.json();
      const completion = data.choices[0].message.content;
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: completion,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);

      // Extract destinations from AI response
      const foundDestinations = extractDestinationsFromText(completion);
      console.log('ChatBox - Found destinations:', foundDestinations);
      if (foundDestinations.length > 0 && onDestinationsFound) {
        console.log('ChatBox - Calling onDestinationsFound with:', foundDestinations);
        onDestinationsFound(foundDestinations);
      }
    } catch (error) {
      console.error('Error calling ChatGPT:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
      <div className="overflow-hidden rounded-xl border border-glass-border bg-[#d4c4b0]/80 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 bg-[#c9b89a]/60 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#a8927a]/30">
              <MessageCircle className="h-4 w-4 text-[#a8927a]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-black">Travel Assistant</h3>
              <p className="text-xs text-black/70">Powered by AI</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0 text-black/70 hover:text-black"
          >
            {isExpanded ? '−' : '+'}
          </Button>
        </div>

        {/* Messages */}
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
            ) : (
              <ScrollArea className="h-60 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${message.sender === 'user'
                            ? 'bg-[#a8927a] text-white'
                            : 'bg-[#c9b89a] text-black'
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
                </div>
              </ScrollArea>
            )}

            {/* Input */}
            {apiKey && (
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
