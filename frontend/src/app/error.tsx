'use client';

import { useEffect } from 'react';

import { SparkIcon } from '@/components/Icons';

export default function GlobalRouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Error controlado en la interfaz Wijutopia:', error.message, error.digest ?? 'sin-digest');
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center px-4 py-12">
      <section className="w-full rounded-[2rem] border border-wiju-moonGold/50 bg-wiju-cardLight p-8 text-center shadow-neon dark:bg-wiju-doorPurple/70">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-wiju-signMagenta text-white shadow-neon dark:bg-wiju-moonGold dark:text-wiju-ink">
          <SparkIcon className="h-8 w-8" />
        </div>
        <p className="mt-6 text-sm font-black uppercase tracking-[0.25em] text-wiju-signMagenta dark:text-wiju-moonGold">Excepción controlada</p>
        <h1 className="mt-3 text-3xl font-black">La vista no pudo cargarse correctamente</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-200">
          El prototipo capturó el error para evitar una pantalla en blanco. Puede reintentar la carga o revisar el panel/logs del backend si el problema viene de la API.
        </p>
        <button
          type="button"
          onClick={reset}
          data-sound="success"
          className="focus-ring mt-6 rounded-2xl bg-wiju-signMagenta px-6 py-3 font-black text-white shadow-neon transition hover:-translate-y-0.5 dark:bg-wiju-moonGold dark:text-wiju-ink"
        >
          Reintentar vista
        </button>
      </section>
    </main>
  );
}
