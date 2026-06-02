'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { apiFetch, Product } from '@/lib/api';
import { useTracker } from '@/hooks/useTracker';

type CartItem = Product & { quantity: number };
type ActiveRestock = { id: string; customerEmail: string; status: string };

export default function ClientPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeRestocks, setActiveRestocks] = useState<Record<string, ActiveRestock>>({});
  const [query, setQuery] = useState('');
  const [availability, setAvailability] = useState<'all' | 'available' | 'soldout'>('all');
  const [productTagFilter, setProductTagFilter] = useState('all');
  const [releaseStatus, setReleaseStatus] = useState<'all' | 'catalogo' | 'lanzamiento'>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'priceAsc' | 'priceDesc'>('newest');
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


  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    const numericQuery = Number(normalizedQuery);
    const hasPriceFilter = minPrice !== '' || maxPrice !== '';
    return products
      .filter((product) => {
        const availabilityText = product.stock > 0 ? 'disponible' : 'agotado restock';
        const haystack = `${product.name} ${product.description || ''} ${product.category || ''} ${product.product_tag || ''} ${product.release_status || ''} ${availabilityText}`.toLowerCase();
        const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery) ||
          (!Number.isNaN(numericQuery) && (Number(product.price) === numericQuery || product.stock === numericQuery));

        const matchesAvailability = availability === 'all'
          || (availability === 'available' && product.stock > 0)
          || (availability === 'soldout' && product.stock === 0);

        const matchesProductTag = productTagFilter === 'all' || product.product_tag === productTagFilter;
        const matchesReleaseStatus = releaseStatus === 'all' || product.release_status === releaseStatus;

        const priceValue = Number(product.price || 0);
        const matchesPrice = (!hasPriceFilter)
          || (minPrice === '' || priceValue >= Number(minPrice))
          || (maxPrice === '' || priceValue <= Number(maxPrice));

        return matchesQuery && matchesAvailability && matchesProductTag && matchesReleaseStatus && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'priceAsc') return a.price - b.price;
        if (sortBy === 'priceDesc') return b.price - a.price;
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      });
  }, [products, query, availability, productTagFilter, releaseStatus, minPrice, maxPrice, sortBy]);

  const cartTotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  const addToCart = (product: Product) => {
    setCart((current) => {
      const curr = current || [];
      const existing = curr.find((item) => item.id === product.id);
      if (existing) {
        return curr.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...curr, { ...product, quantity: 1 }];
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
      const payload = await apiFetch<{ success: boolean; message: string; data: { id: string; status: string; seasonKey: string; seasonEndsAt: string; totalInterest: number; threshold: number } }>(`/api/insights/products/${product.id}/restock`, {
        method: 'POST',
        body: JSON.stringify({ customerEmail, requestedQuantity: 1 })
      });
      setActiveRestocks((current) => ({...current, [product.id]: { id: payload.data.id, customerEmail, status: payload.data.status } }));
      setMessage(`${payload.message} Corte de temporada: ${payload.data.seasonEndsAt}. Interés actual: ${payload.data.totalInterest}/${payload.data.threshold}.`);
    } catch (error) {
      const apiError = error instanceof Error? error.message : 'No se pudo solicitar stock/restock.';
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
        const next = {...current };
        delete next[product.id];
        return next;
      });
      setMessage(`Solicitud de stock/restock cancelada para ${product.name}.`);
    } catch (error) {
      setMessage(error instanceof Error? error.message : 'No se pudo cancelar la solicitud.');
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
      setMessage(error instanceof Error? error.message : 'No se pudo registrar el pedido.');
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
      setMessage(error instanceof Error? error.message : 'No se pudo enviar el pedido de lanzamiento.');
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
      setMessage(error instanceof Error? error.message : 'No se pudo guardar la encuesta.');
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
          <div className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => void trackClick('enlace_navbar_catalogo')}
            placeholder="Buscar por carta, set, rareza, categoría, producto o precio..."
            className="focus-ring w-full rounded-2xl border border-wiju-borderLight bg-white px-5 py-4 text-slate-900 placeholder:text-slate-500 transition dark:border-wiju-borderDark dark:bg-slate-950 dark:text-white"
          />
          <p className="rounded-2xl bg-wiju-signMagenta px-5 py-4 text-center font-black text-white shadow-neon dark:bg-wiju-moonGold dark:text-wiju-ink">{filteredProducts.length} resultados</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr]">
          <select value={availability} onChange={(event) => setAvailability(event.target.value as any)} className="rounded-2xl border border-wiju-borderLight bg-white px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-wiju-crimson dark:border-wiju-borderDark dark:bg-slate-950 dark:text-white">
            <option value="all">Todos los estados</option>
            <option value="available">Solo disponibles</option>
            <option value="soldout">Solo agotados</option>
          </select>
          <select value={productTagFilter} onChange={(event) => setProductTagFilter(event.target.value)} className="rounded-2xl border border-wiju-borderLight bg-white px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-wiju-crimson dark:border-wiju-borderDark dark:bg-slate-950 dark:text-white">
            <option value="all">Todas las etiquetas</option>
            <option value="En vitrina">En vitrina</option>
            <option value="Pedido por encargo">Pedido por encargo</option>
            <option value="Restock prioritario">Restock prioritario</option>
            <option value="Preventa Wijutopia">Preventa Wijutopia</option>
            <option value="Torneo/Liga">Torneo/Liga</option>
            <option value="Accesorio TCG">Accesorio TCG</option>
          </select>
          <select value={releaseStatus} onChange={(event) => setReleaseStatus(event.target.value as any)} className="rounded-2xl border border-wiju-borderLight bg-white px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-wiju-crimson dark:border-wiju-borderDark dark:bg-slate-950 dark:text-white">
            <option value="all">Todas las ramas</option>
            <option value="catalogo">Catálogo</option>
            <option value="lanzamiento">Lanzamiento</option>
          </select>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as any)} className="rounded-2xl border border-wiju-borderLight bg-white px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-wiju-crimson dark:border-wiju-borderDark dark:bg-slate-950 dark:text-white">
            <option value="newest">Más recientes</option>
            <option value="priceAsc">Precio ascendente</option>
            <option value="priceDesc">Precio descendente</option>
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <input
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="Precio mínimo"
            className="rounded-2xl border border-wiju-borderLight bg-white px-5 py-4 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-wiju-crimson dark:border-wiju-borderDark dark:bg-slate-950 dark:text-white"
          />
          <input
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="Precio máximo"
            className="rounded-2xl border border-wiju-borderLight bg-white px-5 py-4 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-wiju-crimson dark:border-wiju-borderDark dark:bg-slate-950 dark:text-white"
          />
          <button type="button" onClick={() => { setMinPrice(''); setMaxPrice(''); setAvailability('all'); setProductTagFilter('all'); setReleaseStatus('all'); setSortBy('newest'); }} className="rounded-2xl border border-wiju-borderLight bg-transparent px-5 py-4 text-slate-900 transition hover:bg-wiju-signMagenta/10 dark:border-wiju-borderDark dark:text-white">Limpiar filtros</button>
        </div>
      </div>

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
        </aside>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <form onSubmit={handleLaunchRequest} className="rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-8 shadow-card dark:border-wiju-borderDark dark:bg-wiju-cardDark space-y-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-wiju-signMagenta dark:text-wiju-moonGold">Lanzamientos</p>
            <h2 className="mt-2 text-3xl font-black">Pedir próximo lanzamiento</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Solicita productos que todavía no aparecen en catálogo para que el panel administrativo los evalúe por temporada.</p>
          </div>
          <div className="grid gap-4">
            <input name="productName" placeholder="Nombre del producto esperado" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-wiju-crimson dark:border-slate-700 dark:bg-slate-950 dark:text-white" required />
            <input name="franchise" placeholder="Franquicia: Pokémon, One Piece, Digimon..." className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-wiju-crimson dark:border-slate-700 dark:bg-slate-950 dark:text-white" required />
            <input name="customerEmail" type="email" placeholder="Correo opcional" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-wiju-crimson dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            <input name="requestedQuantity" type="number" min="1" defaultValue="1" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-wiju-crimson dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            <textarea name="notes" placeholder="Notas: idioma, rareza, fecha de salida, presupuesto..." className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-wiju-crimson min-h-[110px] dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            <button type="submit" className="w-full rounded-2xl bg-wiju-signMagenta px-5 py-4 font-black text-white shadow-neon hover:bg-opacity-90 transition-all dark:bg-wiju-moonGold dark:text-wiju-ink">Enviar pedido</button>
          </div>
        </form>

        <section className="rounded-3xl border border-wiju-moonGold/50 bg-white p-8 shadow-neon dark:bg-wiju-doorPurple/60">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-wiju-signMagenta dark:text-wiju-moonGold">Sugerencias de catálogo</p>
          <h2 className="mt-2 text-3xl font-black">Danos señales para mejorar la selección</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-200">Registra preferencias, presupuesto y formatos que te interesan. Estos datos alimentan la base del catálogo y ayudan al motor interno a priorizar productos sin llamarlo encuesta.</p>

          <form onSubmit={handleResearchSubmit} className="mt-8 space-y-8">
            <div className="grid gap-6 xl:grid-cols-3">
              <fieldset className="rounded-3xl border border-wiju-logoWine/20 bg-wiju-logoWine/5 p-6 dark:border-white/15 dark:bg-black/20 space-y-4">
                <legend className="rounded-full bg-wiju-logoWine px-4 py-1.5 text-xs font-black text-white">Preferencias</legend>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Géneros y presupuesto</p>
                <div className="grid gap-3">
                  <input name="customerEmail" type="email" placeholder="Correo opcional" className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-wiju-crimson dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                  <input name="favoriteFranchise" placeholder="Franquicia preferida" className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-wiju-crimson dark:border-slate-700 dark:bg-slate-950 dark:text-white" required />
                  <input name="preferredBudget" type="number" min="0" step="0.01" placeholder="Presupuesto aproximado" className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-wiju-crimson dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                  <select name="playStyle" className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-wiju-crimson dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                    <option value="competitivo">Competitivo</option>
                    <option value="coleccionista">Coleccionista</option>
                    <option value="casual">Casual</option>
                    <option value="inversion">Inversión/rareza</option>
                  </select>
                </div>
              </fieldset>

              <fieldset className="rounded-3xl border border-wiju-logoWine/20 bg-wiju-logoWine/5 p-6 dark:border-white/15 dark:bg-black/20 space-y-4">
                <legend className="rounded-full bg-wiju-moonGold px-4 py-1.5 text-xs font-black text-wiju-ink">Formatos</legend>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Interés por lanzamientos y packs</p>
                <div className="grid gap-3">
                  <input name="triviaAnswer" placeholder="¿Qué tipo de producto buscas?" className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-wiju-crimson dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                  <textarea name="comments" placeholder="Describe qué debes encontrar aquí" className="w-full min-h-[120px] rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-wiju-crimson dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                </div>
              </fieldset>

              <fieldset className="rounded-3xl border border-wiju-logoWine/20 bg-wiju-logoWine/5 p-6 dark:border-white/15 dark:bg-black/20 space-y-4">
                <legend className="rounded-full bg-wiju-logoWine px-4 py-1.5 text-xs font-black text-white">Experiencia</legend>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Cómo usar el catálogo</p>
                <div className="grid gap-3">
                  <select name="satisfactionScore" className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-wiju-crimson dark:border-slate-700 dark:bg-slate-950 dark:text-white" required>
                    <option value="5">5 - Muy útil</option>
                    <option value="4">4 - Útil</option>
                    <option value="3">3 - Regular</option>
                    <option value="2">2 - Confuso</option>
                    <option value="1">1 - No ayudó</option>
                  </select>
                  <p className="rounded-2xl bg-wiju-moonGold/15 p-4 text-xs font-medium text-slate-700 dark:text-slate-100 leading-relaxed">Tus señales se guardan como datos de catalogación y prioridad.</p>
                </div>
              </fieldset>
            </div>

            <button type="submit" className="w-full rounded-2xl bg-wiju-moonGold px-5 py-4 font-black text-wiju-ink shadow-neon hover:bg-opacity-90 transition-all">Enviar sugerencia</button>
          </form>
        </section>
      </section>
    </main>
  );
}