import { useState, useRef, useCallback } from 'react';

/**
 * Hook for playing audio from PCM16 chunks
 * Handles audio buffering and playback from OpenAI Realtime API
 */
export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);
  const nextStartTimeRef = useRef<number>(0);

  /**
   * Initialize audio context
   */
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      nextStartTimeRef.current = 0;
    }
    return audioContextRef.current;
  }, []);

  /**
   * Convert PCM16 (Int16Array) to Float32Array for Web Audio API
   */
  const pcm16ToFloat32 = (pcm16: Int16Array): Float32Array => {
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / (pcm16[i] < 0 ? 0x8000 : 0x7FFF);
    }
    return float32;
  };

  /**
   * Process audio queue and play chunks
   */
  const processAudioQueue = useCallback(() => {
    if (!audioContextRef.current || audioQueueRef.current.length === 0 || !isPlayingRef.current) {
      setIsPlaying(false);
      return;
    }

    const audioContext = audioContextRef.current;
    const pcm16Chunk = audioQueueRef.current.shift()!;
    const float32Data = pcm16ToFloat32(pcm16Chunk);

    // Create audio buffer
    const audioBuffer = audioContext.createBuffer(1, float32Data.length, 24000);
    audioBuffer.getChannelData(0).set(float32Data);

    // Create buffer source
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);

    // Schedule playback
    const currentTime = audioContext.currentTime;
    const startTime = Math.max(currentTime, nextStartTimeRef.current);
    source.start(startTime);

    // Update next start time
    nextStartTimeRef.current = startTime + audioBuffer.duration;

    // Process next chunk
    source.onended = () => {
      processAudioQueue();
    };
  }, []);

  /**
   * Add audio chunk to queue and start playing
   */
  const playAudioChunk = useCallback((pcm16Data: Int16Array) => {
    initAudioContext();
    audioQueueRef.current.push(pcm16Data);

    if (!isPlayingRef.current) {
      isPlayingRef.current = true;
      setIsPlaying(true);
      processAudioQueue();
    }
  }, [initAudioContext, processAudioQueue]);

  /**
   * Stop audio playback and clear queue
   */
  const stopAudio = useCallback(() => {
    isPlayingRef.current = false;
    audioQueueRef.current = [];
    nextStartTimeRef.current = 0;
    setIsPlaying(false);

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  /**
   * Clear audio queue but keep playing current chunk
   */
  const clearQueue = useCallback(() => {
    audioQueueRef.current = [];
  }, []);

  return {
    playAudioChunk,
    stopAudio,
    clearQueue,
    isPlaying,
  };
};
