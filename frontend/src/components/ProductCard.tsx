'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CartIcon, TagIcon, SparkIcon } from '@/components/Icons';
import { useCart } from '@/components/CartContext';
import { Card, createPreorderIntent, trackPageView, trackAddToWishlist, trackAddToCart, trackDetailClick } from '@/lib/apiService';
import { Product } from '@/lib/api';

type ProductCardProps = {
  card?: Card;
  product?: Product;
  sessionToken?: string;
  onPreorderClick?: (whatsappUrl: string) => void;
  onInterestEvent?: (product: Product, eventType: 'view' | 'click') => Promise<void>;
};

const normalizeProductToCard = (product: Product): Card => ({
  id: product.id,
  name: product.name,
  game: product.category || 'TCG',
  rarity: product.product_tag || 'Normal',
  price: Number(product.price || 0),
  image: product.image_url || 'https://via.placeholder.com/300x400?text=Sin+imagen',
  quantity: Number(product.stock ?? 0),
});

export default function ProductCard({
  card,
  product,
  sessionToken,
  onPreorderClick,
  onInterestEvent
}: ProductCardProps) {
  const { addItem } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const viewedCardId = useRef<string | null>(null);
  const normalizedCard = card ?? (product ? normalizeProductToCard(product) : {
    id: 'unknown',
    name: 'Carta sin nombre',
    game: 'TCG',
    rarity: 'Normal',
    price: 0,
    image: 'https://via.placeholder.com/300x400?text=Sin+imagen',
    quantity: 0,
  });
  const generatedSessionToken = useMemo(() => `guest_${Date.now()}`, []);
  const activeSessionToken = sessionToken || generatedSessionToken;

  // Registrar vista de card
  useEffect(() => {
    if (viewedCardId.current !== normalizedCard.id) {
      viewedCardId.current = normalizedCard.id;
      void trackPageView(`card-${normalizedCard.id}`, activeSessionToken);
      if (product && onInterestEvent) {
        void onInterestEvent(product, 'view');
      }
    }
  }, [activeSessionToken, normalizedCard.id, product, onInterestEvent]);

  const handlePreorderClick = async () => {
    setIsLoading(true);
    try {
      const whatsappUrl = await createPreorderIntent({
        cardId: normalizedCard.id,
        quantity: 1,
        sessionToken: activeSessionToken,
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

  const handleAddToCart = async () => {
    addItem({
      id: normalizedCard.id,
      name: normalizedCard.name,
      game: normalizedCard.game,
      rarity: normalizedCard.rarity,
      price: normalizedCard.price,
      image: normalizedCard.image,
      quantity: 1,
    });

    try {
      await trackAddToCart(normalizedCard.id, activeSessionToken);
    } catch (error) {
      console.error('Error tracking cart event:', error);
    }
  };

  const handleAddToWishlist = async () => {
    try {
      await trackAddToWishlist(normalizedCard.id, activeSessionToken);
      if (product && onInterestEvent) {
        await onInterestEvent(product, 'click');
      }
      alert('✅ Agregada a lista de deseos');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const handleDetailClick = async () => {
    try {
      await trackDetailClick(normalizedCard.id, activeSessionToken);
      if (product && onInterestEvent) {
        await onInterestEvent(product, 'click');
      }
    } catch (error) {
      console.error('Error tracking detail click:', error);
    }
  };

  const isAvailable = normalizedCard.quantity > 0;

  return (
    <article className="wiju-showcase-card group overflow-hidden rounded-[1.75rem] border border-white/35 bg-white/65 shadow-card backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-white/15 dark:bg-slate-950/45">
      <button
        type="button"
        onClick={handleDetailClick}
        className="relative block h-72 w-full overflow-hidden bg-gradient-to-br from-amber-100/70 via-white/50 to-wiju-signMagenta/20 text-left dark:from-slate-950 dark:via-wiju-doorPurple/40 dark:to-black"
        aria-label={`Ver detalle de ${normalizedCard.name}`}
      >
        <span className="absolute inset-3 rounded-[1.35rem] border border-white/35 shadow-[inset_0_0_35px_rgba(255,255,255,0.28)]" />
        <img
          src={normalizedCard.image}
          alt={normalizedCard.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/40 to-transparent mix-blend-screen" />
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
        <span className="absolute bottom-3 right-3 rounded-full border border-white/40 bg-black/45 px-3 py-1 text-xs font-black text-white backdrop-blur-md">
          DETAIL_CLICK
        </span>
      </button>

      <div className="space-y-4 p-5 text-wiju-ink dark:text-white">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-wiju-logoWine/25 bg-white/65 px-3 py-1 text-xs font-bold text-wiju-logoWine shadow-sm backdrop-blur dark:border-wiju-moonGold/40 dark:bg-white/10 dark:text-wiju-moonGold">
            <TagIcon className="h-3.5 w-3.5" />
            {normalizedCard.game}
          </span>
          <span className="rounded-full border border-amber-900/20 bg-amber-50/80 px-3 py-1 text-xs font-bold text-amber-950 shadow-sm backdrop-blur dark:border-white/15 dark:bg-white/10 dark:text-slate-100">
            {normalizedCard.rarity}
          </span>
        </div>

        <div>
          <h3 className="line-clamp-2 text-lg font-black text-slate-950 dark:text-white">
            {normalizedCard.name}
          </h3>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/40 bg-white/50 px-3 py-2 shadow-sm backdrop-blur dark:border-white/10 dark:bg-black/20">
          <span className="text-2xl font-black text-wiju-logoWine dark:text-wiju-moonGold">
            S/ {normalizedCard.price.toFixed(2)}
          </span>
          <span className="rounded-full bg-amber-950/10 px-3 py-1 text-xs font-bold text-amber-950 dark:bg-white/10 dark:text-slate-200">
            Stock: {normalizedCard.quantity}
          </span>
        </div>

        {isAvailable ? (
          <div className="grid gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-wiju-logoWine px-4 py-3 font-bold text-white shadow-lg transition hover:bg-wiju-logoWineDark dark:bg-wiju-moonGold dark:text-slate-950 dark:hover:bg-purple-200"
            >
              <CartIcon className="h-5 w-5" />
              Agregar al carrito
            </button>
            <button
              type="button"
              onClick={handlePreorderClick}
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-50/90 px-4 py-3 font-bold text-emerald-800 transition hover:border-emerald-600 hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-300/40 dark:bg-emerald-400/10 dark:text-emerald-100 dark:hover:bg-emerald-400/20"
            >
              <CartIcon className="h-5 w-5" />
              {isLoading ? 'Procesando...' : 'Preventa por WhatsApp'}
            </button>
          </div>
        ) : (
          <div className="rounded-2xl bg-amber-950/10 px-4 py-3 text-center text-sm font-bold text-amber-950 dark:bg-white/10 dark:text-slate-300">
            Agotado - Próximamente
          </div>
        )}

        <button
          type="button"
          onClick={handleAddToWishlist}
          className="w-full rounded-2xl border-2 border-wiju-logoWine/30 bg-white/35 px-4 py-2 font-bold text-wiju-logoWine transition hover:bg-wiju-logoWine/10 dark:border-wiju-moonGold/50 dark:bg-white/5 dark:text-wiju-moonGold dark:hover:bg-wiju-moonGold/10"
        >
          ♥ Agregar a Wishlist
        </button>
      </div>
    </article>
  );
}
