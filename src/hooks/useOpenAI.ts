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
  description?: string;
}

import { Intent } from '@/contexts/BoxVisibilityContext';

interface UseOpenAIOptions {
  onZoomToLocation?: (location: string) => Promise<void>;
  onDisplayMarkers?: (markers: POIMarker[]) => Promise<void>;
  onDisplayHiddenGem?: (marker: POIMarker) => Promise<void>;
  onCheckVisitorCapacity?: () => void;
  onDisplayHikingRoute?: () => Promise<void>;
  onHikingRouteLinz?: () => void;
  onCloseHiddenGem?: () => void;
  onDisplayTherapy?: (marker: POIMarker) => Promise<void>;
  onCloseTherapy?: () => void;
  onShowIntents?: (intents: Intent[]) => void;
  onAddIntent?: (intent: Intent) => void;
  onClearIntents?: () => void;
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
export const useOpenAI = ({ onZoomToLocation, onDisplayMarkers, onDisplayHiddenGem, onCheckVisitorCapacity, onDisplayHikingRoute, onHikingRouteLinz, onCloseHiddenGem, onDisplayTherapy, onCloseTherapy, onShowIntents, onAddIntent, onClearIntents }: UseOpenAIOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<number>(-1);
  const [loadingFunction, setLoadingFunction] = useState<string>('');
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
              description: 'Fetch and display the top 5 attractions in Linz on the map as markers. Use this when the user asks about attractions, cool spots, places to visit, things to do, or any general tourism questions about Linz.',
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
              description: 'Fetch and display a hidden gem spot in Linz on the map. ONLY use this function when the user explicitly asks for a "hidden gem", "secret spot", "hidden spot", or similar terms. This will replace any existing markers with the hidden gem marker.',
              parameters: {
                type: 'object',
                properties: {},
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'hiking_route_linz',
              description: 'Display a scenic circular hiking route near Linz on the map. Use this when the user asks about hiking, walking routes, trails, or outdoor activities near Linz.',
              parameters: {
                type: 'object',
                properties: {},
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'therapy_linz',
              description: 'Display a couples therapy center in Linz on the map in 3D. Use this when the user asks about therapy, couples therapy, counseling, relationship help, or mental health services in Linz.',
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
            // Show intents
            onShowIntents?.([
              { text: 'Exploration', category: 'activity', confidence: 92 },
              { text: 'Tourism', category: 'activity', confidence: 88 }
            ]);

            setLoadingFunction('top_5_linz_attractions');
            setLoadingStep(0); // Step 1: search attractions
            await new Promise(resolve => setTimeout(resolve, 500));

            setLoadingStep(1); // Step 2: check rating
            await new Promise(resolve => setTimeout(resolve, 500));

            setLoadingStep(2); // Step 3: display result
            await new Promise(resolve => setTimeout(resolve, 500));

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

            setLoadingStep(-1); // Hide loading
            setLoadingFunction('');
            onClearIntents?.();
          } else if (toolCall.type === 'function' && toolCall.function?.name === 'hidden_gem_linz') {
            // Show intents
            onShowIntents?.([
              { text: 'Discovery', category: 'discovery', confidence: 95 },
              { text: 'Local Secrets', category: 'discovery', confidence: 90 }
            ]);

            setLoadingFunction('hidden_gem_linz');
            setLoadingStep(0); // Step 1: search attractions
            await new Promise(resolve => setTimeout(resolve, 500));

            setLoadingStep(1); // Step 2: check rating
            await new Promise(resolve => setTimeout(resolve, 500));

            setLoadingStep(2); // Step 3: display result
            await new Promise(resolve => setTimeout(resolve, 500));

            // Fetch hidden gem from Supabase
            const { data, error } = await supabase
              .from('hidden_gem')
              .select('id, name, lat, lon, rating, image_url, description');

            if (error) {
              console.error('Error fetching hidden gem:', error);
              toast({
                title: "Error",
                description: "Failed to fetch hidden gem data.",
                variant: "destructive",
              });
            } else if (data && data.length > 0 && onDisplayHiddenGem) {
              // Use displayHiddenGem to zoom in close and show in 3D
              await onDisplayHiddenGem(data[0]);
            }

            setLoadingStep(-1); // Hide loading
            setLoadingFunction('');
            onClearIntents?.();

            // Wait for zoom animation to complete (3s flyTo), then display InfoBox
            setTimeout(() => {
              onCheckVisitorCapacity?.();
            }, 3000);
          } else if (toolCall.type === 'function' && toolCall.function?.name === 'hiking_route_linz') {
            // Show initial intents
            onShowIntents?.([
              { text: 'Hiking', category: 'activity', confidence: 94 },
              { text: 'Adventurous', category: 'activity', confidence: 89 }
            ]);

            // Display loading steps for hiking route
            setLoadingFunction('hiking_route_linz');
            setLoadingStep(0); // Step 1: search hiking trip
            // Close HiddenGemCard if open
            onCloseHiddenGem?.();
            await new Promise(resolve => setTimeout(resolve, 1000));

            setLoadingStep(1); // Step 2: check weather
            // Show WeatherBox and hide InfoBox when checking weather
            onHikingRouteLinz?.();
            // Add Weather-Conscious intent during step 2
            onAddIntent?.({ text: 'Weather-Conscious', category: 'safety', confidence: 91 });
            await new Promise(resolve => setTimeout(resolve, 2000));

            setLoadingStep(2); // Step 3: display result
            await new Promise(resolve => setTimeout(resolve, 1000));

            setLoadingStep(-1); // Hide loading
            setLoadingFunction('');

            // Display the hiking route on the map
            await onDisplayHikingRoute?.();

            // Clear intents after all steps complete
            onClearIntents?.();
          } else if (toolCall.type === 'function' && toolCall.function?.name === 'therapy_linz') {
            // Show intents for therapy
            onShowIntents?.([
              { text: 'Relationship Support', category: 'planning', confidence: 93 },
              { text: 'Wellness', category: 'activity', confidence: 88 }
            ]);

            setLoadingFunction('therapy_linz');
            setLoadingStep(0); // Step 1: search therapy centers
            // Close HiddenGemCard if open
            onCloseHiddenGem?.();
            await new Promise(resolve => setTimeout(resolve, 500));

            setLoadingStep(1); // Step 2: check availability
            await new Promise(resolve => setTimeout(resolve, 500));

            setLoadingStep(2); // Step 3: display result
            await new Promise(resolve => setTimeout(resolve, 500));

            setLoadingStep(-1); // Hide loading
            setLoadingFunction('');

            // Hardcoded therapy place data
            const therapyPlace: POIMarker = {
              id: 999,
              name: 'Couple Therapy Can Lichtenberg',
              lat: 48.30604083233107,
              lon: 14.28505931339385,
              rating: 4.8,
              image_url: '/therapie.png',
              description: 'Professional couples therapy and relationship counseling in a warm, supportive environment.'
            };

            // Display the therapy place on the map
            await onDisplayTherapy?.(therapyPlace);

            // Clear intents after all steps complete
            onClearIntents?.();
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
    loadingStep,
    loadingFunction,
  };
};
