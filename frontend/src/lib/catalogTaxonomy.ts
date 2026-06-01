export type GameNode = {
  slug: string;
  name: string;
  marker: string;
  description: string;
  color: string;
  branches: string[];
};

export const gameCatalog: GameNode[] = [
  {
    slug: 'pokemon',
    name: 'Pokémon TCG',
    marker: 'PKM',
    description: 'Singles, boosters, Elite Trainer Boxes, accesorios y preventas para jugadores y coleccionistas Pokémon.',
    color: 'from-red-600 to-yellow-400',
    branches: ['Singles competitivos', 'ETB / Colecciones', 'Booster boxes', 'Preórdenes', 'Restock agotados']
  },
  {
    slug: 'yugioh',
    name: 'Yu-Gi-Oh!',
    marker: 'YGO',
    description: 'Cartas sueltas, sobres, decks, staples y productos sellados para OTS y juego competitivo.',
    color: 'from-violet-700 to-yellow-500',
    branches: ['Staples', 'Deck cores', 'Sobres', 'OTS packs', 'Lista de deseos']
  },
  {
    slug: 'one-piece',
    name: 'One Piece Card Game',
    marker: 'OP',
    description: 'Líneas OP, decks, cajas de sobres, líderes y lanzamientos con seguimiento de demanda.',
    color: 'from-red-700 to-sky-500',
    branches: ['Leaders', 'Booster boxes', 'Starter decks', 'Lanzamientos', 'Pedidos']
  },
  {
    slug: 'digimon',
    name: 'Digimon Card Game',
    marker: 'DGM',
    description: 'Productos Bandai, cartas por color, decks y reposición basada en clics, vistas y WhatsApp.',
    color: 'from-orange-600 to-blue-600',
    branches: ['Cartas por color', 'Starter decks', 'Boosters', 'Torneos', 'Restock']
  },
  {
    slug: 'dragon-ball',
    name: 'Dragon Ball Super CG',
    marker: 'DBS',
    description: 'Cartas, packs y colecciones de Dragon Ball con marcadores de disponibilidad y preventa.',
    color: 'from-amber-500 to-orange-700',
    branches: ['Singles', 'Sealed', 'Promos', 'Lanzamientos', 'Pedidos']
  },
  {
    slug: 'magic',
    name: 'Magic: The Gathering',
    marker: 'MTG',
    description: 'Estructura preparada para singles, Commander, sellado y accesorios MTG.',
    color: 'from-slate-800 to-blue-500',
    branches: ['Commander', 'Singles', 'Draft boosters', 'Universes Beyond', 'Accesorios']
  }
];

export const marketplaceCatalog = [
  { slug: 'tcgplayer', label: 'TCGPlayer', description: 'Vista comparativa inspirada en listados, precios, condición y disponibilidad.' },
  { slug: 'cardmarket', label: 'Cardmarket', description: 'Vista de referencia europea para separar cartas por juego, idioma y estado.' },
  { slug: 'tradingcardmint', label: 'TradingCardMint', description: 'Marcador de inventario alternativo para productos sellados y cartas coleccionables.' },
  { slug: 'local-wijutopia', label: 'Local Wijutopia', description: 'Inventario local demo, retiro en tienda simulada y solicitudes de restock.' }
];

export const productBranches = [
  { href: '/singles', label: 'Cartas sueltas', description: 'Búsqueda por juego, rareza, condición y demanda.' },
  { href: '/sealed', label: 'Producto sellado', description: 'Booster boxes, decks, bundles y colecciones.' },
  { href: '/accessories', label: 'Accesorios', description: 'Sleeves, deck boxes, playmats y dados.' },
  { href: '/releases', label: 'Lanzamientos', description: 'Preórdenes, próximos sets y pedidos de llegada.' },
  { href: '/restock', label: 'Restock', description: 'Productos agotados priorizados por señales y WhatsApp.' }
];

export const findGame = (slug: string) => gameCatalog.find((game) => game.slug === slug);
export const findMarketplace = (slug: string) => marketplaceCatalog.find((marketplace) => marketplace.slug === slug);
