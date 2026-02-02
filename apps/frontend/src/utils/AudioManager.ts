/**
 * AudioManager - Singleton class for managing game sound effects
 *
 * Features:
 * - Preloads all sound files for instant playback
 * - Supports sound enable/disable toggle
 * - Allows overlapping sounds by cloning audio elements
 * - Volume control per sound type
 */

export type SoundType = 'click' | 'correct' | 'wrong' | 'celebration';

class AudioManager {
  private sounds: Map<SoundType, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private preloaded: boolean = false;
  private readonly baseVolume = 0.5;

  constructor() {
    // Initialize in browser environment only
    if (typeof window !== 'undefined') {
      this.preloadSounds();
    }
  }

  /**
   * Preload all sound files into memory
   */
  preloadSounds(): void {
    if (this.preloaded) return;

    const soundFiles: Record<SoundType, string> = {
      click: '/sounds/click.wav',
      correct: '/sounds/correct.wav',
      wrong: '/sounds/wrong.wav',
      celebration: '/sounds/celebration.wav'
    };

    Object.entries(soundFiles).forEach(([type, path]) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      audio.volume = this.baseVolume;
      this.sounds.set(type as SoundType, audio);
    });

    this.preloaded = true;
  }

  /**
   * Play a sound effect
   * Creates a clone to allow overlapping sounds
   */
  play(type: SoundType): void {
    if (!this.enabled) return;

    const sound = this.sounds.get(type);
    if (!sound) {
      console.warn(`Sound "${type}" not found`);
      return;
    }

    try {
      // Clone the audio element to allow overlapping playback
      const clone = sound.cloneNode() as HTMLAudioElement;
      clone.volume = this.baseVolume;

      // Play the cloned sound
      const playPromise = clone.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Auto-play was prevented (browser policy)
          console.warn('Sound playback prevented:', error);
        });
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  /**
   * Enable or disable all sounds
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;

    // Store preference in localStorage
    try {
      localStorage.setItem('soundEnabled', JSON.stringify(enabled));
    } catch (error) {
      console.warn('Could not save sound preference:', error);
    }
  }

  /**
   * Get current enabled state
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Load sound preference from localStorage
   */
  loadPreference(): void {
    try {
      const stored = localStorage.getItem('soundEnabled');
      if (stored !== null) {
        this.enabled = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Could not load sound preference:', error);
    }
  }

  /**
   * Set volume for all sounds (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach((audio) => {
      audio.volume = clampedVolume;
    });
  }
}

// Export singleton instance
export const audioManager = new AudioManager();

// Load user preference on initialization
if (typeof window !== 'undefined') {
  audioManager.loadPreference();
}
