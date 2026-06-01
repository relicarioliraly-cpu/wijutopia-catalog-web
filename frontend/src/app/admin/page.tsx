'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiFetch, BusinessInsights, Metric, Product } from '@/lib/api';

type Dashboard = {
  metrics: Metric[];
  totalClicks: number;
  interactionRatio: number;
  threshold: number;
};

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [insights, setInsights] = useState<BusinessInsights | null>(null);
  const [message, setMessage] = useState('');

  const isAdmin = useMemo(() => userEmail === 'admin@wijutopia.com' && Boolean(token), [token, userEmail]);

  useEffect(() => {
    setToken(window.localStorage.getItem('wijutopia_token') || '');
    const storedUser = window.localStorage.getItem('wijutopia_user');
    if (storedUser) {
      setUserEmail(JSON.parse(storedUser).email || '');
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      void loadAdminData();
    }
  }, [isAdmin]);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const loadAdminData = async () => {
    try {
      const productPayload = await apiFetch<{ success: boolean; data: Product[] }>('/api/products');
      const metricsPayload = await apiFetch<{ success: boolean; data: Dashboard }>('/api/metrics/dashboard', { headers: authHeaders });
      const insightsPayload = await apiFetch<{ success: boolean; data: BusinessInsights }>('/api/insights/dashboard', { headers: authHeaders });
      setProducts(productPayload.data);
      setDashboard(metricsPayload.data);
      setInsights(insightsPayload.data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo cargar el panel.');
    }
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const payload = await apiFetch<{ success: boolean; token: string; user: { email: string; role: string } }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') })
      });
      if (payload.user.email !== 'admin@wijutopia.com' || payload.user.role !== 'empleado') {
        setMessage('Acceso denegado: este panel requiere el rol Empleado con admin@wijutopia.com.');
        return;
      }
      window.localStorage.setItem('wijutopia_token', payload.token);
      window.localStorage.setItem('wijutopia_user', JSON.stringify(payload.user));
      setToken(payload.token);
      setUserEmail(payload.user.email);
      setMessage('Acceso administrativo concedido.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Error de autenticación.');
    }
  };

  const handleCreateProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await apiFetch('/api/products', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          name: form.get('name'),
          description: form.get('description'),
          price: Number(form.get('price')),
          stock: Number(form.get('stock')),
          image_url: form.get('image_url') || undefined,
          category: form.get('category') || 'TCG',
          marketplace_tag: form.get('marketplace_tag') || 'Local Wijutopia',
          release_status: form.get('release_status') || 'catalogo',
          preorder_available: form.get('preorder_available') === 'on'
        })
      });
      event.currentTarget.reset();
      setMessage('Producto creado correctamente.');
      await loadAdminData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo crear el producto.');
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await apiFetch(`/api/products/${id}`, { method: 'DELETE', headers: authHeaders });
      setMessage('Producto eliminado correctamente.');
      await loadAdminData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo eliminar el producto.');
    }
  };


  const handleWhatsappInterest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const productId = form.get('productId');
    try {
      await apiFetch(`/api/insights/products/${productId}/whatsapp-interest`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ messageCount: Number(form.get('messageCount') || 1) })
      });
      event.currentTarget.reset();
      setMessage('Mensajes oficiales de WhatsApp agregados al análisis de stock/restock.');
      await loadAdminData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudieron agregar los mensajes de WhatsApp.');
    }
  };

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16">
        <section className="rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-8 shadow-card dark:border-wiju-borderDark dark:bg-wiju-cardDark">
          <h1 className="text-3xl font-black">Ingreso de empleado</h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Solo el correo admin@wijutopia.com con rol Empleado puede administrar inventario y métricas.</p>
          {message && <p className="mt-4 rounded-xl bg-wiju-crimson/10 p-3 text-sm font-semibold text-wiju-crimson dark:text-wiju-gold">{message}</p>}
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <input name="email" type="email" defaultValue="admin@wijutopia.com" className="w-full rounded-xl border p-3 text-black" required />
            <input name="password" type="password" placeholder="Contraseña admin" className="w-full rounded-xl border p-3 text-black" required />
            <button type="submit" className="w-full rounded-2xl bg-wiju-crimson px-4 py-3 font-black text-white dark:bg-wiju-gold dark:text-black">Entrar al panel</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-10">
      <section className="rounded-[2rem] border border-wiju-borderLight bg-wiju-cardLight p-8 shadow-card dark:border-wiju-borderDark dark:bg-wiju-cardDark">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-wiju-crimson dark:text-wiju-gold">Panel administrativo</p>
        <h1 className="mt-3 text-4xl font-black">Inventario y analítica implícita</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">Tasa E_ratio = (clics en carrito + imagen) / total de interacciones. Umbral de referencia: 0.35.</p>
      </section>

      {message && <p className="rounded-2xl border border-wiju-gold/50 p-4 text-sm font-semibold">{message}</p>}

      <section className="grid gap-6 lg:grid-cols-4">
        <div className="rounded-3xl bg-wiju-crimson p-6 text-white dark:bg-wiju-gold dark:text-black">
          <p className="text-sm font-bold">Total de clics</p>
          <p className="mt-2 text-4xl font-black">{dashboard?.totalClicks ?? 0}</p>
        </div>
        <div className="rounded-3xl border border-wiju-borderLight p-6 dark:border-wiju-borderDark">
          <p className="text-sm font-bold">E_ratio</p>
          <p className="mt-2 text-4xl font-black">{dashboard?.interactionRatio ?? 0}</p>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[420px_1fr]">
        <div className="space-y-6">
        <form onSubmit={handleCreateProduct} className="space-y-4 rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-6 shadow-card dark:border-wiju-borderDark dark:bg-wiju-cardDark">
          <h2 className="text-2xl font-black">Crear producto</h2>
          <input name="name" placeholder="Nombre del producto" className="w-full rounded-xl border p-3 text-black" required />
          <textarea name="description" placeholder="Descripción" className="w-full rounded-xl border p-3 text-black" />
          <input name="price" type="number" step="0.01" min="0.01" placeholder="Precio" className="w-full rounded-xl border p-3 text-black" required />
          <input name="stock" type="number" min="0" placeholder="Stock" className="w-full rounded-xl border p-3 text-black" required />
          <input name="image_url" type="url" placeholder="URL de imagen opcional" className="w-full rounded-xl border p-3 text-black" />
          <input name="category" placeholder="Categoría / franquicia" className="w-full rounded-xl border p-3 text-black" />
          <select name="marketplace_tag" className="w-full rounded-xl border p-3 text-black" defaultValue="Local Wijutopia">
            <option value="Local Wijutopia">Local Wijutopia</option>
            <option value="TCGPlayer">TCGPlayer</option>
            <option value="Cardmarket">Cardmarket</option>
            <option value="TradingCardMint">TradingCardMint</option>
          </select>
          <select name="release_status" className="w-full rounded-xl border p-3 text-black" defaultValue="catalogo">
            <option value="catalogo">Catálogo regular</option>
            <option value="lanzamiento">Lanzamiento / preventa</option>
          </select>
          <label className="flex items-center gap-3 text-sm font-bold"><input name="preorder_available" type="checkbox" /> Permitir botón de pedir lanzamiento</label>
          <button type="submit" className="w-full rounded-2xl bg-wiju-crimson px-4 py-3 font-black text-white dark:bg-wiju-gold dark:text-black">Guardar producto</button>
        </form>

        <form onSubmit={handleWhatsappInterest} className="space-y-4 rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-6 shadow-card dark:border-wiju-borderDark dark:bg-wiju-cardDark">
          <h2 className="text-2xl font-black">Comparar WhatsApp oficial</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">Registra cuántos mensajes llegaron al WhatsApp oficial preguntando por stock, restock o lanzamientos. Estos mensajes se suman a vistas/clics para decidir compras por temporada.</p>
          <select name="productId" className="w-full rounded-xl border p-3 text-black" required>
            {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
          </select>
          <input name="messageCount" type="number" min="1" defaultValue="1" className="w-full rounded-xl border p-3 text-black" />
          <button type="submit" className="w-full rounded-2xl bg-wiju-gold px-4 py-3 font-black text-black">Sumar mensajes WhatsApp</button>
        </form>
        </div>

        <div className="space-y-6">
          <section className="overflow-hidden rounded-3xl border border-wiju-borderLight dark:border-wiju-borderDark">
            <table className="w-full text-left text-sm">
              <thead className="bg-wiju-crimson text-white dark:bg-wiju-gold dark:text-black">
                <tr><th className="p-3">Producto</th><th className="p-3">Etiqueta</th><th className="p-3">Estado</th><th className="p-3">Precio</th><th className="p-3">Stock</th><th className="p-3">Acción</th></tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-wiju-borderLight dark:border-wiju-borderDark">
                    <td className="p-3 font-bold">{product.name}</td>
                    <td className="p-3">{product.marketplace_tag || 'Local Wijutopia'}</td>
                    <td className="p-3">{product.stock > 0 ? 'Disponible' : 'Agotado'}{product.release_status === 'lanzamiento' ? ' / Lanzamiento' : ''}</td>
                    <td className="p-3">S/ {Number(product.price).toFixed(2)}</td>
                    <td className="p-3">{product.stock}</td>
                    <td className="p-3"><button type="button" onClick={() => void deleteProduct(product.id)} className="rounded-xl border px-3 py-2 text-xs font-bold">Eliminar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="overflow-hidden rounded-3xl border border-wiju-borderLight dark:border-wiju-borderDark">
            <table className="w-full text-left text-sm">
              <thead className="bg-wiju-cardLight dark:bg-wiju-cardDark"><tr><th className="p-3">Elemento</th><th className="p-3">Descripción</th><th className="p-3">Clics</th></tr></thead>
              <tbody>
                {dashboard?.metrics.map((metric) => (
                  <tr key={metric.element_identifier} className="border-t border-wiju-borderLight dark:border-wiju-borderDark">
                    <td className="p-3 font-mono text-xs">{metric.element_identifier}</td>
                    <td className="p-3">{metric.element_description}</td>
                    <td className="p-3 font-black">{metric.accumulated_clicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </section>

      <section className="space-y-6 rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-6 shadow-card dark:border-wiju-borderDark dark:bg-wiju-cardDark">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-wiju-crimson dark:text-wiju-gold">Informe de tienda e investigación</p>
          <h2 className="mt-2 text-2xl font-black">Restock, lanzamientos y conducta del cliente</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Este reporte consolida vistas, clics, mensajes del WhatsApp oficial, solicitudes de productos agotados, pedidos de próximos lanzamientos, encuestas y trivias. La decisión de stock/restock se revisa por temporada mensual/trimestral antes de comprar inventario.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-wiju-borderLight p-4 dark:border-wiju-borderDark">
            <p className="text-sm font-bold">Solicitudes de restock</p>
            <p className="mt-2 text-3xl font-black">{insights?.restockRequests.length ?? 0}</p>
          </article>
          <article className="rounded-2xl border border-wiju-borderLight p-4 dark:border-wiju-borderDark">
            <p className="text-sm font-bold">Pedidos de lanzamientos</p>
            <p className="mt-2 text-3xl font-black">{insights?.launchRequests.length ?? 0}</p>
          </article>
          <article className="rounded-2xl border border-wiju-borderLight p-4 dark:border-wiju-borderDark">
            <p className="text-sm font-bold">Encuestas/trivias</p>
            <p className="mt-2 text-3xl font-black">{insights?.researchResponses.length ?? 0}</p>
          </article>
        </div>

        <section className="overflow-hidden rounded-2xl border border-wiju-borderLight dark:border-wiju-borderDark">
          <h3 className="p-4 text-lg font-black">Decisión de stock/restock por temporada {insights?.currentSeason}</h3>
          <table className="w-full text-left text-sm">
            <thead><tr><th className="p-3">Producto</th><th className="p-3">Vistas</th><th className="p-3">Clics</th><th className="p-3">WhatsApp</th><th className="p-3">Total/Umbral</th><th className="p-3">Decisión</th></tr></thead>
            <tbody>
              {insights?.productInterest.map((item) => (
                <tr key={`${item.product_id}-${item.season_key}`} className="border-t border-wiju-borderLight dark:border-wiju-borderDark">
                  <td className="p-3 font-bold">{item.product_name}</td>
                  <td className="p-3">{item.product_views}</td>
                  <td className="p-3">{item.product_clicks}</td>
                  <td className="p-3">{item.whatsapp_messages}</td>
                  <td className="p-3">{item.total_interest}/{item.restock_threshold}</td>
                  <td className="p-3">{item.recommendation === 'revisar_compra' ? 'Revisar compra' : 'Esperar más señales'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="overflow-hidden rounded-2xl border border-wiju-borderLight dark:border-wiju-borderDark">
            <h3 className="p-4 text-lg font-black">Resumen por franquicia</h3>
            <table className="w-full text-left text-sm">
              <thead><tr><th className="p-3">Franquicia</th><th className="p-3">Respuestas</th><th className="p-3">Satisfacción</th></tr></thead>
              <tbody>
                {insights?.franchiseSummary.map((item) => (
                  <tr key={item.favorite_franchise} className="border-t border-wiju-borderLight dark:border-wiju-borderDark">
                    <td className="p-3">{item.favorite_franchise}</td><td className="p-3">{item.responses}</td><td className="p-3">{item.avg_satisfaction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="overflow-hidden rounded-2xl border border-wiju-borderLight dark:border-wiju-borderDark">
            <h3 className="p-4 text-lg font-black">Últimos pedidos y restock</h3>
            <div className="max-h-72 space-y-3 overflow-auto p-4 text-sm">
              {insights?.restockRequests.slice(0, 5).map((item) => <p key={`r-${item.id}`}><strong>Restock:</strong> {item.product_name} × {item.requested_quantity}</p>)}
              {insights?.launchRequests.slice(0, 5).map((item) => <p key={`l-${item.id}`}><strong>Lanzamiento:</strong> {item.product_name} ({item.franchise}) × {item.requested_quantity}</p>)}
              {insights?.researchResponses.slice(0, 5).map((item) => <p key={`c-${item.id}`}><strong>Cliente:</strong> {item.favorite_franchise} / {item.play_style} / Satisfacción {item.satisfaction_score}</p>)}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
