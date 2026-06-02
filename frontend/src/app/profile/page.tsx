'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

type CaptchaData = {
  captchaImage: string;
  captchaToken: string;
};

export default function ProfileLoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [captcha, setCaptcha] = useState<CaptchaData | null>(null);
  const [captchaInput, setCaptchaInput] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Cargar el CAPTCHA visual desde el backend Express al montar el componente
  const loadCaptcha = async () => {
    try {
      const payload = await apiFetch<CaptchaData>('/api/auth/captcha');
      setCaptcha(payload);
    } catch (error) {
      console.error('No se pudo generar el captcha visual:', error);
    }
  };

  useEffect(() => {
    loadCaptcha();
  },);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const form = new FormData(event.currentTarget);
    const email = form.get('email') as string;
    const password = form.get('password') as string;
    const name = form.get('name') as string;

    try {
      if (isLogin) {
        // Petición de login: El backend validará si el correo es de empleado y si la contraseña coincide con la clave especial
        const payload = await apiFetch<{ success: boolean; token: string; user: { email: string; role: string } }>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        window.localStorage.setItem('wijutopia_token', payload.token);
        window.localStorage.setItem('wijutopia_user', JSON.stringify(payload.user));

        if (payload.user.role === 'empleado') {
          setMessage('¡Acceso Administrativo Confirmado! Redirigiendo al panel...');
          setTimeout(() => router.push('/admin'), 1500);
        } else {
          setMessage('Sesión iniciada correctamente como cliente.');
          setTimeout(() => router.push('/'), 1500);
        }
      } else {
        // Registro exclusivo para clientes (requiere captcha para mitigar bots)
        if (!captchaInput) {
          setMessage('Por favor, resuelva el captcha visual para continuar.');
          setLoading(false);
          return;
        }

        await apiFetch('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name,
            email,
            password,
            captchaText: captchaInput,
            captchaToken: captcha?.captchaToken,
          }),
        });

        setMessage('Cuenta de cliente creada exitosamente. Ahora puedes iniciar sesión.');
        setIsLogin(true);
        setCaptchaInput('');
        loadCaptcha();
      }
    } catch (error) {
      setMessage(error instanceof Error? error.message : 'Ocurrió un error inesperado.');
      loadCaptcha(); // Regenerar captcha en caso de fallo
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[85vh] max-w-lg flex-col justify-center px-4 py-12">
      <section className="rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-8 shadow-card dark:border-wiju-borderDark dark:bg-wiju-cardDark space-y-6">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-wiju-crimson dark:text-wiju-gold">
            Mi Cuenta Wijutopia
          </p>
          <h1 className="mt-2 text-3xl font-black">
            {isLogin? 'Iniciar Sesión' : 'Registrar Cliente'}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {isLogin
             ? 'Los empleados con correo admin@wijutopia.com deben ingresar su clave especial aquí.'
              : 'Únete a la comunidad TCG de Trujillo y maneja tu carrito local.'}
          </p>
        </div>

        {message && (
          <p className="rounded-2xl border border-wiju-gold/50 bg-wiju-gold/5 p-4 text-center text-sm font-semibold text-wiju-crimson dark:text-wiju-gold">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-400">Nombre Completo</label>
              <input
                name="name"
                type="text"
                placeholder="Ej. Carlos Mendoza"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-3.5 text-black focus:outline-none focus:ring-2 focus:ring-wiju-crimson"
                required
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-400">Correo Electrónico</label>
            <input
              name="email"
              type="email"
              placeholder="ejemplo@correo.com"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-3.5 text-black focus:outline-none focus:ring-2 focus:ring-wiju-crimson"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-400">Contraseña</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-3.5 text-black focus:outline-none focus:ring-2 focus:ring-wiju-crimson"
              required
            />
          </div>

          {/* Bloque CAPTCHA anti-bots: solo requerido durante el registro público de clientes */}
          {!isLogin && captcha && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 bg-slate-50 dark:bg-black/20">
              <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Verificación humana obligatoria</p>
              <div className="flex items-center gap-4">
                <img
                  src={captcha.captchaImage}
                  alt="Captcha de seguridad"
                  className="rounded-lg border border-slate-300 bg-white"
                />
                <button
                  type="button"
                  onClick={loadCaptcha}
                  className="rounded-lg bg-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300"
                >
                  Regenerar
                </button>
              </div>
              <input
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                placeholder="Escribe el código de arriba"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-3 text-black text-center font-mono font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-wiju-crimson"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-wiju-crimson py-4 font-black text-white shadow-neon transition-all hover:bg-opacity-90 disabled:opacity-50 dark:bg-wiju-gold dark:text-black"
          >
            {loading? 'Procesando...' : isLogin? 'Ingresar a mi Cuenta' : 'Registrar Cuenta'}
          </button>
        </form>

        <div className="border-t border-wiju-borderLight pt-4 text-center dark:border-wiju-borderDark">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage('');
              setCaptchaInput('');
              loadCaptcha();
            }}
            className="text-sm font-bold text-wiju-crimson hover:underline dark:text-wiju-gold"
          >
            {isLogin
             ? '¿No tienes cuenta? Registrate como cliente aquí'
              : '¿Ya posees una cuenta? Inicia sesión aquí'}
          </button>
        </div>
      </section>
    </main>
  );
}