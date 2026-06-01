import SegmentedCatalog from '@/components/SegmentedCatalog';

export default function RestockPage() {
  return <SegmentedCatalog title="Restock y productos agotados" subtitle="Rama para productos agotados priorizados por vistas, clics, solicitudes y mensajes oficiales de WhatsApp." marker="RESTOCK" branchLabel="agotado" heroGradient="from-black to-wiju-crimson" />;
}
