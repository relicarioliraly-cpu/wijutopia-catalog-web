'use client';

import { useMemo, useState } from 'react';
import { CartIcon, TagIcon } from '@/components/Icons';
import { useCart } from '@/components/CartContext';
import { trackCheckoutAttempt } from '@/lib/apiService';

const PAYMENT_PROMPT = 'AUTORIZO PAGO DE PRUEBA';

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, itemCount, total, removeItem, updateQuantity, clearCart } = useCart();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'yape'>('card');
  const [authorizationText, setAuthorizationText] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<string | null>(null);

  const subtotal = useMemo(() => total, [total]);
  const canSubmit = isConfirmed && authorizationText.trim() === PAYMENT_PROMPT && cart.length > 0;

  const handleCheckout = async () => {
    if (!canSubmit) return;

    try {
      await trackCheckoutAttempt();
      setCheckoutResult(`✅ Pago de prueba autorizado con ${paymentMethod === 'card' ? 'tarjeta' : 'Yape'}. No se realizó ningún cobro real.`);
      clearCart();
      setShowPayment(false);
      setAuthorizationText('');
      setIsConfirmed(false);
    } catch (error) {
      setCheckoutResult('⚠️ Hubo un problema al procesar la autorización de pago de prueba. Intenta de nuevo.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 px-4 py-6 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-950 dark:text-white">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
          <div className="flex items-center gap-3 text-xl font-black text-slate-900 dark:text-white">
            <CartIcon className="h-6 w-6" /> Carrito de compra de prueba
          </div>
          <button onClick={onClose} className="rounded-full border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            Cerrar
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="space-y-4 rounded-3xl border border-dashed border-purple-300 bg-purple-50 p-8 text-center text-slate-800 dark:border-purple-700 dark:bg-slate-900 dark:text-white">
            <p className="text-xl font-black">Tu carrito está vacío</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">Agrega cartas al carrito para iniciar un pago de prueba con tarjeta o Yape.</p>
            <a href="/client" onClick={onClose} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-wiju-signMagenta px-5 py-3 text-sm font-black text-white shadow-neon transition hover:bg-purple-700">
              <TagIcon className="h-4 w-4" /> Volver al catálogo
            </a>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <section className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Resumen del carrito</p>
                <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{itemCount} artículo{itemCount !== 1 ? 's' : ''}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Total de prueba: S/ {subtotal.toFixed(2)}</p>
              </div>

              <div className="space-y-4">
                {cart.map((item) => (
                  <article key={item.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950">
                    <div className="flex items-start gap-4">
                      <img src={item.image} alt={item.name} className="h-20 w-20 rounded-3xl object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-black text-slate-900 dark:text-white">{item.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">{item.game} · {item.rarity}</p>
                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">S/ {(item.price * item.quantity).toFixed(2)}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="rounded-full border border-slate-300 px-3 py-1 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">-</button>
                          <span className="min-w-[1.75rem] text-center text-sm font-black">{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="rounded-full border border-slate-300 px-3 py-1 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">+</button>
                          <button type="button" onClick={() => removeItem(item.id)} className="ml-auto rounded-2xl border border-red-300 px-3 py-1 text-xs font-bold text-red-600 transition hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30">Eliminar</button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
              <div className="rounded-3xl border border-purple-300 bg-purple-50 p-4 text-sm font-black uppercase tracking-[0.2em] text-purple-700 dark:border-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                Pago de prueba
              </div>
              <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Método</p>
                <div className="grid gap-2">
                  <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-300 px-3 py-3 text-sm dark:border-slate-700">
                    <input type="radio" name="payment_method" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="h-4 w-4" />
                    Tarjeta de prueba
                  </label>
                  <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-300 px-3 py-3 text-sm dark:border-slate-700">
                    <input type="radio" name="payment_method" value="yape" checked={paymentMethod === 'yape'} onChange={() => setPaymentMethod('yape')} className="h-4 w-4" />
                    Yape de prueba
                  </label>
                </div>
              </div>

              <div className="rounded-3xl border border-amber-300 bg-amber-50 p-4 text-sm font-black uppercase tracking-[0.18em] text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
                <p>NO OFICIAL · SOLO PRUEBAS</p>
                <p className="mt-2 text-xs font-normal text-slate-600 dark:text-slate-300">Este flujo simula autorización. No se realiza ningún cargo real a tu tarjeta o Yape.</p>
              </div>

              <button type="button" onClick={() => setShowPayment(true)} className="w-full rounded-2xl bg-wiju-signMagenta px-4 py-3 font-black text-white transition hover:bg-purple-700 dark:bg-wiju-moonGold dark:text-slate-950 dark:hover:bg-yellow-300">
                Iniciar pago de prueba
              </button>

              {showPayment && (
                <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-100">Autorizar pago seguro</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Escribe exactamente <span className="font-mono text-slate-900 dark:text-slate-200">{PAYMENT_PROMPT}</span> y acepta el aviso.</p>
                  <input value={authorizationText} onChange={(event) => setAuthorizationText(event.target.value)} placeholder="AUTORIZO PAGO DE PRUEBA" className="mt-3 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                  <label className="mt-3 flex items-center gap-3 text-sm">
                    <input type="checkbox" checked={isConfirmed} onChange={(event) => setIsConfirmed(event.target.checked)} className="h-4 w-4" />
                    Entiendo que este pago es solo una prueba y no se cobrará.
                  </label>
                  <button type="button" onClick={handleCheckout} disabled={!canSubmit} className="mt-4 w-full rounded-2xl bg-wiju-moonGold px-4 py-3 font-black text-slate-950 transition disabled:cursor-not-allowed disabled:opacity-50 dark:bg-wiju-signMagenta dark:text-white">
                    Autorizar pago de prueba
                  </button>
                </div>
              )}

              {checkoutResult && <p className="rounded-2xl bg-slate-100 p-3 text-sm dark:bg-slate-800">{checkoutResult}</p>}
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
