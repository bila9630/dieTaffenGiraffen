import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAudioRecorder } from './useAudioRecorder';
import { useAudioPlayer } from './useAudioPlayer';
import { POIMarker } from './useOpenAI';
import { Intent } from '@/contexts/BoxVisibilityContext';
import { supabase } from '@/integrations/supabase/client';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking';

interface UseOpenAIRealtimeOptions {
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
 * Custom hook for OpenAI Realtime API with voice functionality
 */
export const useOpenAIRealtime = (options: UseOpenAIRealtimeOptions = {}) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
  const [loadingStep, setLoadingStep] = useState<number>(-1);
  const [loadingFunction, setLoadingFunction] = useState<string>('');
  const [transcript, setTranscript] = useState<string>('');

  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();
  const { playAudioChunk, stopAudio } = useAudioPlayer();

  /**
   * Handle audio data from recorder and send to WebSocket
   */
  const handleAudioData = useCallback((audioData: Int16Array) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Convert Int16Array to base64
      const uint8Array = new Uint8Array(audioData.buffer);
      const base64Audio = btoa(String.fromCharCode(...uint8Array));

      wsRef.current.send(JSON.stringify({
        type: 'input_audio_buffer.append',
        audio: base64Audio,
      }));
    }
  }, []);

  const { startRecording, stopRecording, isRecording, audioLevel } = useAudioRecorder({
    onAudioData: handleAudioData,
    onError: (error) => {
      toast({
        title: "Microphone Error",
        description: error.message,
        variant: "destructive",
      });
      setConnectionStatus('error');
    },
  });

  /**
   * Execute function calls from the Realtime API
   */
  const executeFunctionCall = useCallback(async (functionName: string, args: any) => {
    const {
      onZoomToLocation,
      onDisplayMarkers,
      onDisplayHiddenGem,
      onCheckVisitorCapacity,
      onDisplayHikingRoute,
      onHikingRouteLinz,
      onCloseHiddenGem,
      onDisplayTherapy,
      onCloseTherapy,
      onShowIntents,
      onAddIntent,
      onClearIntents,
    } = options;

    setVoiceStatus('processing');

    try {
      if (functionName === 'zoom_to_location') {
        await onZoomToLocation?.(args.location);
        return { success: true, message: `Zoomed to ${args.location}` };
      }

      if (functionName === 'top_5_linz_attractions') {
        onShowIntents?.([
          { text: 'Exploration', category: 'activity', confidence: 92 },
          { text: 'Tourism', category: 'activity', confidence: 88 }
        ]);

        setLoadingFunction('top_5_linz_attractions');
        setLoadingStep(0);
        await new Promise(resolve => setTimeout(resolve, 500));

        setLoadingStep(1);
        await new Promise(resolve => setTimeout(resolve, 500));

        setLoadingStep(2);
        await new Promise(resolve => setTimeout(resolve, 500));

        const { data, error } = await supabase
          .from('pois')
          .select('id, name, lat, lon')
          .order('id', { ascending: true })
          .limit(5);

        if (error) throw error;
        if (data && onDisplayMarkers) {
          await onDisplayMarkers(data);
        }

        setLoadingStep(-1);
        setLoadingFunction('');
        onClearIntents?.();

        return { success: true, message: 'Displayed top 5 attractions in Linz' };
      }

      if (functionName === 'hidden_gem_linz') {
        onShowIntents?.([
          { text: 'Discovery', category: 'discovery', confidence: 95 },
          { text: 'Local Secrets', category: 'discovery', confidence: 90 }
        ]);

        setLoadingFunction('hidden_gem_linz');
        setLoadingStep(0);
        await new Promise(resolve => setTimeout(resolve, 500));

        setLoadingStep(1);
        await new Promise(resolve => setTimeout(resolve, 500));

        setLoadingStep(2);
        await new Promise(resolve => setTimeout(resolve, 500));

        const { data, error } = await supabase
          .from('hidden_gem' as any)
          .select('id, name, lat, lon, rating, image_url, description');

        if (error) throw error;
        if (data && data.length > 0 && onDisplayHiddenGem) {
          await onDisplayHiddenGem(data[0] as any);
        }

        setLoadingStep(-1);
        setLoadingFunction('');
        onClearIntents?.();

        setTimeout(() => {
          onCheckVisitorCapacity?.();
        }, 3000);

        return { success: true, message: 'Displayed hidden gem in Linz' };
      }

      if (functionName === 'hiking_route_linz') {
        onShowIntents?.([
          { text: 'Hiking', category: 'activity', confidence: 94 },
          { text: 'Adventurous', category: 'activity', confidence: 89 }
        ]);

        setLoadingFunction('hiking_route_linz');
        setLoadingStep(0);
        onCloseHiddenGem?.();
        await new Promise(resolve => setTimeout(resolve, 1000));

        setLoadingStep(1);
        onHikingRouteLinz?.();
        onAddIntent?.({ text: 'Weather-Conscious', category: 'safety', confidence: 91 });
        await new Promise(resolve => setTimeout(resolve, 2000));

        setLoadingStep(2);
        await new Promise(resolve => setTimeout(resolve, 1000));

        setLoadingStep(-1);
        setLoadingFunction('');

        await onDisplayHikingRoute?.();
        onClearIntents?.();

        return { success: true, message: 'Displayed hiking route near Linz' };
      }

      if (functionName === 'therapy_linz') {
        onShowIntents?.([
          { text: 'Relationship Support', category: 'planning', confidence: 93 },
          { text: 'Wellness', category: 'activity', confidence: 88 }
        ]);

        setLoadingFunction('therapy_linz');
        setLoadingStep(0);
        onCloseHiddenGem?.();
        await new Promise(resolve => setTimeout(resolve, 500));

        setLoadingStep(1);
        await new Promise(resolve => setTimeout(resolve, 500));

        setLoadingStep(2);
        await new Promise(resolve => setTimeout(resolve, 500));

        setLoadingStep(-1);
        setLoadingFunction('');

        const therapyPlace: POIMarker = {
          id: 999,
          name: 'Couple Therapy Can Lichtenberg',
          lat: 48.30604083233107,
          lon: 14.28505931339385,
          rating: 4.8,
          image_url: '/therapie.png',
          description: 'Professional couples therapy and relationship counseling in a warm, supportive environment.'
        };

        await onDisplayTherapy?.(therapyPlace);
        onClearIntents?.();

        return { success: true, message: 'Displayed couples therapy center in Linz' };
      }

      return { success: false, message: 'Unknown function' };
    } catch (error) {
      console.error('Error executing function:', error);
      return { success: false, message: `Error: ${error}` };
    } finally {
      setVoiceStatus('idle');
    }
  }, [options]);

  /**
   * Handle WebSocket messages from Realtime API
   */
  const handleWebSocketMessage = useCallback(async (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'session.created':
          console.log('Session created:', data.session.id);
          setConnectionStatus('connected');
          setVoiceStatus('listening');
          break;

        case 'input_audio_buffer.speech_started':
          setVoiceStatus('listening');
          setTranscript('');
          break;

        case 'input_audio_buffer.speech_stopped':
          setVoiceStatus('processing');
          break;

        case 'conversation.item.input_audio_transcription.completed':
          setTranscript(data.transcript);
          break;

        case 'response.function_call_arguments.done':
          const functionName = data.name;
          const args = JSON.parse(data.arguments);
          const result = await executeFunctionCall(functionName, args);

          // Send function result back to the API
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'conversation.item.create',
              item: {
                type: 'function_call_output',
                call_id: data.call_id,
                output: JSON.stringify(result),
              },
            }));

            // Request response after function execution
            wsRef.current.send(JSON.stringify({
              type: 'response.create',
            }));
          }
          break;

        case 'response.audio.delta':
          setVoiceStatus('speaking');
          // Decode base64 audio and play
          const audioBase64 = data.delta;
          const binaryString = atob(audioBase64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const pcm16 = new Int16Array(bytes.buffer);
          playAudioChunk(pcm16);
          break;

        case 'response.audio.done':
          setVoiceStatus('listening');
          break;

        case 'error':
          console.error('Realtime API error:', data.error);
          toast({
            title: "API Error",
            description: data.error.message,
            variant: "destructive",
          });
          break;
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }, [executeFunctionCall, playAudioChunk, toast]);

  /**
   * Connect to OpenAI Realtime API
   */
  const connect = useCallback(async (apiKey: string) => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key",
        variant: "destructive",
      });
      return;
    }

    try {
      setConnectionStatus('connecting');

      // Create WebSocket connection
      const ws = new WebSocket(
        `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`,
        ['realtime', `openai-insecure-api-key.${apiKey}`, 'openai-beta.realtime-v1']
      );

      ws.onopen = () => {
        console.log('WebSocket connected');

        // Configure session with tools
        ws.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: 'You are a helpful travel planning assistant. Provide concise, friendly advice about destinations, itineraries, and travel tips. When users mention a specific destination or ask about a place, use the appropriate function to show it on the map.',
            voice: 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1',
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
            },
            tools: [
              {
                type: 'function',
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
              {
                type: 'function',
                name: 'top_5_linz_attractions',
                description: 'Fetch and display the top 5 attractions in Linz on the map as markers. Use this when the user asks about attractions, cool spots, places to visit, things to do, or any general tourism questions about Linz.',
                parameters: {
                  type: 'object',
                  properties: {},
                },
              },
              {
                type: 'function',
                name: 'hidden_gem_linz',
                description: 'Fetch and display a hidden gem spot in Linz on the map. ONLY use this function when the user explicitly asks for a "hidden gem", "secret spot", "hidden spot", or similar terms.',
                parameters: {
                  type: 'object',
                  properties: {},
                },
              },
              {
                type: 'function',
                name: 'hiking_route_linz',
                description: 'Display a scenic circular hiking route near Linz on the map. Use this when the user asks about hiking, walking routes, trails, or outdoor activities near Linz.',
                parameters: {
                  type: 'object',
                  properties: {},
                },
              },
              {
                type: 'function',
                name: 'therapy_linz',
                description: 'Display a couples therapy center in Linz on the map. Use this when the user asks about therapy, couples therapy, counseling, relationship help, or mental health services in Linz.',
                parameters: {
                  type: 'object',
                  properties: {},
                },
              },
            ],
            tool_choice: 'auto',
          },
        }));
      };

      ws.onmessage = handleWebSocketMessage;

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        toast({
          title: "Connection Error",
          description: "Failed to connect to OpenAI Realtime API",
          variant: "destructive",
        });
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setConnectionStatus('disconnected');
        setVoiceStatus('idle');
        stopRecording();
      };

      wsRef.current = ws;

      // Start recording when connected
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          startRecording();
        }
      }, 1000);

    } catch (error) {
      console.error('Error connecting:', error);
      setConnectionStatus('error');
      toast({
        title: "Connection Error",
        description: "Failed to establish connection",
        variant: "destructive",
      });
    }
  }, [toast, handleWebSocketMessage, startRecording, stopRecording]);

  /**
   * Disconnect from Realtime API
   */
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    stopRecording();
    stopAudio();
    setConnectionStatus('disconnected');
    setVoiceStatus('idle');
    setTranscript('');
  }, [stopRecording, stopAudio]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    connectionStatus,
    voiceStatus,
    isRecording,
    audioLevel,
    loadingStep,
    loadingFunction,
    transcript,
  };
};
