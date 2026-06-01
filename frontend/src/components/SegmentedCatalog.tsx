'use client';

import { useEffect, useMemo, useState } from 'react';
import { CardsIcon, ChartIcon, SearchIcon, TagIcon } from '@/components/Icons';
import ProductCard from '@/components/ProductCard';
import { apiFetch, Product } from '@/lib/api';

type SegmentedCatalogProps = {
  title: string;
  subtitle: string;
  marker?: string;
  gameSlug?: string;
  categoryMatch?: string[];
  storeTagLabel?: string;
  branchLabel?: string;
  heroGradient?: string;
};


export default function SegmentedCatalog({
  title,
  subtitle,
  marker,
  categoryMatch = [],
  storeTagLabel,
  branchLabel,
  heroGradient = 'from-wiju-crimson to-black'
}: SegmentedCatalogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    apiFetch<{ success: boolean; data: Product[] }>('/api/products')
      .then((payload) => setProducts(payload.data))
      .catch((error) => setMessage(error.message));
  }, []);

  // Filtrado local para que una misma pantalla pueda funcionar como página de juego,
  // página de etiqueta de tienda o rama transversal sin duplicar componentes.
  const filteredProducts = useMemo(() => {
    const terms = categoryMatch.map((item) => item.toLowerCase());
    const q = query.toLowerCase();
    return products.filter((product) => {
      const availability = product.stock > 0 ? 'disponible' : 'agotado restock';
      const haystack = `${product.name} ${product.description || ''} ${product.category || ''} ${product.product_tag || ''} ${product.release_status || ''} ${availability}`.toLowerCase();
      const matchesGame = terms.length === 0 || terms.some((term) => haystack.includes(term));
      const matchesStoreTag = !storeTagLabel || product.product_tag === storeTagLabel;
      const matchesBranch = !branchLabel || haystack.includes(branchLabel.toLowerCase()) || branchLabel === 'Todos';
      const matchesQuery = !q || haystack.includes(q);
      return matchesGame && matchesStoreTag && matchesBranch && matchesQuery;
    });
  }, [branchLabel, categoryMatch, storeTagLabel, products, query]);

  // El seguimiento alimenta la lógica de restock por temporada del backend.
  const trackProductInterest = async (product: Product, eventType: 'view' | 'click') => {
    try {
      await apiFetch(`/api/insights/products/${product.id}/interest`, {
        method: 'POST',
        body: JSON.stringify({ eventType })
      });
    } catch (error) {
      console.warn('No se pudo registrar el interés del segmento.', error);
    }
  };

  const hierarchy = [
    { label: 'Juego', value: 'Franquicia TCG', icon: CardsIcon },
    { label: 'Rama', value: branchLabel || 'Singles · Sellado · Restock', icon: TagIcon },
    { label: 'Señales', value: 'Disponibilidad · WhatsApp', icon: ChartIcon }
  ];

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-10">
      <section className={`rounded-[2rem] bg-gradient-to-br ${heroGradient} p-8 text-white shadow-card`}>
        {marker && <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-black uppercase tracking-[0.25em] text-wiju-gold"><TagIcon className="h-4 w-4" /> {marker}</p>}
        <h1 className="mt-4 text-4xl font-black md:text-6xl">{title}</h1>
        <p className="mt-4 max-w-4xl text-white/85">{subtitle}</p>
      </section>

      {message && <p className="rounded-2xl border border-wiju-gold/50 p-4 text-sm font-semibold">{message}</p>}

      <section className="grid gap-4 md:grid-cols-3">
        {hierarchy.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="flex items-center gap-4 rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-5 dark:border-wiju-borderDark dark:bg-wiju-cardDark">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-wiju-crimson/10 text-wiju-crimson dark:bg-wiju-gold/10 dark:text-wiju-gold"><Icon /></span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                <h2 className="mt-1 text-base font-black">{item.value}</h2>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-5 dark:border-wiju-borderDark dark:bg-wiju-cardDark md:grid-cols-[1fr_auto]">
        <label className="flex items-center gap-3 rounded-2xl border border-wiju-borderLight bg-white px-5 py-3 text-black dark:border-wiju-borderDark">
          <SearchIcon className="text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por carta, set, rareza, disponibilidad..."
            className="w-full bg-transparent outline-none"
          />
        </label>
        <p className="rounded-2xl bg-wiju-crimson px-5 py-3 text-center font-black text-white dark:bg-wiju-gold dark:text-black">{filteredProducts.length} resultados</p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {filteredProducts.map((product) => <ProductCard key={product.id} product={product} onInterestEvent={trackProductInterest} />)}
      </section>

      {filteredProducts.length === 0 && (
        <section className="rounded-3xl border border-dashed border-wiju-borderLight p-8 text-center dark:border-wiju-borderDark">
          <h2 className="text-2xl font-black">Sin productos cargados para este segmento</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">La rama existe para organizar el sitio; el admin puede cargar productos con categoría/etiqueta correspondiente.</p>
        </section>
      )}
    </main>
  );
}
