import { gameCatalog } from '@/lib/catalogTaxonomy';

export default function GamesIndexPage() {
  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-10">
      <section className="rounded-[2rem] bg-gradient-to-br from-wiju-crimson to-black p-8 text-white shadow-card">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-wiju-gold">Mapa jerárquico</p>
        <h1 className="mt-3 text-5xl font-black">Juegos TCG separados por páginas</h1>
        <p className="mt-4 max-w-4xl text-white/80">Estructura tipo marketplace: cada juego tiene su marcador, ramas internas y seguimiento de catálogo para vistas, clics, WhatsApp, restock y lanzamientos.</p>
      </section>
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {gameCatalog.map((game) => (
          <a key={game.slug} href={`/games/${game.slug}`} className="rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-6 shadow-card transition hover:-translate-y-1 dark:border-wiju-borderDark dark:bg-wiju-cardDark">
            <span className={`inline-flex rounded-full bg-gradient-to-r ${game.color} px-4 py-2 text-sm font-black text-white`}>{game.marker}</span>
            <h2 className="mt-4 text-2xl font-black">{game.name}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{game.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">{game.branches.map((branch) => <span key={branch} className="rounded-full border px-3 py-1 text-xs font-bold">{branch}</span>)}</div>
          </a>
        ))}
      </section>
    </main>
  );
}
