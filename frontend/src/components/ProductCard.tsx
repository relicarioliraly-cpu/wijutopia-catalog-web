'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CartIcon, TagIcon, SparkIcon } from '@/components/Icons';
import { Card, createPreorderIntent, trackPageView, trackAddToWishlist } from '@/lib/apiService';

type ProductCardProps = {
  card: Card;
  sessionToken: string;
  onPreorderClick?: (whatsappUrl: string) => void;
};

export default function ProductCard({
  card,
  sessionToken,
  onPreorderClick
}: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const viewedCardId = useRef<string | null>(null);

  // Registrar vista de card
  useEffect(() => {
    if (viewedCardId.current !== card.id) {
      viewedCardId.current = card.id;
      void trackPageView(`card-${card.id}`, sessionToken);
    }
  }, [card.id, sessionToken]);

  const handlePreorderClick = async () => {
    setIsLoading(true);
    try {
      const whatsappUrl = await createPreorderIntent({
        cardId: card.id,
        quantity: 1,
        sessionToken,
      });
      
      if (onPreorderClick) {
        onPreorderClick(whatsappUrl);
      } else {
        // Abrir WhatsApp directamente
        window.open(whatsappUrl, '_blank');
      }
    } catch (error) {
      console.error('Error creating preorder:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToWishlist = async () => {
    try {
      await trackAddToWishlist(card.id, sessionToken);
      alert('✅ Agregada a lista de deseos');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };
  const isAvailable = card.quantity > 0;

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 dark:border-slate-700 dark:bg-slate-800">
      {/* Imagen */}
      <div className="relative block h-72 w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
        <img
          src={card.image}
          alt={card.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Badge de disponibilidad */}
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg ${
            isAvailable
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          <SparkIcon className="h-3.5 w-3.5" />
          {isAvailable ? 'Disponible' : 'Agotado'}
        </span>
      </div>

      {/* Contenido */}
      <div className="space-y-4 p-5">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-purple-300 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 dark:border-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
            <TagIcon className="h-3.5 w-3.5" />
            {card.game}
          </span>
          <span className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 dark:border-slate-600 dark:bg-slate-700/30 dark:text-slate-300">
            {card.rarity}
          </span>
        </div>

        {/* Nombre */}
        <div>
          <h3 className="line-clamp-2 text-lg font-black text-slate-900 dark:text-white">
            {card.name}
          </h3>
        </div>

        {/* Precio y Stock */}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
            S/ {card.price.toFixed(2)}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
            Stock: {card.quantity}
          </span>
        </div>

        {/* Acciones */}
        {isAvailable ? (
          <button
            type="button"
            onClick={handlePreorderClick}
            disabled={isLoading}
            className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-600 px-4 py-3 font-bold text-white shadow-lg transition hover:bg-purple-700 disabled:opacity-50 dark:bg-purple-700 dark:hover:bg-purple-600"
          >
            <CartIcon className="h-5 w-5" />
            {isLoading ? 'Procesando...' : 'Generar Preventa'}
          </button>
        ) : (
          <div className="rounded-2xl bg-slate-100 px-4 py-3 text-center text-sm font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            Agotado - Proximamente
          </div>
        )}

        {/* Botón de wishlist */}
        <button
          type="button"
          onClick={handleAddToWishlist}
          className="w-full rounded-2xl border-2 border-purple-300 px-4 py-2 font-bold text-purple-600 transition hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:hover:bg-purple-900/20"
        >
          ♥ Agregar a Deseos
        </button>
      </div>
    </article>
  );
}
