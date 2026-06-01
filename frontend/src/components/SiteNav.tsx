import ThemeToggle from '@/components/ThemeToggle';
import { gameCatalog, productBranches, storeTagCatalog } from '@/lib/catalogTaxonomy';

export default function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-wiju-borderLight bg-white/90 px-4 py-3 backdrop-blur dark:border-wiju-borderDark dark:bg-wiju-darkBg/90">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <a href="/" className="text-xl font-black tracking-tight text-wiju-crimson dark:text-wiju-gold">Wijutopia TCG</a>
        <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
          <a href="/client" className="rounded-full px-3 py-2 hover:bg-wiju-crimson/10 dark:hover:bg-wiju-gold/10">Catálogo</a>
          <a href="/games" className="rounded-full px-3 py-2 hover:bg-wiju-crimson/10 dark:hover:bg-wiju-gold/10">Juegos</a>
          <a href="/restock" className="rounded-full px-3 py-2 hover:bg-wiju-crimson/10 dark:hover:bg-wiju-gold/10">Restock</a>
          <a href="/releases" className="rounded-full px-3 py-2 hover:bg-wiju-crimson/10 dark:hover:bg-wiju-gold/10">Lanzamientos</a>
          <a href="/admin" className="rounded-full px-3 py-2 hover:bg-wiju-crimson/10 dark:hover:bg-wiju-gold/10">Admin</a>
          <ThemeToggle />
        </div>
        <div className="grid w-full gap-3 rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-3 text-xs shadow-card dark:border-wiju-borderDark dark:bg-wiju-cardDark lg:grid-cols-[1.2fr_1fr_1fr]">
          <section>
            <p className="mb-2 font-black uppercase tracking-[0.2em] text-wiju-crimson dark:text-wiju-gold">Marcadores por juego</p>
            <div className="flex flex-wrap gap-2">
              {gameCatalog.map((game) => (
                <a key={game.slug} href={`/games/${game.slug}`} className="rounded-full border border-wiju-borderLight px-3 py-1 font-black dark:border-wiju-borderDark">
                  {game.marker} · {game.name}
                </a>
              ))}
            </div>
          </section>
          <section>
            <p className="mb-2 font-black uppercase tracking-[0.2em] text-wiju-crimson dark:text-wiju-gold">Ramas de catálogo</p>
            <div className="flex flex-wrap gap-2">
              {productBranches.map((branch) => <a key={branch.href} href={branch.href} className="rounded-full border border-wiju-borderLight px-3 py-1 dark:border-wiju-borderDark">{branch.label}</a>)}
            </div>
          </section>
          <section>
            <p className="mb-2 font-black uppercase tracking-[0.2em] text-wiju-crimson dark:text-wiju-gold">Etiquetas de tienda</p>
            <div className="flex flex-wrap gap-2">
              {storeTagCatalog.map((tag) => <a key={tag.slug} href={`/store-tags/${tag.slug}`} className="rounded-full border border-wiju-borderLight px-3 py-1 dark:border-wiju-borderDark">{tag.label}</a>)}
            </div>
          </section>
        </div>
      </nav>
    </header>
  );
}
