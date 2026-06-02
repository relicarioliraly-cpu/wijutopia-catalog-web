'use client';

import { useEffect, useMemo, useState } from 'react';
import { CardsIcon, ChartIcon, SearchIcon, TagIcon } from '@/components/Icons';
import ProductCard from '@/components/ProductCard';
import { apiFetch, Product } from '@/lib/api';
import { storeTagCatalog } from '@/lib/catalogTaxonomy';

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
  heroGradient = 'from-wiju-signMagenta to-black'
}: SegmentedCatalogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');
  const [availability, setAvailability] = useState<'all' | 'available' | 'soldout'>('all');
  const [productTagFilter, setProductTagFilter] = useState('all');
  const [releaseStatus, setReleaseStatus] = useState<'all' | 'catalogo' | 'lanzamiento'>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'priceAsc' | 'priceDesc'>('newest');

  useEffect(() => {
    apiFetch<{ success: boolean; data: Product[] }>('/api/products')
      .then((payload) => setProducts(payload.data))
      .catch((error) => setMessage(error.message));
  }, []);

  // Filtrado local para que una misma pantalla pueda funcionar como página de juego,
  // página de etiqueta de tienda o rama transversal sin duplicar componentes.
  const filteredProducts = useMemo(() => {
    const terms = categoryMatch.map((item) => item.toLowerCase());
    const q = query.toLowerCase().trim();
    const numericQuery = Number(q);
    const priceFilterActive = minPrice !== '' || maxPrice !== '';

    return products
      .filter((product) => {
        const availabilityText = product.stock > 0 ? 'disponible' : 'agotado restock';
        const haystack = `${product.name} ${product.description || ''} ${product.category || ''} ${product.product_tag || ''} ${product.release_status || ''} ${availabilityText}`.toLowerCase();
        const matchesQuery = !q || haystack.includes(q) ||
          (!Number.isNaN(numericQuery) && (Number(product.price) === numericQuery || product.stock === numericQuery));

        const matchesGame = terms.length === 0 || terms.some((term) => haystack.includes(term));
        const matchesStoreTag = !storeTagLabel || product.product_tag === storeTagLabel;
        const matchesBranch = !branchLabel || haystack.includes(branchLabel.toLowerCase()) || branchLabel === 'Todos';
        const matchesAvailability = availability === 'all' ||
          (availability === 'available' && product.stock > 0) ||
          (availability === 'soldout' && product.stock === 0);
        const matchesProductTag = productTagFilter === 'all' || product.product_tag === productTagFilter;
        const matchesReleaseStatus = releaseStatus === 'all' || product.release_status === releaseStatus;

        const priceValue = Number(product.price || 0);
        const matchesPrice = !priceFilterActive ||
          ((minPrice === '' || priceValue >= Number(minPrice)) &&
          (maxPrice === '' || priceValue <= Number(maxPrice)));

        return matchesQuery && matchesGame && matchesStoreTag && matchesBranch && matchesAvailability && matchesProductTag && matchesReleaseStatus && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'priceAsc') return a.price - b.price;
        if (sortBy === 'priceDesc') return b.price - a.price;
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      });
  }, [availability, branchLabel, categoryMatch, maxPrice, minPrice, productTagFilter, products, query, releaseStatus, sortBy, storeTagLabel]);

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
        {marker && <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-black uppercase tracking-[0.25em] text-wiju-moonGold"><TagIcon className="h-4 w-4" /> {marker}</p>}
        <h1 className="mt-4 text-4xl font-black md:text-6xl">{title}</h1>
        <p className="mt-4 max-w-4xl text-white/85">{subtitle}</p>
      </section>

      {message && <p className="rounded-2xl border border-wiju-moonGold/50 p-4 text-sm font-semibold">{message}</p>}

      <section className="grid gap-4 md:grid-cols-3">
        {hierarchy.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="flex items-center gap-4 rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-5 wiju-hover-lift dark:border-wiju-borderDark dark:bg-wiju-doorPurple/50">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-wiju-signMagenta/10 text-wiju-signMagenta dark:bg-wiju-moonGold/10 dark:text-wiju-moonGold"><Icon /></span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                <h2 className="mt-1 text-base font-black">{item.value}</h2>
              </div>
            </article>
          );
        })}
      </section>

      <section className="space-y-4 rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-5 wiju-hover-lift dark:border-wiju-borderDark dark:bg-wiju-doorPurple/50">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <label className="flex items-center gap-3 rounded-2xl border border-wiju-borderLight bg-white px-5 py-3 text-wiju-ink dark:border-wiju-borderDark">
            <SearchIcon className="text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por carta, set, rareza, categoría, etiqueta..."
              className="w-full bg-transparent outline-none"
            />
          </label>
          <p className="rounded-2xl bg-wiju-signMagenta px-5 py-3 text-center font-black text-white shadow-neon dark:bg-wiju-moonGold dark:text-wiju-ink">{filteredProducts.length} resultados</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <select value={availability} onChange={(event) => setAvailability(event.target.value as any)} className="rounded-2xl border border-wiju-borderLight bg-white px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-wiju-crimson dark:border-wiju-borderDark dark:bg-slate-950 dark:text-white">
            <option value="all">Todos los estados</option>
            <option value="available">Disponibles</option>
            <option value="soldout">Agotados</option>
          </select>
          <select value={productTagFilter} onChange={(event) => setProductTagFilter(event.target.value)} className="rounded-2xl border border-wiju-borderLight bg-white px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-wiju-crimson dark:border-wiju-borderDark dark:bg-slate-950 dark:text-white">
            <option value="all">Todas las etiquetas</option>
            {storeTagCatalog.map((tag) => <option key={tag.slug} value={tag.label}>{tag.label}</option>)}
          </select>
          <select value={releaseStatus} onChange={(event) => setReleaseStatus(event.target.value as any)} className="rounded-2xl border border-wiju-borderLight bg-white px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-wiju-crimson dark:border-wiju-borderDark dark:bg-slate-950 dark:text-white">
            <option value="all">Todas las ramas</option>
            <option value="catalogo">Catálogo</option>
            <option value="lanzamiento">Lanzamientos</option>
          </select>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as any)} className="rounded-2xl border border-wiju-borderLight bg-white px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-wiju-crimson dark:border-wiju-borderDark dark:bg-slate-950 dark:text-white">
            <option value="newest">Más recientes</option>
            <option value="priceAsc">Precio ascendente</option>
            <option value="priceDesc">Precio descendente</option>
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <input
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="Mínimo S/"
            className="rounded-2xl border border-wiju-borderLight bg-white px-5 py-4 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-wiju-crimson dark:border-wiju-borderDark dark:bg-slate-950 dark:text-white"
          />
          <input
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="Máximo S/"
            className="rounded-2xl border border-wiju-borderLight bg-white px-5 py-4 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-wiju-crimson dark:border-wiju-borderDark dark:bg-slate-950 dark:text-white"
          />
          <button type="button" onClick={() => { setMinPrice(''); setMaxPrice(''); setAvailability('all'); setProductTagFilter('all'); setReleaseStatus('all'); setSortBy('newest'); }} className="rounded-2xl border border-wiju-borderLight bg-transparent px-5 py-4 text-slate-900 transition hover:bg-wiju-signMagenta/10 dark:border-wiju-borderDark dark:text-white">Limpiar filtros</button>
        </div>
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
