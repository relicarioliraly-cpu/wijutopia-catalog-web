'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { apiFetch, Product } from '@/lib/api';
import { useTracker } from '@/hooks/useTracker';

type CartItem = Product & { quantity: number };
type ActiveRestock = { id: number; customerEmail: string; status: string };
type CaptchaState = { captchaImage: string; captchaToken: string } | null;

export default function ClientPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeRestocks, setActiveRestocks] = useState<Record<number, ActiveRestock>>({});
  const [query, setQuery] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [captcha, setCaptcha] = useState<CaptchaState>(null);
  const [message, setMessage] = useState('');
  const { trackClick } = useTracker();

  useEffect(() => {
    apiFetch<{ success: boolean; data: Product[] }>('/api/products')
      .then((payload) => setProducts(payload.data))
      .catch((error) => setMessage(error.message));

    const storedCart = window.localStorage.getItem('wijutopia_cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }

    const storedRestocks = window.localStorage.getItem('wijutopia_restock_requests');
    if (storedRestocks) {
      setActiveRestocks(JSON.parse(storedRestocks));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('wijutopia_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    window.localStorage.setItem('wijutopia_restock_requests', JSON.stringify(activeRestocks));
  }, [activeRestocks]);

  useEffect(() => {
    if (authMode === 'register') {
      fetchCaptcha();
    }
  }, [authMode]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.toLowerCase();
    return products.filter((product) => product.name.toLowerCase().includes(normalizedQuery));
  }, [products, query]);

  const cartTotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  const fetchCaptcha = async () => {
    const payload = await apiFetch<{ success: boolean; captchaImage: string; captchaToken: string }>('/api/auth/captcha');
    setCaptcha({ captchaImage: payload.captchaImage, captchaToken: payload.captchaToken });
  };

  const addToCart = (product: Product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const trackProductInterest = async (product: Product, eventType: 'view' | 'click') => {
    try {
      await apiFetch(`/api/insights/products/${product.id}/interest`, {
        method: 'POST',
        body: JSON.stringify({ eventType })
      });
    } catch (error) {
      console.warn('No se pudo registrar el interés del producto.', error);
    }
  };

  const requestRestock = async (product: Product) => {
    const customerEmail = window.prompt('Correo de tu cuenta para registrar un único intento por temporada:');
    if (!customerEmail) {
      setMessage('Debes ingresar un correo para activar la espera de stock/restock.');
      return;
    }

    try {
      const payload = await apiFetch<{ success: boolean; message: string; data: { id: number; status: string; seasonKey: string; seasonEndsAt: string; totalInterest: number; threshold: number } }>(`/api/insights/products/${product.id}/restock`, {
        method: 'POST',
        body: JSON.stringify({ customerEmail, requestedQuantity: 1 })
      });
      setActiveRestocks((current) => ({ ...current, [product.id]: { id: payload.data.id, customerEmail, status: payload.data.status } }));
      setMessage(`${payload.message} Corte de temporada: ${payload.data.seasonEndsAt}. Interés actual: ${payload.data.totalInterest}/${payload.data.threshold}.`);
    } catch (error) {
      const apiError = error instanceof Error ? error.message : 'No se pudo solicitar stock/restock.';
      setMessage(apiError);
    }
  };

  const cancelRestock = async (product: Product, request: ActiveRestock) => {
    try {
      await apiFetch(`/api/insights/restock/${request.id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ customerEmail: request.customerEmail })
      });
      setActiveRestocks((current) => {
        const next = { ...current };
        delete next[product.id];
        return next;
      });
      setMessage(`Solicitud de stock/restock cancelada para ${product.name}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo cancelar la solicitud.');
    }
  };

  const requestPreorderForProduct = async (product: Product) => {
    try {
      await apiFetch('/api/insights/launch-requests', {
        method: 'POST',
        body: JSON.stringify({
          productName: product.name,
          franchise: product.category || 'TCG',
          requestedQuantity: 1,
          notes: 'Pedido directo desde tarjeta de lanzamiento.'
        })
      });
      setMessage(`Pedido de lanzamiento registrado para ${product.name}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo registrar el pedido.');
    }
  };

  const handleLaunchRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await apiFetch('/api/insights/launch-requests', {
        method: 'POST',
        body: JSON.stringify({
          productName: form.get('productName'),
          franchise: form.get('franchise'),
          customerEmail: form.get('customerEmail') || undefined,
          requestedQuantity: Number(form.get('requestedQuantity') || 1),
          notes: form.get('notes') || undefined
        })
      });
      event.currentTarget.reset();
      setMessage('Pedido de lanzamiento enviado al equipo de Wijutopia demo.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo enviar el pedido de lanzamiento.');
    }
  };

  const handleResearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await apiFetch('/api/insights/research', {
        method: 'POST',
        body: JSON.stringify({
          customerEmail: form.get('customerEmail') || undefined,
          favoriteFranchise: form.get('favoriteFranchise'),
          satisfactionScore: Number(form.get('satisfactionScore')),
          preferredBudget: Number(form.get('preferredBudget') || 0),
          playStyle: form.get('playStyle'),
          triviaAnswer: form.get('triviaAnswer'),
          comments: form.get('comments')
        })
      });
      event.currentTarget.reset();
      setMessage('Gracias: tus respuestas ayudarán a priorizar productos y eventos del catálogo demo.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar la encuesta.');
    }
  };

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
      const payload = await apiFetch<{ success: boolean; token: string; user: { email: string; role: string } }>(path, {
        method: 'POST',
        body: JSON.stringify(body)
      });
      window.localStorage.setItem('wijutopia_token', payload.token);
      window.localStorage.setItem('wijutopia_user', JSON.stringify(payload.user));
      setMessage(`Sesión iniciada como ${payload.user.email} (${payload.user.role}).`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Error de autenticación.');
      if (authMode === 'register') {
        await fetchCaptcha();
      }
    }
  };

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 py-10">
      <section className="rounded-[2rem] bg-gradient-to-br from-wiju-crimson to-black p-8 text-white shadow-card dark:from-wiju-cardDark dark:to-black">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-wiju-gold">Catálogo cliente</p>
        <h1 className="mt-3 text-4xl font-black md:text-6xl">Cartas y accesorios TCG para Trujillo</h1>
        <p className="mt-4 max-w-3xl text-white/80">Busca productos, añade al carrito y registra vistas/clics para evaluar stock junto con mensajes oficiales de WhatsApp.</p>
      </section>

      {message && <p className="rounded-2xl border border-wiju-gold/50 p-4 text-sm font-semibold">{message}</p>}

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-6 dark:border-wiju-borderDark dark:bg-wiju-cardDark">
          <h2 className="text-xl font-black">Sobre la tienda</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Apartado informativo para explicar torneos, comunidad TCG, atención local y referencias de disponibilidad sin afirmar representación oficial.</p>
        </article>
        <article className="rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-6 dark:border-wiju-borderDark dark:bg-wiju-cardDark">
          <h2 className="text-xl font-black">Etiquetas de referencia</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Los productos pueden mostrar En vitrina, Pedido por encargo, Restock prioritario, Preventa Wijutopia, Torneo/Liga o Accesorio TCG como etiquetas comparativas/demostrativas.</p>
        </article>
        <article className="rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-6 dark:border-wiju-borderDark dark:bg-wiju-cardDark">
          <h2 className="text-xl font-black">Disponibilidad</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Cada tarjeta marca Disponible o Agotado; los agotados permiten pedir stock/restock una sola vez por cuenta y temporada, con opción de cancelar la espera.</p>
        </article>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => void trackClick('enlace_navbar_catalogo')}
            placeholder="Filtrar por Pokémon, One Piece, booster, accesorio..."
            className="focus-ring w-full rounded-2xl border border-wiju-borderLight bg-white px-5 py-4 dark:border-wiju-borderDark dark:bg-wiju-cardDark"
          />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                activeRestock={activeRestocks[product.id]}
                onAddToCart={addToCart}
                onRestockRequest={requestRestock}
                onCancelRestock={cancelRestock}
                onPreorderRequest={requestPreorderForProduct}
                onInterestEvent={trackProductInterest}
              />
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-6 shadow-card dark:border-wiju-borderDark dark:bg-wiju-cardDark">
            <button type="button" onClick={() => void trackClick('enlace_navbar_carrito')} className="text-left text-2xl font-black">Carrito local</button>
            <div className="mt-4 space-y-3">
              {cart.length === 0 && <p className="text-sm text-slate-500">Tu carrito está vacío.</p>}
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between gap-3 text-sm">
                  <span>{item.quantity} × {item.name}</span>
                  <span className="font-bold">S/ {(Number(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 border-t border-wiju-borderLight pt-4 text-xl font-black dark:border-wiju-borderDark">Total: S/ {cartTotal.toFixed(2)}</p>
            <button type="button" onClick={() => setCart([])} className="mt-4 w-full rounded-2xl border border-wiju-borderLight px-4 py-3 font-bold dark:border-wiju-borderDark">Vaciar carrito</button>
          </section>

          <section className="rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-6 shadow-card dark:border-wiju-borderDark dark:bg-wiju-cardDark">
            <div className="flex gap-2">
              <button type="button" onClick={() => setAuthMode('login')} className="rounded-full bg-wiju-crimson px-4 py-2 text-sm font-bold text-white">Login</button>
              <button type="button" onClick={() => setAuthMode('register')} className="rounded-full border border-wiju-borderLight px-4 py-2 text-sm font-bold dark:border-wiju-borderDark">Registro</button>
            </div>
            <form onSubmit={handleAuth} className="mt-5 space-y-3">
              {authMode === 'register' && <input name="name" placeholder="Nombre" className="w-full rounded-xl border p-3 text-black" required />}
              <input name="email" type="email" placeholder="Correo" className="w-full rounded-xl border p-3 text-black" required />
              <input name="password" type="password" placeholder="Contraseña" className="w-full rounded-xl border p-3 text-black" required />
              {authMode === 'register' && captcha && (
                <div className="space-y-2">
                  <img src={captcha.captchaImage} alt="Captcha visual" className="rounded-xl border border-wiju-borderDark" />
                  <input name="captchaAnswer" placeholder="Texto del captcha" className="w-full rounded-xl border p-3 text-black" required />
                </div>
              )}
              <button className="w-full rounded-2xl bg-wiju-gold px-4 py-3 font-black text-black" type="submit">Enviar</button>
            </form>
          </section>
        </aside>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={handleLaunchRequest} className="rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-6 shadow-card dark:border-wiju-borderDark dark:bg-wiju-cardDark">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-wiju-crimson dark:text-wiju-gold">Lanzamientos</p>
          <h2 className="mt-2 text-2xl font-black">Pedir próximo lanzamiento</h2>
          <div className="mt-5 grid gap-3">
            <input name="productName" placeholder="Nombre del producto esperado" className="rounded-xl border p-3 text-black" required />
            <input name="franchise" placeholder="Franquicia: Pokémon, One Piece, Digimon..." className="rounded-xl border p-3 text-black" required />
            <input name="customerEmail" type="email" placeholder="Correo opcional" className="rounded-xl border p-3 text-black" />
            <input name="requestedQuantity" type="number" min="1" defaultValue="1" className="rounded-xl border p-3 text-black" />
            <textarea name="notes" placeholder="Notas: idioma, rareza, fecha de salida, presupuesto..." className="rounded-xl border p-3 text-black" />
            <button type="submit" className="rounded-2xl bg-wiju-crimson px-4 py-3 font-black text-white dark:bg-wiju-gold dark:text-black">Enviar pedido</button>
          </div>
        </form>

        <form onSubmit={handleResearchSubmit} className="rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-6 shadow-card dark:border-wiju-borderDark dark:bg-wiju-cardDark">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-wiju-crimson dark:text-wiju-gold">Conducta del cliente</p>
          <h2 className="mt-2 text-2xl font-black">Encuesta, trivia y satisfacción</h2>
          <div className="mt-5 grid gap-3">
            <input name="customerEmail" type="email" placeholder="Correo opcional" className="rounded-xl border p-3 text-black" />
            <input name="favoriteFranchise" placeholder="Franquicia favorita" className="rounded-xl border p-3 text-black" required />
            <select name="satisfactionScore" className="rounded-xl border p-3 text-black" required>
              <option value="5">5 - Muy satisfecho</option>
              <option value="4">4 - Satisfecho</option>
              <option value="3">3 - Neutral</option>
              <option value="2">2 - Insatisfecho</option>
              <option value="1">1 - Muy insatisfecho</option>
            </select>
            <input name="preferredBudget" type="number" min="0" step="0.01" placeholder="Presupuesto mensual aproximado" className="rounded-xl border p-3 text-black" />
            <select name="playStyle" className="rounded-xl border p-3 text-black">
              <option value="competitivo">Competitivo</option>
              <option value="coleccionista">Coleccionista</option>
              <option value="casual">Casual</option>
              <option value="inversion">Inversión/rareza</option>
            </select>
            <input name="triviaAnswer" placeholder="Trivia: ¿qué formato/evento te interesa más?" className="rounded-xl border p-3 text-black" />
            <textarea name="comments" placeholder="¿Qué productos debería traer la tienda demo para ti?" className="rounded-xl border p-3 text-black" />
            <button type="submit" className="rounded-2xl bg-wiju-gold px-4 py-3 font-black text-black">Guardar investigación</button>
          </div>
        </form>
      </section>
    </main>
  );
}
