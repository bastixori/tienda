import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, Zap } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}) {
  const [coupon, setCoupon] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(price * 1000);
  };

  const rawSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = rawSubtotal * appliedDiscount;
  const subtotal = rawSubtotal - discountAmount;
  const freeShippingThreshold = 50.000; // 50k CLP
  const currentTotalCLP = rawSubtotal * 1000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - currentTotalCLP);
  const shippingCost = currentTotalCLP >= freeShippingThreshold || cart.length === 0 ? 0 : 3.990;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (coupon.trim().toUpperCase() === 'MVP10') {
      setAppliedDiscount(0.10); // 10% off
      setCouponError('');
    } else {
      setCouponError('Cupón inválido. Prueba con "MVP10"');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-fade-in flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 text-white h-full flex flex-col shadow-2xl animate-slide-right">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Tu Carrito Tech</h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              {cart.reduce((a, b) => a + b.quantity, 0)} ítems
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800/60">
          <div className="text-xs text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
            <span>
              {remainingForFreeShipping > 0
                ? `¡Agrega ${formatPrice(remainingForFreeShipping / 1000)} para Envío GRATIS!`
                : '🎉 ¡Felicidades! Tienes Envío GRATIS'}
            </span>
            <span className="font-bold text-cyan-400">
              {Math.min(100, Math.round((currentTotalCLP / freeShippingThreshold) * 100))}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(100, (currentTotalCLP / freeShippingThreshold) * 100)}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-4">
              <ShoppingBag className="w-16 h-16 mx-auto text-slate-700 stroke-1" />
              <p className="font-bold text-base text-slate-300">Tu carrito está vacío</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Explora nuestras lámparas recargables, audífonos y cables USB-C de alta tecnología.
              </p>
              <button
                onClick={onClose}
                className="btn-secondary text-xs mt-2"
              >
                Ver Productos
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="glass-panel p-3.5 flex gap-3 items-center bg-slate-950/60 border-slate-800 hover:border-slate-700 transition-all"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-xl bg-slate-900 border border-slate-800 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate mb-1">
                    {item.name}
                  </h4>
                  <div className="text-xs font-extrabold text-cyan-400 mb-2">
                    {formatPrice(item.price)}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-slate-700 rounded-lg bg-slate-900">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-xs text-slate-300 hover:bg-slate-800"
                      >
                        -
                      </button>
                      <span className="px-2 py-0.5 text-xs text-white font-bold">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-xs text-slate-300 hover:bg-slate-800"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors ml-auto"
                      title="Eliminar ítem"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Summary */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-slate-800 bg-slate-950/90 space-y-4">
            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cupón (ej. MVP10)"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-xs rounded-xl pl-9 pr-3 py-2.5 text-white uppercase tracking-wider focus:outline-none focus:border-cyan-400"
                />
              </div>
              <button type="submit" className="btn-secondary text-xs px-4">
                Aplicar
              </button>
            </form>
            {couponError && <p className="text-[11px] text-rose-400 font-bold">{couponError}</p>}
            {appliedDiscount > 0 && (
              <p className="text-[11px] text-emerald-400 font-bold">✓ Cupón MVP10 Aplicado (-10%)</p>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-white">{formatPrice(subtotal)}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Descuento (10%)</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Despacho</span>
                <span>{shippingCost === 0 ? <strong className="text-emerald-400">GRATIS</strong> : formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
                <span>Total a Pagar</span>
                <span className="gradient-text">{formatPrice(subtotal + shippingCost)}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={() => {
                onClose();
                onProceedToCheckout(subtotal + shippingCost, discountAmount);
              }}
              className="w-full btn-primary justify-center text-sm py-3.5"
            >
              <span>Ir al Checkout de Pago</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
