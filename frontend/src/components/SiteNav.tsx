import { CardsIcon, ChartIcon, ClockIcon, StoreIcon, TagIcon } from '@/components/Icons';
import SoundToggle from '@/components/SoundToggle';
import ThemeToggle from '@/components/ThemeToggle';
import { gameCatalog, productBranches, storeTagCatalog } from '@/lib/catalogTaxonomy';

const mainLinks = [
  { href: '/client', label: 'Catálogo', icon: CardsIcon },
  { href: '/games', label: 'Juegos', icon: StoreIcon },
  { href: '/restock', label: 'Restock', icon: ChartIcon },
  { href: '/releases', label: 'Lanzamientos', icon: ClockIcon },
  { href: '/profile', label: 'Profile', icon: TagIcon }
];

export default function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-wiju-moonGold/70 bg-wiju-logoWine px-4 py-3 text-white shadow-neon dark:border-wiju-moonGold dark:bg-wiju-logoWineDark">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <a href="/" data-sound="nav" className="inline-flex items-center gap-3 rounded-2xl bg-white px-3 py-2 text-wiju-logoWine shadow-card transition hover:-translate-y-0.5">
          <img src="/wijutopia-logo.svg" alt="Logo Wijutopia Card Game Store" className="h-12 w-12 rounded-full" />
          <span className="hidden text-lg font-black tracking-tight sm:inline">Wijutopia</span>
        </a>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2 text-sm font-black">
          {mainLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a key={link.href} href={link.href} data-sound="nav" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-white transition hover:-translate-y-0.5 hover:border-wiju-moonGold hover:bg-white hover:text-wiju-logoWine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wiju-moonGold">
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </a>
            );
          })}
          <SoundToggle />
          <ThemeToggle />
        </div>

        <details className="group w-full rounded-3xl border border-wiju-moonGold/50 bg-white p-3 text-xs text-wiju-ink shadow-card dark:bg-wiju-ink dark:text-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-black text-wiju-logoWine dark:text-wiju-moonGold">
            <span className="inline-flex items-center gap-2"><TagIcon className="h-4 w-4" /> Mapa rápido del catálogo</span>
            <span className="text-wiju-logoWine/70 group-open:hidden dark:text-wiju-moonGold/80">Mostrar</span>
            <span className="hidden text-wiju-logoWine/70 group-open:inline dark:text-wiju-moonGold/80">Ocultar</span>
          </summary>
          <div className="mt-3 grid gap-4 lg:grid-cols-3">
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
              <p className="mb-2 font-black uppercase tracking-[0.18em] text-slate-500">Etiquetas</p>
              <div className="flex flex-wrap gap-2">
                {storeTagCatalog.slice(0, 4).map((tag) => <a key={tag.slug} href={`/store-tags/${tag.slug}`} data-sound="nav" className="rounded-full border border-wiju-logoWine/20 px-3 py-1 text-wiju-logoWine transition hover:-translate-y-0.5 hover:border-wiju-moonGold dark:border-white/15 dark:text-white">{tag.label}</a>)}
              </div>
            </section>
          </div>
        </details>
      </nav>
    </header>
  );
}
