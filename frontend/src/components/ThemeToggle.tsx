'use client';

import { useEffect, useState } from 'react';
import { useTracker } from '@/hooks/useTracker';

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(true);
  const { trackClick } = useTracker();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const toggleTheme = () => {
    setDark((current) => !current);
    void trackClick('toggle_tema_color');
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      data-sound="tap"
      className="focus-ring rounded-full border border-wiju-borderLight px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-wiju-moonGold hover:text-wiju-signMagenta dark:border-wiju-borderDark dark:hover:text-wiju-moonGold"
    >
      {dark ? 'Modo claro' : 'Modo oscuro'}
    </button>
  );
}
