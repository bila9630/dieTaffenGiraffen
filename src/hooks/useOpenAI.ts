import { useState } from 'react';
import OpenAI from 'openai';
import { useToast } from '@/hooks/use-toast';
import { ChatCompletionMessageToolCall } from 'openai/resources/chat/completions';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface POIMarker {
  id: number;
  name: string;
  lat: number;
  lon: number;
  rating?: number;
  image_url?: string;
}

interface UseOpenAIOptions {
  onZoomToLocation?: (location: string) => Promise<void>;
  onDisplayMarkers?: (markers: POIMarker[]) => Promise<void>;
  onAddMarkers?: (markers: POIMarker[]) => Promise<void>;
}

/**
 * Gets the OpenAI API key from environment or localStorage
 */
export const getOpenAIKey = (): string => {
  const envApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  return envApiKey || localStorage.getItem('openai_api_key') || '';
};

/**
 * Creates and returns an OpenAI client instance
 */
const createOpenAIClient = (apiKey: string): OpenAI => {
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true, // Required for client-side usage
  });
};

/**
 * Custom hook for OpenAI chat functionality with function calling support
 */
export const useOpenAI = ({ onZoomToLocation, onDisplayMarkers, onAddMarkers }: UseOpenAIOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (
    newMessage: Message,
    messages: Message[],
    apiKey: string
  ): Promise<Message | null> => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key to continue",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);

    try {
      const openai = createOpenAIClient(apiKey);

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful travel planning assistant. Provide concise, friendly advice about destinations, itineraries, and travel tips. When users mention a specific destination or ask about a place, use the zoom_to_location function to show it on the map.',
          },
          ...messages.map((msg) => ({
            role: msg.sender === 'user' ? ('user' as const) : ('assistant' as const),
            content: msg.text,
          })),
          {
            role: 'user',
            content: newMessage.text,
          },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'zoom_to_location',
              description: 'Zoom the map to a specific location or destination. Use this when the user mentions a place they want to visit or learn about.',
              parameters: {
                type: 'object',
                properties: {
                  location: {
                    type: 'string',
                    description: 'The name of the location to zoom to (e.g., "Paris", "Tokyo", "Grand Canyon")',
                  },
                },
                required: ['location'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'top_5_linz_attractions',
              description: 'Fetch and display the top 5 attractions in Linz on the map as markers.',
              parameters: {
                type: 'object',
                properties: {},
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'hidden_gem_linz',
              description: 'Fetch and display a hidden gem spot in Linz on the map. This will replace any existing markers with the hidden gem marker.',
              parameters: {
                type: 'object',
                properties: {},
              },
            },
          },
        ],
        tool_choice: 'auto',
      });

      const responseMessage = completion.choices[0].message;

      // Handle function calls
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        for (const toolCall of responseMessage.tool_calls as ChatCompletionMessageToolCall[]) {
          if (toolCall.type === 'function' && toolCall.function?.name === 'zoom_to_location') {
            const args = JSON.parse(toolCall.function.arguments);
            await onZoomToLocation?.(args.location);
          } else if (toolCall.type === 'function' && toolCall.function?.name === 'top_5_linz_attractions') {
            // Fetch top 5 POIs from Supabase
            const { data, error } = await supabase
              .from('pois')
              .select('id, name, lat, lon, rating, image_url')
              .order('id', { ascending: true })
              .limit(5);

            if (error) {
              console.error('Error fetching POIs:', error);
              toast({
                title: "Error",
                description: "Failed to fetch attractions data.",
                variant: "destructive",
              });
            } else if (data && onDisplayMarkers) {
              await onDisplayMarkers(data);
            }
          } else if (toolCall.type === 'function' && toolCall.function?.name === 'hidden_gem_linz') {
            // Fetch hidden gem from Supabase
            const { data, error } = await supabase
              .from('hidden_gem')
              .select('id, name, lat, lon, rating, image_url');

            if (error) {
              console.error('Error fetching hidden gem:', error);
              toast({
                title: "Error",
                description: "Failed to fetch hidden gem data.",
                variant: "destructive",
              });
            } else if (data && onDisplayMarkers) {
              // Use displayMarkers to replace existing markers with the hidden gem
              await onDisplayMarkers(data);
            }
          }
        }
      }

      // Create AI response message
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responseMessage.content || 'I\'ve zoomed to that location on the map!',
        sender: 'ai',
        timestamp: new Date(),
      };

      setIsLoading(false);
      return aiResponse;
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please check your API key and try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return null;
    }
  };

  return {
    sendMessage,
    isLoading,
  };
};
