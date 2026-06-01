'use client';

import { FormEvent, useEffect, useState } from 'react';

import { apiFetch } from '@/lib/api';

type CaptchaState = { captchaImage: string; captchaToken: string } | null;
type AuthUser = { email: string; role: string };

type AuthProfileCardProps = {
  title?: string;
  description?: string;
  adminOnly?: boolean;
  onAuthenticated?: (token: string, user: AuthUser) => void;
};

export default function AuthProfileCard({
  title = 'Profile de usuario',
  description = 'Inicia sesión o registra una cuenta para guardar carrito, pedidos, restock y respuestas de opinión.',
  adminOnly = false,
  onAuthenticated
}: AuthProfileCardProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [captcha, setCaptcha] = useState<CaptchaState>(null);
  const [message, setMessage] = useState('');

  const fetchCaptcha = async () => {
    try {
      const payload = await apiFetch<{ success: boolean; captchaImage: string; captchaToken: string }>('/api/auth/captcha');
      setCaptcha({ captchaImage: payload.captchaImage, captchaToken: payload.captchaToken });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo cargar el captcha.');
    }
  };

  useEffect(() => {
    if (authMode === 'register') {
      void fetchCaptcha();
    }
  }, [authMode]);

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const path = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = authMode === 'login'
      ? { email: form.get('email'), password: form.get('password') }
      : {
          name: form.get('name'),
          email: form.get('email'),
          password: form.get('password'),
          captchaAnswer: form.get('captchaAnswer'),
          captchaToken: captcha?.captchaToken
        };

    try {
      const payload = await apiFetch<{ success: boolean; token: string; user: AuthUser }>(path, {
        method: 'POST',
        body: JSON.stringify(body)
      });

      if (adminOnly && (payload.user.email !== 'admin@wijutopia.com' || payload.user.role !== 'empleado')) {
        setMessage('Profile restringido: se requiere admin@wijutopia.com con rol Empleado.');
        return;
      }

      window.localStorage.setItem('wijutopia_token', payload.token);
      window.localStorage.setItem('wijutopia_user', JSON.stringify(payload.user));
      setMessage(`Sesión activa como ${payload.user.email} (${payload.user.role}).`);
      onAuthenticated?.(payload.token, payload.user);
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Error de autenticación.');
      if (authMode === 'register') {
        await fetchCaptcha();
      }
    }
  };

  return (
    <section className="rounded-3xl border border-wiju-moonGold/50 bg-wiju-cardLight p-6 shadow-card dark:border-wiju-borderDark dark:bg-wiju-cardDark">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-wiju-signMagenta dark:text-wiju-moonGold">Profile</p>
      <h2 className="mt-2 text-2xl font-black">{title}</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>
      {message && <p className="mt-4 rounded-xl bg-wiju-moonGold/15 p-3 text-sm font-semibold text-wiju-logoWine dark:text-wiju-moonGold">{message}</p>}
      <div className="mt-5 flex gap-2">
        <button type="button" onClick={() => setAuthMode('login')} className={`rounded-full px-4 py-2 text-sm font-black ${authMode === 'login' ? 'bg-wiju-logoWine text-white' : 'border border-wiju-borderLight dark:border-wiju-borderDark'}`}>Login</button>
        <button type="button" onClick={() => setAuthMode('register')} className={`rounded-full px-4 py-2 text-sm font-black ${authMode === 'register' ? 'bg-wiju-moonGold text-wiju-ink' : 'border border-wiju-borderLight dark:border-wiju-borderDark'}`}>Registro</button>
      </div>
      <form onSubmit={handleAuth} className="mt-5 space-y-3">
        {authMode === 'register' && <input name="name" placeholder="Nombre" className="w-full rounded-xl border p-3 text-black" required />}
        <input name="email" type="email" defaultValue={adminOnly ? 'admin@wijutopia.com' : undefined} placeholder="Correo" className="w-full rounded-xl border p-3 text-black" required />
        <input name="password" type="password" placeholder="Contraseña" className="w-full rounded-xl border p-3 text-black" required />
        {authMode === 'register' && captcha && (
          <div className="space-y-2">
            <img src={captcha.captchaImage} alt="Captcha visual" className="rounded-xl border border-wiju-borderDark" />
            <input name="captchaAnswer" placeholder="Texto del captcha" className="w-full rounded-xl border p-3 text-black" required />
          </div>
        )}
        <button className="w-full rounded-2xl bg-wiju-moonGold px-4 py-3 font-black text-wiju-ink shadow-neon" type="submit">{authMode === 'login' ? 'Entrar al profile' : 'Crear profile'}</button>
      </form>
    </section>
  );
}
