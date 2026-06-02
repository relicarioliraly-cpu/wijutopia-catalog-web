'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, BusinessInsights, Metric, Product } from '@/lib/api';

type Dashboard = {
  metrics: Metric[];
  totalClicks: number;
  interactionRatio: number;
  threshold: number;
};

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [insights, setInsights] = useState<BusinessInsights | null>(null);
  const [message, setMessage] = useState('');

  // Verificación estricta de seguridad en el cliente
  const isAdmin = useMemo(
    () => userEmail === 'admin@wijutopia.com' && Boolean(token),
    [token, userEmail]
  );

  useEffect(() => {
    setToken(window.localStorage.getItem('wijutopia_token') || '');
    const storedUser = window.localStorage.getItem('wijutopia_user');
    if (storedUser) {
      setUserEmail(JSON.parse(storedUser).email || '');
    }
  },);

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const loadAdminData = async () => {
    try {
      const productPayload = await apiFetch<{ success: boolean; data: Product[] }>('/api/products');
      const metricsPayload = await apiFetch<{ success: boolean; data: Dashboard }>('/api/metrics/dashboard', { headers: authHeaders });
      const insightsPayload = await apiFetch<{ success: boolean; data: BusinessInsights }>('/api/insights/dashboard', { headers: authHeaders });
      setProducts(productPayload.data);
      setDashboard(metricsPayload.data);
      setInsights(insightsPayload.data);
    } catch (error) {
      setMessage(error instanceof Error? error.message : 'No se pudo cargar el panel administrativo.');
    }
  };

  useEffect(() => {
    if (isAdmin) {
      void loadAdminData();
    }
  }, [isAdmin]);

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
          product_tag: form.get('product_tag') || 'En vitrina',
          release_status: form.get('release_status') || 'catalogo',
          preorder_available: form.get('preorder_available') === 'on'
        })
      });
      event.currentTarget.reset();
      setMessage('Producto catalogado exitosamente.');
      await loadAdminData();
    } catch (error) {
      setMessage(error instanceof Error? error.message : 'Error al registrar el producto.');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto de la base de datos de Wijutopia?')) return;
    try {
      await apiFetch(`/api/products/${id}`, { method: 'DELETE', headers: authHeaders });
      setMessage('Producto removido correctamente.');
      await loadAdminData();
    } catch (error) {
      setMessage(error instanceof Error? error.message : 'Fallo en la eliminación.');
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
      setMessage('Interacciones del WhatsApp oficial de Trujillo incorporadas al análisis.');
      await loadAdminData();
    } catch (error) {
      setMessage(error instanceof Error? error.message : 'Error de registro.');
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem('wijutopia_token');
    window.localStorage.removeItem('wijutopia_user');
    router.push('/profile');
  };

  // Pantalla de error si el usuario no tiene los privilegios de empleado
  if (!isAdmin) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
        <div className="rounded-3xl border border-red-500/30 bg-red-500/5 p-8 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500 text-3xl font-black">
           !
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-red-600 dark:text-red-400">Acceso Restringido</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Esta sección requiere una sesión con la cuenta de empleado autorizada de Wijutopia Trujillo.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/profile')}
            className="w-full rounded-2xl bg-wiju-crimson py-3 font-bold text-white shadow-neon"
          >
            Ir a Iniciar Sesión
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 py-10">
      <section className="flex flex-col md:flex-row md:items-center justify-between rounded-[2rem] border border-wiju-borderLight bg-wiju-cardLight p-8 shadow-card dark:border-wiju-borderDark dark:bg-wiju-cardDark gap-6">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-wiju-crimson dark:text-wiju-gold">Panel Empleado</p>
          <h1 className="mt-3 text-4xl font-black">Control de Inventario y Analítica Implícita</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            La fórmula del índice de comportamiento evalúa la conducta de conversión:
          </p>
          <div className="mt-3 text-xs font-mono bg-black/10 dark:bg-black/40 p-3 rounded-lg inline-block">
            E_ratio = (C_add_to_cart + C_image_zoom) / Σ C_total (Umbral objetivo: 0.35)
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-2xl border-2 border-wiju-crimson px-5 py-3 font-black text-wiju-crimson dark:border-wiju-gold dark:text-wiju-gold hover:bg-opacity-10 transition-all text-sm shrink-0"
        >
          Cerrar Sesión Administrativa
        </button>
      </section>

      {message && (
        <p className="rounded-2xl border border-wiju-gold/50 bg-wiju-gold/5 p-4 text-sm font-semibold text-wiju-crimson dark:text-wiju-gold">
          {message}
        </p>
      )}

      {/* Indicadores Clave de Desempeño */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl bg-wiju-crimson p-6 text-white shadow-neon">
          <p className="text-xs font-black uppercase tracking-wider opacity-80">Total Interacciones Registradas</p>
          <p className="mt-2 text-5xl font-black">{dashboard?.totalClicks?? 0}</p>
        </div>
        <div className="rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-6 dark:border-wiju-borderDark dark:bg-wiju-cardDark">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">Coeficiente Táctil (E_ratio)</p>
          <p className="mt-2 text-5xl font-black text-wiju-crimson dark:text-wiju-gold">
            {dashboard?.interactionRatio?? 0}
          </p>
        </div>
        <div className="rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-6 dark:border-wiju-borderDark dark:bg-wiju-cardDark">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">Total Solicitudes Activas</p>
          <p className="mt-2 text-5xl font-black">
            {(insights?.restockRequests.length?? 0) + (insights?.launchRequests.length?? 0)}
          </p>
        </div>
      </section>

      {/* Formularios de Control */}
      <section className="grid gap-8 lg:grid-cols-[450px_1fr]">
        <div className="space-y-6">
          <form onSubmit={handleCreateProduct} className="space-y-4 rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-8 shadow-card dark:border-wiju-borderDark dark:bg-wiju-cardDark">
            <h2 className="text-2xl font-black">Ingresar Producto</h2>
            <div className="grid gap-3">
              <input name="name" placeholder="Nombre de la Carta o Item TCG" className="rounded-xl border border-slate-300 dark:border-slate-700 p-3.5 text-black focus:outline-none focus:ring-2 focus:ring-wiju-crimson" required />
              <textarea name="description" placeholder="Descripción detallada" className="rounded-xl border border-slate-300 dark:border-slate-700 p-3.5 text-black focus:outline-none focus:ring-2 focus:ring-wiju-crimson" />
              <div className="grid grid-cols-2 gap-3">
                <input name="price" type="number" step="0.01" min="0.01" placeholder="S/ Precio" className="rounded-xl border border-slate-300 dark:border-slate-700 p-3.5 text-black focus:outline-none focus:ring-2 focus:ring-wiju-crimson" required />
                <input name="stock" type="number" min="0" placeholder="Unidades" className="rounded-xl border border-slate-300 dark:border-slate-700 p-3.5 text-black focus:outline-none focus:ring-2 focus:ring-wiju-crimson" required />
              </div>
              <input name="image_url" type="url" placeholder="URL Imagen (Opcional si autogenera)" className="rounded-xl border border-slate-300 dark:border-slate-700 p-3.5 text-black focus:outline-none focus:ring-2 focus:ring-wiju-crimson" />
              <input name="category" placeholder="Categoría (Ej. Pokémon, One Piece)" className="rounded-xl border border-slate-300 dark:border-slate-700 p-3.5 text-black focus:outline-none focus:ring-2 focus:ring-wiju-crimson" />
              <select name="product_tag" className="rounded-xl border border-slate-300 dark:border-slate-700 p-3.5 text-black focus:outline-none focus:ring-2 focus:ring-wiju-crimson" defaultValue="En vitrina">
                <option value="En vitrina">En vitrina</option>
                <option value="Pedido por encargo">Pedido por encargo</option>
                <option value="Restock prioritario">Restock prioritario</option>
                <option value="Preventa Wijutopia">Preventa Wijutopia</option>
                <option value="Torneo/Liga">Torneo/Liga</option>
                <option value="Accesorio TCG">Accesorio TCG</option>
              </select>
              <select name="release_status" className="rounded-xl border border-slate-300 dark:border-slate-700 p-3.5 text-black focus:outline-none focus:ring-2 focus:ring-wiju-crimson" defaultValue="catalogo">
                <option value="catalogo">Catálogo Regular</option>
                <option value="lanzamiento">Lanzamiento / Preventa</option>
              </select>
              <label className="flex items-center gap-3 text-sm font-bold mt-2">
                <input name="preorder_available" type="checkbox" className="h-4 w-4 rounded text-wiju-crimson" />
                Habilitar reservas
              </label>
            </div>
            <button type="submit" className="w-full rounded-2xl bg-wiju-crimson py-4 font-black text-white hover:bg-opacity-90 dark:bg-wiju-gold dark:text-black">
              Registrar producto
            </button>
          </form>

          <form onSubmit={handleWhatsappInterest} className="space-y-4 rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-8 shadow-card dark:border-wiju-borderDark dark:bg-wiju-cardDark">
            <h2 className="text-2xl font-black">Monitoreo de WhatsApp</h2>
            <p className="text-sm text-slate-500">
              Registra la cantidad de mensajes directos que llegan a la línea de Trujillo de forma manual para complementar el análisis estadístico de demanda local .
            </p>
            <div className="grid gap-3">
              <select name="productId" className="rounded-xl border border-slate-300 dark:border-slate-700 p-3.5 text-black" required>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              <input name="messageCount" type="number" min="1" defaultValue="1" className="rounded-xl border border-slate-300 dark:border-slate-700 p-3.5 text-black" />
            </div>
            <button type="submit" className="w-full rounded-2xl bg-wiju-gold py-4 font-black text-black hover:bg-opacity-90">
              Sincronizar Interés
            </button>
          </form>
        </div>

        {/* Tablas de Productos y Métricas */}
        <div className="space-y-8">
          <section className="overflow-hidden rounded-3xl border border-wiju-borderLight dark:border-wiju-borderDark bg-wiju-cardLight dark:bg-wiju-cardDark">
            <h2 className="p-5 text-lg font-black bg-wiju-crimson text-white dark:bg-wiju-gold dark:text-black">
              Inventario de Tienda en Trujillo
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                    <th className="p-4">Producto</th>
                    <th className="p-4">Etiqueta</th>
                    <th className="p-4">Precio</th>
                    <th className="p-4 text-center">Existencias</th>
                    <th className="p-4 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                      <td className="p-4 font-bold">{product.name}</td>
                      <td className="p-4 text-xs">{product.product_tag || 'Sin Etiqueta'}</td>
                      <td className="p-4 font-semibold text-wiju-crimson dark:text-wiju-gold">
                        S/ {Number(product.price).toFixed(2)}
                      </td>
                      <td className="p-4 text-center">{product.stock}</td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => void deleteProduct(product.id)}
                          className="rounded-xl border border-red-500/20 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500 hover:text-white transition-all"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-wiju-borderLight dark:border-wiju-borderDark bg-wiju-cardLight dark:bg-wiju-cardDark">
            <h2 className="p-5 text-lg font-black">Interacciones del Menú y Clics Implícitos</h2>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-black/40 text-slate-400">
                <tr>
                  <th className="p-4">Identificador</th>
                  <th className="p-4">Descripción en Código</th>
                  <th className="p-4 text-center">Conteo Acumulado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {dashboard?.metrics.map((metric) => (
                  <tr key={metric.element_identifier}>
                    <td className="p-4 font-mono text-xs text-wiju-crimson dark:text-wiju-gold">
                      {metric.element_identifier}
                    </td>
                    <td className="p-4">{metric.element_description}</td>
                    <td className="p-4 text-center font-black">{metric.accumulated_clicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </section>

      {/* Reporte Consolidado de Intereses */}
      <section className="rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-8 shadow-card dark:border-wiju-borderDark dark:bg-wiju-cardDark space-y-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-wiju-crimson dark:text-wiju-gold">Análisis de Conducta y Mercado</p>
          <h2 className="text-3xl font-black">Planificación Trimestral de Stock y Eventos</h2>
          <p className="text-sm text-slate-500">
            Con base en las trivias y clics recopilados, este módulo estima qué artículos de Pokémon, Digimon y One Piece deben recibir compras de restock automatizadas.[1, 2]
          </p>
        </div>

        <section className="overflow-hidden rounded-2xl border border-wiju-borderLight dark:border-wiju-borderDark">
          <h3 className="p-4 text-md font-bold bg-slate-50 dark:bg-black/30">Límite de la Temporada Activa: {insights?.currentSeason}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                  <th className="p-4">Producto Evaluado</th>
                  <th className="p-4 text-center">Vistas</th>
                  <th className="p-4 text-center">Clics</th>
                  <th className="p-4 text-center">WhatsApp</th>
                  <th className="p-4 text-center">Demanda ($total\_interest$)</th>
                  <th className="p-4 text-center">Inversión Recomendada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {insights?.productInterest.map((item) => (
                  <tr key={`${item.product_id}-${item.season_key}`}>
                    <td className="p-4 font-bold">{item.product_name}</td>
                    <td className="p-4 text-center">{item.product_views}</td>
                    <td className="p-4 text-center">{item.product_clicks}</td>
                    <td className="p-4 text-center">{item.whatsapp_messages}</td>
                    <td className="p-4 text-center font-bold">
                      {item.total_interest} / {item.restock_threshold}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-black ${
                        item.recommendation === 'revisar_compra'
                         ? 'bg-green-500/10 text-green-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {item.recommendation === 'revisar_compra'? 'Revisar Compra' : 'Esperar Métricas'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}