import { CardsIcon, ChartIcon, ClockIcon, StoreIcon, TagIcon } from '@/components/Icons';
import ThemeToggle from '@/components/ThemeToggle';
import { gameCatalog, productBranches, storeTagCatalog } from '@/lib/catalogTaxonomy';

const mainLinks = [
  { href: '/client', label: 'Catálogo', icon: CardsIcon },
  { href: '/games', label: 'Juegos', icon: StoreIcon },
  { href: '/restock', label: 'Restock', icon: ChartIcon },
  { href: '/releases', label: 'Lanzamientos', icon: ClockIcon },
  { href: '/admin', label: 'Admin', icon: TagIcon }
];

export default function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-wiju-borderLight bg-white/92 px-4 py-3 backdrop-blur dark:border-wiju-borderDark dark:bg-wiju-darkBg/92">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <a href="/" className="inline-flex items-center gap-2 text-lg font-black tracking-tight text-wiju-crimson dark:text-wiju-gold">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-wiju-crimson text-white shadow-card dark:bg-wiju-gold dark:text-black"><StoreIcon /></span>
          <span>Wiju&apos;s TCG</span>
        </a>

        <div className="flex flex-wrap items-center justify-end gap-2 text-sm font-bold">
          {mainLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a key={link.href} href={link.href} className="inline-flex items-center gap-2 rounded-full px-3 py-2 hover:bg-wiju-crimson/10 dark:hover:bg-wiju-gold/10">
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </a>
            );
          })}
          <ThemeToggle />
        </div>

        <details className="group w-full rounded-3xl border border-wiju-borderLight bg-wiju-cardLight/95 p-3 text-xs shadow-card dark:border-wiju-borderDark dark:bg-wiju-cardDark/95">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-black text-wiju-crimson dark:text-wiju-gold">
            <span className="inline-flex items-center gap-2"><TagIcon className="h-4 w-4" /> Mapa rápido del catálogo</span>
            <span className="text-slate-500 group-open:hidden">Mostrar</span>
            <span className="hidden text-slate-500 group-open:inline">Ocultar</span>
          </summary>
          <div className="mt-3 grid gap-4 lg:grid-cols-3">
            <section>
              <p className="mb-2 font-black uppercase tracking-[0.18em] text-slate-500">Juegos</p>
              <div className="flex flex-wrap gap-2">
                {gameCatalog.slice(0, 6).map((game) => (
                  <a key={game.slug} href={`/games/${game.slug}`} className="rounded-full border border-wiju-borderLight px-3 py-1 font-black dark:border-wiju-borderDark">
                    {game.marker}
                  </a>
                ))}
              </div>
            </section>
            <section>
              <p className="mb-2 font-black uppercase tracking-[0.18em] text-slate-500">Ramas</p>
              <div className="flex flex-wrap gap-2">
                {productBranches.map((branch) => <a key={branch.href} href={branch.href} className="rounded-full border border-wiju-borderLight px-3 py-1 dark:border-wiju-borderDark">{branch.label}</a>)}
              </div>
            </section>
            <section>
              <p className="mb-2 font-black uppercase tracking-[0.18em] text-slate-500">Etiquetas</p>
              <div className="flex flex-wrap gap-2">
                {storeTagCatalog.slice(0, 4).map((tag) => <a key={tag.slug} href={`/store-tags/${tag.slug}`} className="rounded-full border border-wiju-borderLight px-3 py-1 dark:border-wiju-borderDark">{tag.label}</a>)}
              </div>
            </section>
          </div>
        </details>
      </nav>
    </header>
  );
}
