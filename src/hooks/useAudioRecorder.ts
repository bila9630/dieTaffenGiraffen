import { useState, useRef, useCallback } from 'react';

interface UseAudioRecorderOptions {
  onAudioData?: (audioData: Int16Array) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for recording audio from microphone and converting to PCM16 format
 * Required format: 24kHz, 16-bit PCM, mono, little-endian
 */
export const useAudioRecorder = ({ onAudioData, onError }: UseAudioRecorderOptions = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  /**
   * Start recording audio from microphone
   */
  const startRecording = useCallback(async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000, // 24kHz required by OpenAI Realtime API
          channelCount: 1, // Mono
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;

      // Create audio context
      const audioContext = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);

      // Create analyser for audio level visualization
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      // Create processor for PCM16 conversion
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);

        // Convert Float32Array to Int16Array (PCM16)
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          // Clamp and convert to 16-bit integer
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        onAudioData?.(pcm16);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      // Start audio level monitoring
      const monitorAudioLevel = () => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average audio level (0-100)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(Math.round((average / 255) * 100));

        animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
      };

      monitorAudioLevel();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting audio recording:', error);
      onError?.(error as Error);
    }
  }, [onAudioData, onError]);

  /**
   * Stop recording audio
   */
  const stopRecording = useCallback(() => {
    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Disconnect and close processor
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    // Disconnect analyser
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    setIsRecording(false);
    setAudioLevel(0);
  }, []);

  return {
    startRecording,
    stopRecording,
    isRecording,
    audioLevel,
  };
};
