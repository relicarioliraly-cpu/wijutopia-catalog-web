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
      className="focus-ring rounded-full border border-wiju-borderLight px-4 py-2 text-sm font-semibold dark:border-wiju-borderDark"
    >
      {dark ? 'Modo claro' : 'Modo oscuro'}
    </button>
  );
}
