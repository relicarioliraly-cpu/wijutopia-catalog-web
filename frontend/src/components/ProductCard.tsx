'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { CartIcon, ClockIcon, SparkIcon, TagIcon } from '@/components/Icons';
import { Product } from '@/lib/api';
import { useTracker } from '@/hooks/useTracker';

type ActiveRestock = {
  id: string;
  customerEmail: string;
  status: string;
};

type ProductCardProps = {
  product: Product;
  activeRestock?: ActiveRestock;
  onAddToCart?: (product: Product) => void;
  onRestockRequest?: (product: Product) => void;
  onCancelRestock?: (product: Product, request: ActiveRestock) => void;
  onPreorderRequest?: (product: Product) => void;
  onInterestEvent?: (product: Product, eventType: 'view' | 'click') => void;
};

export default function ProductCard({
  product,
  activeRestock,
  onAddToCart,
  onRestockRequest,
  onCancelRestock,
  onPreorderRequest,
  onInterestEvent
}: ProductCardProps) {
  const { trackClick } = useTracker();
  const imageUrl = product.image_url || 'https://picsum.photos/500/700';
  const isAvailable = product.stock > 0;
  const isLaunch = product.release_status === 'lanzamiento';
  const viewedProductId = useRef<string | null>(null);

  useEffect(() => {
    if (viewedProductId.current !== product.id) {
      viewedProductId.current = product.id;
      onInterestEvent?.(product, 'view');
    }
  }, [onInterestEvent, product]);

  const handleImageClick = () => {
    void trackClick('imagen_producto_detalle');
    onInterestEvent?.(product, 'click');
  };

  const handleAddToCart = () => {
    void trackClick('btn_agregar_carrito');
    onInterestEvent?.(product, 'click');
    onAddToCart?.(product);
  };

  return (
    <article className="overflow-hidden rounded-3xl border border-wiju-borderLight bg-wiju-cardLight shadow-card wiju-hover-lift dark:border-wiju-borderDark dark:bg-wiju-cardDark">
      <button type="button" onClick={handleImageClick} className="relative block h-72 w-full overflow-hidden bg-black/20">
        <Image src={imageUrl} alt={product.name} fill sizes="(min-width: 1024px) 25vw, 100vw" className="object-cover transition duration-300 hover:scale-105" />
        <span className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black shadow-card ${isAvailable ? 'bg-emerald-500 text-white' : 'bg-wiju-signMagenta text-white'}`}>
          <SparkIcon className="h-3.5 w-3.5" /> {isAvailable ? 'Disponible' : 'Agotado'}
        </span>
        {isLaunch && <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-wiju-moonGold px-3 py-1 text-xs font-black text-wiju-ink shadow-neon"><ClockIcon className="h-3.5 w-3.5" /> Lanzamiento</span>}
      </button>
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-wiju-borderLight px-3 py-1 text-xs font-bold dark:border-wiju-borderDark"><TagIcon className="h-3.5 w-3.5" /> {product.product_tag || 'En vitrina'}</span>
          <span className="rounded-full border border-wiju-borderLight px-3 py-1 text-xs font-bold dark:border-wiju-borderDark">{product.category || 'TCG'}</span>
        </div>
        <div>
          <h3 className="line-clamp-2 text-lg font-black">{product.name}</h3>
          <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{product.description || 'Producto TCG disponible para la comunidad de Trujillo.'}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-black text-wiju-signMagenta dark:text-wiju-moonGold">S/ {Number(product.price).toFixed(2)}</span>
          <span className="rounded-full bg-wiju-signMagenta/10 px-3 py-1 text-xs font-bold text-wiju-signMagenta dark:bg-wiju-moonGold/10 dark:text-wiju-moonGold">Stock: {product.stock}</span>
        </div>
        {isAvailable ? (
          <button
            type="button"
            onClick={handleAddToCart}
            data-sound="cart"
            className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-wiju-signMagenta px-4 py-3 font-black text-white shadow-neon transition hover:-translate-y-0.5 dark:bg-wiju-moonGold dark:text-wiju-ink"
          >
            <CartIcon className="h-5 w-5" /> Añadir al carrito
          </button>
        ) : activeRestock ? (
          <div className="space-y-2">
            <p className="rounded-2xl bg-wiju-moonGold/15 p-3 text-xs font-semibold">Solicitud en espera: se comparará con vistas, clics y mensajes oficiales de WhatsApp de la temporada.</p>
            <button
              type="button"
              onClick={() => onCancelRestock?.(product, activeRestock)}
              data-sound="tap"
              className="focus-ring w-full rounded-2xl border border-wiju-signMagenta px-4 py-3 font-black text-wiju-signMagenta dark:border-wiju-moonGold dark:text-wiju-moonGold"
            >
              Cancelar stock/restock
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onRestockRequest?.(product)}
            data-sound="success"
            className="focus-ring w-full rounded-2xl border border-wiju-signMagenta px-4 py-3 font-black text-wiju-signMagenta dark:border-wiju-moonGold dark:text-wiju-moonGold"
          >
            Pedir stock/restock
          </button>
        )}
        {isLaunch && product.preorder_available && (
          <button
            type="button"
            onClick={() => onPreorderRequest?.(product)}
            data-sound="success"
            className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-4 py-3 font-black text-wiju-moonGold shadow-neon dark:bg-white dark:text-wiju-signMagenta"
          >
            <ClockIcon className="h-5 w-5" /> Pedir lanzamiento
          </button>
        )}
      </div>
    </article>
  );
}
