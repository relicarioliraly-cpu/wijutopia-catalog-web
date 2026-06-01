import SegmentedCatalog from '@/components/SegmentedCatalog';
import { findGame, gameCatalog } from '@/lib/catalogTaxonomy';

export function generateStaticParams() {
  return gameCatalog.map((game) => ({ slug: game.slug }));
}

export default function MarketplacePage({ params }: { params: { slug: string } }) {
  const game = findGame(params.slug) || gameCatalog[0];
  const matchTerms = [game.name, game.marker, game.slug, ...game.name.split(' ')];
  return (
    <SegmentedCatalog
      title={game.name}
      subtitle={`${game.description} Ramas: ${game.branches.join(' · ')}.`}
      marker={game.marker}
      categoryMatch={matchTerms}
      heroGradient={game.color}
    />
  );
}
