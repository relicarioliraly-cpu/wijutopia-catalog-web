import SegmentedCatalog from '@/components/SegmentedCatalog';
import { findStoreTag, storeTagCatalog } from '@/lib/catalogTaxonomy';

export function generateStaticParams() {
  return storeTagCatalog.map((tag) => ({ slug: tag.slug }));
}

export default function StoreTagPage({ params }: { params: { slug: string } }) {
  const tag = findStoreTag(params.slug) || storeTagCatalog[0];
  return (
    <SegmentedCatalog
      title={`Etiqueta de tienda: ${tag.label}`}
      subtitle={tag.description}
      marker={tag.label}
      storeTagLabel={tag.label as 'En vitrina' | 'Pedido por encargo' | 'Restock prioritario' | 'Preventa Wijutopia' | 'Torneo/Liga' | 'Accesorio TCG'}
      heroGradient="from-slate-900 to-wiju-crimson"
    />
  );
}
