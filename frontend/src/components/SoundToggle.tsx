'use client';

import { useEffect, useRef, useState } from 'react';

import { SparkIcon } from '@/components/Icons';

const soundStorageKey = 'wijutopia_sound_effects_enabled';

type WijuSound = 'tap' | 'cart' | 'success' | 'nav';

const soundMap: Record<WijuSound, { frequency: number; endFrequency: number; duration: number; type: OscillatorType; gain: number }> = {
  tap: { frequency: 420, endFrequency: 540, duration: 0.08, type: 'triangle', gain: 0.035 },
  nav: { frequency: 330, endFrequency: 490, duration: 0.1, type: 'sine', gain: 0.03 },
  cart: { frequency: 520, endFrequency: 880, duration: 0.16, type: 'square', gain: 0.025 },
  success: { frequency: 660, endFrequency: 990, duration: 0.18, type: 'triangle', gain: 0.032 }
};

function readSoundType(target: EventTarget | null): WijuSound {
  if (!(target instanceof Element)) {
    return 'tap';
  }

  const soundElement = target.closest<HTMLElement>('[data-sound]');
  const requestedSound = soundElement?.dataset.sound;
  return requestedSound === 'cart' || requestedSound === 'success' || requestedSound === 'nav' ? requestedSound : 'tap';
}

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setEnabled(window.localStorage.getItem(soundStorageKey) === 'true');
  }, []);

  useEffect(() => {
    window.localStorage.setItem(soundStorageKey, String(enabled));
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const playEffect = (event: MouseEvent) => {
      const context = audioContextRef.current ?? new AudioContext();
      audioContextRef.current = context;

      const sound = soundMap[readSoundType(event.target)];
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      const now = context.currentTime;

      oscillator.type = sound.type;
      oscillator.frequency.setValueAtTime(sound.frequency, now);
      oscillator.frequency.exponentialRampToValueAtTime(sound.endFrequency, now + sound.duration);
      gainNode.gain.setValueAtTime(sound.gain, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + sound.duration);
      oscillator.connect(gainNode).connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + sound.duration);
    };

    document.addEventListener('click', playEffect, { capture: true });
    return () => document.removeEventListener('click', playEffect, { capture: true });
  }, [enabled]);

  return (
    <button
      type="button"
      onClick={() => setEnabled((current: boolean) => !current)}
      data-sound="success"
      className="focus-ring inline-flex items-center gap-2 rounded-full border border-wiju-borderLight px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-wiju-moonGold hover:text-wiju-signMagenta dark:border-wiju-borderDark dark:hover:text-wiju-moonGold"
      aria-pressed={enabled}
    >
      <SparkIcon className="h-4 w-4" />
      {enabled ? 'Sonido ON' : 'Sonido OFF'}
    </button>
  );
}
