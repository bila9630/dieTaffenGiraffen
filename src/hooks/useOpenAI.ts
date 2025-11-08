import { useState } from 'react';
import OpenAI from 'openai';
import { useToast } from '@/hooks/use-toast';
import { ChatCompletionMessageToolCall } from 'openai/resources/chat/completions';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface UseOpenAIOptions {
  onZoomToLocation?: (location: string) => Promise<void>;
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
export const useOpenAI = ({ onZoomToLocation }: UseOpenAIOptions = {}) => {
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
