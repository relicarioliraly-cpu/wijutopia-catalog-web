'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/api';
import { useTracker } from '@/hooks/useTracker';

type ActiveRestock = {
  id: number;
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
  const viewedProductId = useRef<number | null>(null);

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
    <article className="overflow-hidden rounded-3xl border border-wiju-borderLight bg-wiju-cardLight shadow-card transition hover:-translate-y-1 dark:border-wiju-borderDark dark:bg-wiju-cardDark">
      <button type="button" onClick={handleImageClick} className="relative block h-72 w-full overflow-hidden bg-black/20">
        <Image src={imageUrl} alt={product.name} fill sizes="(min-width: 1024px) 25vw, 100vw" className="object-cover transition duration-300 hover:scale-105" />
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-black ${isAvailable ? 'bg-emerald-500 text-white' : 'bg-wiju-crimson text-white'}`}>
          {isAvailable ? 'Disponible' : 'Agotado'}
        </span>
        {isLaunch && <span className="absolute right-3 top-3 rounded-full bg-wiju-gold px-3 py-1 text-xs font-black text-black">Lanzamiento</span>}
      </button>
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-wiju-borderLight px-3 py-1 text-xs font-bold dark:border-wiju-borderDark">{product.marketplace_tag || 'Local Wijutopia'}</span>
          <span className="rounded-full border border-wiju-borderLight px-3 py-1 text-xs font-bold dark:border-wiju-borderDark">{product.category || 'TCG'}</span>
        </div>
        <div>
          <h3 className="line-clamp-2 text-lg font-black">{product.name}</h3>
          <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{product.description || 'Producto TCG disponible para la comunidad de Trujillo.'}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-black text-wiju-crimson dark:text-wiju-gold">S/ {Number(product.price).toFixed(2)}</span>
          <span className="rounded-full bg-wiju-crimson/10 px-3 py-1 text-xs font-bold text-wiju-crimson dark:bg-wiju-gold/10 dark:text-wiju-gold">Stock: {product.stock}</span>
        </div>
        {isAvailable ? (
          <button
            type="button"
            onClick={handleAddToCart}
            className="focus-ring w-full rounded-2xl bg-wiju-crimson px-4 py-3 font-black text-white dark:bg-wiju-gold dark:text-black"
          >
            Añadir al carrito
          </button>
        ) : activeRestock ? (
          <div className="space-y-2">
            <p className="rounded-2xl bg-wiju-gold/15 p-3 text-xs font-semibold">Solicitud en espera: se comparará con vistas, clics y mensajes oficiales de WhatsApp de la temporada.</p>
            <button
              type="button"
              onClick={() => onCancelRestock?.(product, activeRestock)}
              className="focus-ring w-full rounded-2xl border border-wiju-crimson px-4 py-3 font-black text-wiju-crimson dark:border-wiju-gold dark:text-wiju-gold"
            >
              Cancelar stock/restock
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onRestockRequest?.(product)}
            className="focus-ring w-full rounded-2xl border border-wiju-crimson px-4 py-3 font-black text-wiju-crimson dark:border-wiju-gold dark:text-wiju-gold"
          >
            Pedir stock/restock
          </button>
        )}
        {isLaunch && product.preorder_available && (
          <button
            type="button"
            onClick={() => onPreorderRequest?.(product)}
            className="focus-ring w-full rounded-2xl bg-black px-4 py-3 font-black text-wiju-gold dark:bg-white dark:text-wiju-crimson"
          >
            Pedir lanzamiento
          </button>
        )}
      </div>
    </article>
  );
}
