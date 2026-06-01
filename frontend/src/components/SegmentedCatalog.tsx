'use client';

import { useEffect, useMemo, useState } from 'react';
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

const normalized = (value?: string | null) => String(value || '').toLowerCase();

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
    { label: 'Nivel 1', value: 'Juego / franquicia' },
    { label: 'Nivel 2', value: branchLabel || 'Singles · Sellado · Accesorios · Lanzamientos · Restock' },
    { label: 'Nivel 3', value: 'Etiqueta tienda · disponibilidad · señales · WhatsApp' }
  ];

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-10">
      <section className={`rounded-[2rem] bg-gradient-to-br ${heroGradient} p-8 text-white shadow-card`}>
        {marker && <p className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-black uppercase tracking-[0.25em] text-wiju-gold">Marcador {marker}</p>}
        <h1 className="mt-4 text-4xl font-black md:text-6xl">{title}</h1>
        <p className="mt-4 max-w-4xl text-white/85">{subtitle}</p>
      </section>

      {message && <p className="rounded-2xl border border-wiju-gold/50 p-4 text-sm font-semibold">{message}</p>}

      <section className="grid gap-4 md:grid-cols-3">
        {hierarchy.map((item) => (
          <article key={item.label} className="rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-5 dark:border-wiju-borderDark dark:bg-wiju-cardDark">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-wiju-crimson dark:text-wiju-gold">{item.label}</p>
            <h2 className="mt-2 text-lg font-black">{item.value}</h2>
          </article>
        ))}
      </section>

      <section className="grid gap-4 rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-5 dark:border-wiju-borderDark dark:bg-wiju-cardDark md:grid-cols-[1fr_auto]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por carta, set, rareza, producto sellado, disponibilidad..."
          className="rounded-2xl border border-wiju-borderLight bg-white px-5 py-3 text-black dark:border-wiju-borderDark"
        />
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
