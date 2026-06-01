import SegmentedCatalog from '@/components/SegmentedCatalog';
import { findMarketplace, marketplaceCatalog } from '@/lib/catalogTaxonomy';

export function generateStaticParams() {
  return marketplaceCatalog.map((marketplace) => ({ slug: marketplace.slug }));
}

export default function MarketplacePage({ params }: { params: { slug: string } }) {
  const marketplace = findMarketplace(params.slug) || marketplaceCatalog[0];
  return (
    <SegmentedCatalog
      title={`Referencia ${marketplace.label}`}
      subtitle={marketplace.description}
      marker={marketplace.label}
      heroGradient="from-slate-900 to-wiju-signMagenta"
    />
  );
}
