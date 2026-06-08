'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/client');
  }, [router]);

  return (
    <main className="mx-auto flex min-h-[85vh] max-w-lg flex-col justify-center px-4 py-12">
      <section className="rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-8 shadow-card dark:border-wiju-borderDark dark:bg-wiju-cardDark text-center">
        <p className="text-xl font-black text-wiju-signMagenta">Sección de perfil eliminada</p>
        <p className="mt-4 text-sm text-slate-400">
          El apartado de perfil ya no está disponible. Serás redirigido al catálogo público.
        </p>
      </section>
    </main>
  );
}
