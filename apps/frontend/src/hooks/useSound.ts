import { useState, useEffect, useCallback } from 'react';
import { audioManager, SoundType } from '../utils/AudioManager';

/**
 * React hook for managing sound effects in components
 *
 * Usage:
 * ```tsx
 * const { playSound, isSoundEnabled, toggleSound } = useSound();
 *
 * // Play a sound
 * playSound('click');
 *
 * // Toggle sound on/off
 * toggleSound();
 * ```
 */
export function useSound() {
  const [isSoundEnabled, setIsSoundEnabled] = useState(audioManager.isEnabled());

  // Sync state with AudioManager
  useEffect(() => {
    setIsSoundEnabled(audioManager.isEnabled());
  }, []);

  /**
   * Play a sound effect
   */
  const playSound = useCallback((type: SoundType) => {
    audioManager.play(type);
  }, []);

  /**
   * Toggle sound on/off
   */
  const toggleSound = useCallback((enabled?: boolean) => {
    const newState = enabled !== undefined ? enabled : !audioManager.isEnabled();
    audioManager.setEnabled(newState);
    setIsSoundEnabled(newState);
  }, []);

  /**
   * Set volume (0.0 to 1.0)
   */
  const setVolume = useCallback((volume: number) => {
    audioManager.setVolume(volume);
  }, []);

  return {
    playSound,
    isSoundEnabled,
    toggleSound,
    setVolume
  };
}
