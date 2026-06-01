'use client';

import { useEffect, useState } from 'react';
import { ChartIcon } from '@/components/Icons';
import { API_URL, apiFetch } from '@/lib/api';

type HealthPayload = {
  success: boolean;
  service: string;
  timestamp: string;
};

export default function BackendStatus() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [detail, setDetail] = useState('Verificando conexión con Express API...');

  useEffect(() => {
    let active = true;

    apiFetch<HealthPayload>('/api/health')
      .then((payload) => {
        if (!active) return;
        setStatus('online');
        setDetail(`${payload.service} operativo · ${new Date(payload.timestamp).toLocaleTimeString()}`);
      })
      .catch((error) => {
        if (!active) return;
        setStatus('offline');
        setDetail(`Backend no disponible en ${API_URL}: ${error instanceof Error ? error.message : 'error de red'}`);
      });

    return () => {
      active = false;
    };
  }, []);

  const color = status === 'online' ? 'bg-emerald-500' : status === 'offline' ? 'bg-wiju-crimson' : 'bg-wiju-gold';

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-wiju-borderLight bg-wiju-cardLight px-4 py-3 text-sm shadow-card dark:border-wiju-borderDark dark:bg-wiju-cardDark">
        <span className={`h-3 w-3 rounded-full ${color}`} aria-hidden="true" />
        <ChartIcon className="h-4 w-4 text-wiju-crimson dark:text-wiju-gold" /><strong>Integración frontend ↔ backend:</strong>
        <span className="text-slate-600 dark:text-slate-300">{detail}</span>
      </div>
    </div>
  );
}
