'use client';

import { useCart } from '@/components/CartContext';

type AccountModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const { itemCount } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-950 dark:text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-purple-700 dark:text-purple-300">Cuenta de prueba</p>
            <h2 className="mt-3 text-3xl font-black">Navegación anónima</h2>
          </div>
          <button onClick={onClose} className="rounded-full border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            Cerrar
          </button>
        </div>

        <div className="mt-6 space-y-4 rounded-3xl border border-blue-200 bg-blue-50 p-5 text-sm font-bold text-blue-900 dark:border-blue-600 dark:bg-blue-950/40 dark:text-blue-100">
          <p>Este ícono no abre un perfil real. Wijutopia funciona como catálogo público y carrito de prueba.</p>
          <p>Los pedidos y pagos son simulados. No se solicita información bancaria ni se procesan cobros.</p>
          <p>Si deseas probar la opción de pago, agrega artículos al carrito y autoriza el pago de prueba en el carrito.</p>
        </div>

        <div className="mt-6 grid gap-3 rounded-3xl border border-slate-200 bg-slate-100 p-5 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Estado actual</p>
          <p>{itemCount} artículo{itemCount !== 1 ? 's' : ''} agregado{itemCount !== 1 ? 's' : ''} al carrito.</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">No se guarda usuario ni sesión, pero el carrito se conserva localmente en tu navegador.</p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a href="/client" className="inline-flex items-center justify-center rounded-2xl bg-purple-700 px-5 py-3 text-sm font-black text-white transition hover:bg-purple-800">Ir al catálogo</a>
          <button onClick={onClose} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-5 py-3 text-sm font-black text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800">Cerrar</button>
        </div>
      </div>
    </div>
  );
}
