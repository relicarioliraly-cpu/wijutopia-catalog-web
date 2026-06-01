'use client';

import { useEffect, useState } from 'react';

export default function LegalModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const accepted = window.sessionStorage.getItem('wijutopia_academic_notice_seen');
    if (!accepted) {
      setOpen(true);
    }
  }, []);

  const closeModal = () => {
    window.sessionStorage.setItem('wijutopia_academic_notice_seen', 'true');
    setOpen(false);
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="legal-modal-title">
      <section className="max-w-2xl rounded-[2rem] border border-wiju-gold/60 bg-wiju-cardLight p-7 shadow-card dark:bg-wiju-cardDark">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-wiju-crimson dark:text-wiju-gold">Aviso académico obligatorio</p>
        <h2 id="legal-modal-title" className="mt-3 text-3xl font-black">Esta no es una página oficial</h2>
        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700 dark:text-slate-200">
          <p>Este sitio es únicamente un prototipo para un examen de prueba. No representa legal, comercial ni oficialmente a Wijutopia, Wiju World, Pokémon, Yu-Gi-Oh!, Bandai, Digimon, One Piece, TCGPlayer, Cardmarket ni TradingCardMint.</p>
          <p>No procesa pagos reales, no confirma inventario oficial y no debe usarse para compras reales. Su propósito es demostrar arquitectura full-stack, catálogo, métricas, encuestas, pedidos de lanzamiento y reportes administrativos.</p>
        </div>
        <button type="button" onClick={closeModal} className="mt-6 w-full rounded-2xl bg-wiju-crimson px-5 py-3 font-black text-white dark:bg-wiju-gold dark:text-black">
          Entiendo que es un prototipo académico
        </button>
      </section>
    </div>
  );
}
