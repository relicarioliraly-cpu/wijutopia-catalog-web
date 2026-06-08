'use client';

import { useEffect, useState, useCallback } from 'react';
import ProductCard from '@/components/ProductCard';
import {
  getAllCards,
  getAvailableGames,
  getAvailableRarities,
  Card,
  CatalogFilter,
  isMockMode,
  getBackendUrl,
} from '@/lib/apiService';

export default function CatalogPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionToken] = useState(() => `session_${Date.now()}_${Math.random().toString(36).slice(2)}`);

  // Filtros
  const [filters, setFilters] = useState<CatalogFilter>({});
  const [availableGames, setAvailableGames] = useState<string[]>([]);
  const [availableRarities, setAvailableRarities] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar catálogo y filtros disponibles
  useEffect(() => {
    const loadCatalog = async () => {
      setLoading(true);
      try {
        const [cardsData, games, rarities] = await Promise.all([
          getAllCards(filters),
          getAvailableGames(),
          getAvailableRarities(),
        ]);

        setCards(cardsData);
        setAvailableGames(games);
        setAvailableRarities(rarities);
        setError(null);
      } catch (err) {
        console.error('Error loading catalog:', err);
        setError('No se pudo cargar el catálogo. Intenta de nuevo más tarde.');
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    loadCatalog();
  }, [filters]);

  // Manejar búsqueda
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setFilters(prev => ({
      ...prev,
      search: query.trim() || undefined,
    }));
  }, []);

  // Manejar filtros
  const handleFilterChange = useCallback((key: keyof CatalogFilter, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Manejar click en preventa
  const handlePreorderClick = (whatsappUrl: string) => {
    window.open(whatsappUrl, '_blank');
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-8 px-4 py-10 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white">
              📚 Catálogo de Cartas TCG
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {isMockMode() ? '🔌 Modo MOCK (Backend no conectado)' : `✅ Conectado a ${getBackendUrl()}`}
            </p>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            🔍 Filtrar Catálogo
          </h2>

          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
              Buscar por nombre o juego
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Ej: Charizard, Pokemon..."
              className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 placeholder-slate-500 transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
            />
          </div>

          {/* Grid de filtros */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Juego */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                Juego
              </label>
              <select
                value={filters.game || ''}
                onChange={(e) => handleFilterChange('game', e.target.value || undefined)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                <option value="">Todos los juegos</option>
                {availableGames.map((game) => (
                  <option key={game} value={game}>
                    {game}
                  </option>
                ))}
              </select>
            </div>

            {/* Rareza */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                Rareza
              </label>
              <select
                value={filters.rarity || ''}
                onChange={(e) => handleFilterChange('rarity', e.target.value || undefined)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                <option value="">Todas las rarezas</option>
                {availableRarities.map((rarity) => (
                  <option key={rarity} value={rarity}>
                    {rarity}
                  </option>
                ))}
              </select>
            </div>

            {/* Rango de precio */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                Rango de precio (S/)
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  type="number"
                  placeholder="Mín"
                  value={filters.minPrice || ''}
                  onChange={(e) =>
                    handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Máx"
                  value={filters.maxPrice || ''}
                  onChange={(e) =>
                    handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Botón limpiar */}
          {(searchQuery || filters.game || filters.rarity || filters.minPrice || filters.maxPrice) && (
            <button
              onClick={clearFilters}
              className="rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 font-bold text-slate-700 transition hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            >
              ✕ Limpiar filtros
            </button>
          )}
        </div>
      </section>

      {/* Contenido principal */}
      {error && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200 bg-white py-20 dark:border-slate-700 dark:bg-slate-800">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-purple-600 dark:border-slate-600 dark:border-t-purple-400" />
          <p className="text-slate-600 dark:text-slate-400">Cargando catálogo...</p>
        </div>
      ) : cards.length > 0 ? (
        <>
          {/* Contador de resultados */}
          <div className="text-sm font-bold text-slate-600 dark:text-slate-400">
            📊 {cards.length} carta{cards.length !== 1 ? 's' : ''} encontrada{cards.length !== 1 ? 's' : ''}
          </div>

          {/* Grid de cartas */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cards.map((card) => (
              <ProductCard
                key={card.id}
                card={card}
                sessionToken={sessionToken}
                onPreorderClick={handlePreorderClick}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200 bg-white py-20 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            😕 No hay cartas que coincidan con los filtros
          </p>
          <button
            onClick={clearFilters}
            className="rounded-lg bg-purple-600 px-6 py-2 font-bold text-white transition hover:bg-purple-700"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Footer de estado */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        <p>
          🔗 <strong>Sesión:</strong> {sessionToken.slice(0, 20)}...
        </p>
        <p className="mt-2 text-xs">
          Los eventos se registran automáticamente para mejorar el catálogo y entender la demanda real.
        </p>
      </div>
    </main>
  );
}