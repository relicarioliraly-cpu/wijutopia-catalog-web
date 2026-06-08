'use client';

import { useMemo, useState } from 'react';
import { CardsIcon, CartIcon, ChartIcon, ClockIcon, HeartIcon, StoreIcon, TagIcon, UserIcon } from '@/components/Icons';
import CartDrawer from '@/components/CartDrawer';
import AccountModal from '@/components/AccountModal';
import SoundToggle from '@/components/SoundToggle';
import ThemeToggle from '@/components/ThemeToggle';
import { useCart } from '@/components/CartContext';
import { gameCatalog, productBranches, storeTagCatalog } from '@/lib/catalogTaxonomy';
import { trackAddToWishlist } from '@/lib/apiService';

const mainLinks = [
  { href: '/client', label: 'Catálogo', icon: CardsIcon },
  { href: '/games', label: 'Juegos', icon: StoreIcon },
  { href: '/restock', label: 'Restock', icon: ChartIcon },
  { href: '/releases', label: 'Lanzamientos', icon: ClockIcon }
];

const navButtonClass = 'wiju-bottom-nav-item focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wiju-moonGold';

export default function SiteNav() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState('');
  const sessionToken = useMemo(() => `buyer_nav_${Date.now()}`, []);
  const { itemCount } = useCart();

  const handleWishlistNavClick = async () => {
    setWishlistMessage('Wishlist registrada');
    try {
      await trackAddToWishlist('wishlist-nav', sessionToken);
    } catch (error) {
      console.error('Error tracking wishlist nav event:', error);
    } finally {
      window.setTimeout(() => setWishlistMessage(''), 2200);
    }
  };

  return (
    <>
      <header className="wiju-bottom-nav group fixed inset-x-0 bottom-0 z-50 px-3 pb-3 pt-2 text-white sm:px-5">
        <nav className="mx-auto flex max-w-7xl items-end justify-start gap-2 overflow-x-auto rounded-[1.75rem] border border-amber-900/70 px-3 py-2 shadow-2xl backdrop-blur-xl sm:justify-between sm:overflow-visible">
          <a href="/" data-sound="nav" className="wiju-bottom-brand hidden items-center gap-2 rounded-2xl border border-amber-200/20 bg-white/10 p-2 pr-3 transition hover:-translate-y-0.5 sm:inline-flex" aria-label="Ir al inicio de Wijutopia">
            <img src="/wijutopia-logo.svg" alt="Logo Wijutopia Card Game Store" className="h-11 w-11 rounded-full bg-white/95 p-1 shadow-neon" />
            <span className="wiju-nav-label font-black tracking-tight">Wijutopia</span>
          </a>

          <div className="flex min-w-max flex-1 items-center justify-center gap-2 text-sm font-black sm:justify-end">
            {mainLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a key={link.href} href={link.href} data-sound="nav" className={navButtonClass}>
                  <Icon className="h-5 w-5" />
                  <span className="wiju-nav-label">{link.label}</span>
                </a>
              );
            })}

            <button type="button" onClick={() => setIsCartOpen(true)} data-sound="cart" className={`relative ${navButtonClass}`} aria-label="Abrir carrito de compras">
              <CartIcon className="h-5 w-5" />
              <span className="wiju-nav-label">Carrito</span>
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-wiju-signMagenta px-1.5 text-[0.65rem] font-black text-white">
                  {itemCount}
                </span>
              )}
            </button>

            <button type="button" onClick={handleWishlistNavClick} data-sound="success" className={navButtonClass} aria-label="Registrar acceso a lista de deseos">
              <HeartIcon className="h-5 w-5" />
              <span className="wiju-nav-label">Wishlist</span>
            </button>

            <button type="button" onClick={() => setIsAccountOpen(true)} data-sound="tap" className={navButtonClass} aria-label="Abrir User comprador">
              <UserIcon className="h-5 w-5" />
              <span className="wiju-nav-label">User</span>
            </button>

            <details className="group/map relative">
              <summary className={`${navButtonClass} list-none`} aria-label="Abrir mapa rápido del catálogo">
                <TagIcon className="h-5 w-5" />
                <span className="wiju-nav-label">Mapa</span>
              </summary>
              <div className="absolute bottom-full right-0 mb-4 w-[min(88vw,48rem)] rounded-3xl border border-wiju-moonGold/60 bg-white/95 p-4 text-xs text-wiju-ink shadow-card dark:bg-wiju-ink/95 dark:text-white">
                <div className="grid gap-4 lg:grid-cols-3">
                  <section>
                    <p className="mb-2 font-black uppercase tracking-[0.18em] text-slate-500">Juegos</p>
                    <div className="flex flex-wrap gap-2">
                      {gameCatalog.slice(0, 6).map((game) => (
                        <a key={game.slug} href={`/games/${game.slug}`} data-sound="nav" className="rounded-full border border-wiju-logoWine/20 px-3 py-1 font-black text-wiju-logoWine transition hover:-translate-y-0.5 hover:border-wiju-moonGold dark:border-white/15 dark:text-white">
                          {game.marker}
                        </a>
                      ))}
                    </div>
                  </section>
                  <section>
                    <p className="mb-2 font-black uppercase tracking-[0.18em] text-slate-500">Ramas</p>
                    <div className="flex flex-wrap gap-2">
                      {productBranches.map((branch) => <a key={branch.href} href={branch.href} data-sound="nav" className="rounded-full border border-wiju-logoWine/20 px-3 py-1 text-wiju-logoWine transition hover:-translate-y-0.5 hover:border-wiju-moonGold dark:border-white/15 dark:text-white">{branch.label}</a>)}
                    </div>
                  </section>
                  <section>
                    <p className="mb-2 font-black uppercase tracking-[0.18em] text-slate-500">Tienda</p>
                    <div className="flex flex-wrap gap-2">
                      {storeTagCatalog.slice(0, 6).map((tag) => <a key={tag.slug} href={`/store-tags/${tag.slug}`} data-sound="nav" className="rounded-full border border-wiju-logoWine/20 px-3 py-1 text-wiju-logoWine transition hover:-translate-y-0.5 hover:border-wiju-moonGold dark:border-white/15 dark:text-white">{tag.label}</a>)}
                    </div>
                  </section>
                </div>
              </div>
            </details>

            <div className="hidden items-center gap-2 lg:flex">
              <SoundToggle />
              <ThemeToggle />
            </div>
          </div>
        </nav>
        {wishlistMessage && <p className="mx-auto mt-2 w-fit rounded-full bg-wiju-moonGold px-4 py-1 text-xs font-black text-wiju-ink shadow-card">{wishlistMessage}</p>}
      </header>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <AccountModal isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} />
    </>
  );
}
