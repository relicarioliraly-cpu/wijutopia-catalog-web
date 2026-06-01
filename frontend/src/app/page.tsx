import { CardsIcon, CartIcon, ChartIcon, SparkIcon, StoreIcon, TagIcon } from '@/components/Icons';

const quickCards = [
  { href: '/games', label: 'Juegos ramificados', description: 'Pokémon, Yu-Gi-Oh!, One Piece, Digimon y más.', icon: CardsIcon },
  { href: '/store-tags/en-vitrina', label: 'Etiquetas internas', description: 'En vitrina, preventa, restock y torneos.', icon: TagIcon },
  { href: '/restock', label: 'Restock visual', description: 'Decisiones por señales y WhatsApp.', icon: ChartIcon }
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 py-10">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-7">
          <p className="inline-flex items-center gap-2 rounded-full border border-wiju-gold/50 px-4 py-2 text-sm font-bold text-wiju-crimson dark:text-wiju-gold"><SparkIcon className="h-4 w-4" /> Next.js + Express.js + MySQL</p>
          <h1 className="text-5xl font-black leading-tight md:text-7xl">Wiju&apos;s TCG Store visual, claro y conectado.</h1>
          <p className="max-w-3xl text-lg text-slate-600 dark:text-slate-300">
            Prototipo académico con catálogo TCG, carrito, restock por señales, panel administrativo y una vista más limpia inspirada en la fachada morada de Wiju&apos;s.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="/client" className="inline-flex items-center gap-2 rounded-2xl bg-wiju-crimson px-6 py-4 font-black text-white dark:bg-wiju-gold dark:text-black"><CartIcon /> Explorar catálogo</a>
            <a href="/admin" className="inline-flex items-center gap-2 rounded-2xl border border-wiju-borderLight px-6 py-4 font-black dark:border-wiju-borderDark"><ChartIcon /> Panel administrativo</a>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2.5rem] border border-purple-300/30 bg-[#2d1748] p-6 text-white shadow-card">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,.28)_0_2px,transparent_3px),radial-gradient(circle_at_75%_20%,rgba(255,255,255,.22)_0_2px,transparent_3px),linear-gradient(160deg,#5b2a86,#28123f_55%,#101827)]" />
          <div className="relative space-y-5">
            <div className="rounded-[2rem] border-4 border-[#140b22] bg-[#5b2a86] p-5 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div className="rounded-xl border-4 border-[#2b0f2d] bg-[#8b1d57] px-6 py-3 text-4xl font-black tracking-wide shadow-xl">WIJU&apos;S</div>
                <div className="grid h-16 w-16 place-items-center rounded-full border-4 border-white bg-[#8b1d57]"><StoreIcon className="h-9 w-9" /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-[1fr_0.55fr_1fr]">
                <div className="grid min-h-28 place-items-center rounded-2xl border-4 border-[#2b0f2d] bg-[#7d1e52]"><span className="text-5xl font-black">W</span></div>
                <div className="rounded-2xl border-4 border-[#1f1230] bg-[#3b2063] p-4"><div className="mx-auto mt-6 h-10 w-10 rounded-full bg-wiju-gold" /></div>
                <div className="grid min-h-28 place-items-center rounded-2xl border-4 border-[#2b0f2d] bg-[#7d1e52]"><CartIcon className="h-16 w-16" /></div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-4"><strong>Visual</strong><p className="text-sm text-white/75">Menos ruido, más jerarquía.</p></div>
              <div className="rounded-2xl bg-white/10 p-4"><strong>Iconos</strong><p className="text-sm text-white/75">Acciones reconocibles.</p></div>
              <div className="rounded-2xl bg-white/10 p-4"><strong>TCG</strong><p className="text-sm text-white/75">Ramas por juego.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {quickCards.map((card) => {
          const Icon = card.icon;
          return (
            <a key={card.href} href={card.href} className="rounded-3xl border border-wiju-borderLight bg-wiju-cardLight p-6 shadow-card transition hover:-translate-y-1 dark:border-wiju-borderDark dark:bg-wiju-cardDark">
              <Icon className="h-8 w-8 text-wiju-crimson dark:text-wiju-gold" />
              <h2 className="mt-4 text-xl font-black">{card.label}</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{card.description}</p>
            </a>
          );
        })}
      </section>
    </main>
  );
}
