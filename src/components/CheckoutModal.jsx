import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle2, Lock, Truck, ArrowLeft, Download } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  totalAmount,
  onClearCart,
  onAddOrderToAdmin
}) {
  const [step, setStep] = useState('shipping'); // 'shipping' | 'payment' | 'confirmation'
  const [paymentMethod, setPaymentMethod] = useState('webpay'); // 'webpay' | 'stripe' | 'transfer'
  
  // Shipping Form State
  const [formData, setFormData] = useState({
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@example.com',
    phone: '+56 9 8765 4321',
    address: 'Av. Providencia 1234, Apt 502',
    city: 'Santiago',
    region: 'Región Metropolitana'
  });

  const [createdOrder, setCreatedOrder] = useState(null);

  if (!isOpen) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(price * 1000);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCompletePayment = (e) => {
    e.preventDefault();
    
    // Generate Order
    const newOrder = {
      id: `NX-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleString('es-CL'),
      customer: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: `${formData.address}, ${formData.city}`,
      items: [...cart],
      total: totalAmount,
      status: 'Procesando',
      paymentMethod: paymentMethod === 'webpay' ? 'Webpay Plus (Transbank)' : paymentMethod === 'stripe' ? 'Stripe Credit Card' : 'Transferencia Directa'
    };

    onAddOrderToAdmin(newOrder);
    setCreatedOrder(newOrder);
    onClearCart();
    setStep('confirmation');

    // Trigger Celebration Confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-2xl bg-slate-900 border-slate-700/60 overflow-hidden relative shadow-2xl">
        
        {/* Close Button */}
        {step !== 'confirmation' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Steps Navigation */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Checkout Seguro NEXUS</h2>
              <p className="text-xs text-slate-400">Encriptación SSL de 256 bits</p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto">
          
          {/* STEP 1: Shipping Info */}
          {step === 'shipping' && (
            <form onSubmit={() => setStep('payment')} className="space-y-4">
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Truck className="w-4 h-4" /> 1. Datos de Envío
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Teléfono Móvil</label>
                  <input
                    type="text"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Ciudad / Comuna</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Dirección Completa de Entrega</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:border-cyan-400"
                />
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-slate-800">
                <div className="text-xs text-slate-400">
                  Total a pagar: <strong className="text-white text-sm">{formatPrice(totalAmount)}</strong>
                </div>
                <button type="submit" className="btn-primary">
                  <span>Continuar a Pago</span>
                  <Lock className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Payment Selection */}
          {step === 'payment' && (
            <form onSubmit={handleCompletePayment} className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setStep('shipping')}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
                  2. Método de Pago Seguro
                </h3>
              </div>

              <div className="space-y-3">
                <label
                  onClick={() => setPaymentMethod('webpay')}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'webpay'
                      ? 'bg-cyan-500/10 border-cyan-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2 border-cyan-400 flex items-center justify-center">
                      {paymentMethod === 'webpay' && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Webpay Plus (Transbank)</h4>
                      <p className="text-[11px] text-slate-400">Débito, Crédito Visa / Mastercard en cuotas</p>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-cyan-400" />
                </label>

                <label
                  onClick={() => setPaymentMethod('stripe')}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'stripe'
                      ? 'bg-cyan-500/10 border-cyan-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2 border-cyan-400 flex items-center justify-center">
                      {paymentMethod === 'stripe' && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Stripe International</h4>
                      <p className="text-[11px] text-slate-400">Tarjetas internacionales USD / EUR</p>
                    </div>
                  </div>
                  <Lock className="w-5 h-5 text-purple-400" />
                </label>
              </div>

              {/* Order Summary Recap */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-slate-300 mb-2">Resumen de Compra:</div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Cliente: {formData.name}</div>
                  <div>Dirección: {formData.address}, {formData.city}</div>
                  <div className="text-white font-bold pt-2 border-t border-slate-800 flex justify-between">
                    <span>Total Final:</span>
                    <span className="text-cyan-400 text-base">{formatPrice(totalAmount)}</span>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full btn-primary justify-center text-sm py-3.5">
                <span>Confirmar Pago y Finalizar Pedido</span>
                <CheckCircle2 className="w-5 h-5" />
              </button>
            </form>
          )}

          {/* STEP 3: Order Confirmation Screen */}
          {step === 'confirmation' && createdOrder && (
            <div className="text-center py-6 space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white mb-1">¡Gracias por tu compra!</h3>
                <p className="text-xs text-slate-400">
                  Tu pedido ha sido recibido y enviado a preparación.
                </p>
              </div>

              {/* Receipt Box */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-left max-w-md mx-auto space-y-3 text-xs">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Número de Orden</div>
                    <div className="text-sm font-extrabold text-cyan-400">{createdOrder.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Fecha</div>
                    <div className="text-slate-300">{createdOrder.date}</div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Productos Pedidos</div>
                  <ul className="space-y-1">
                    {createdOrder.items.map((it) => (
                      <li key={it.id} className="flex justify-between text-slate-300">
                        <span>{it.quantity}x {it.name}</span>
                        <span className="font-bold">{formatPrice(it.price * it.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                  <span>Total Pagado:</span>
                  <span className="text-emerald-400">{formatPrice(createdOrder.total)}</span>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={onClose}
                  className="btn-primary"
                >
                  Volver a la Tienda
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
