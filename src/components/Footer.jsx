import React from 'react';
import { Zap, ShieldCheck, Truck, RotateCcw, CreditCard } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-950/90 text-slate-400 text-xs">
      <div className="container py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-400 flex items-center justify-center text-black font-black">
                ⚡
              </div>
              <span className="text-lg font-black text-white">NEXUS TECH</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Tu tienda e-commerce MVP de gadgets de alta tecnología. Lámparas recargables USB-C, audífonos ANC e innovación constante.
            </p>
          </div>

          {/* Guarantees */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">Garantía y Confianza</h4>
            <ul className="space-y-2 text-[11px]">
              <li className="flex items-center gap-2"><Truck className="w-4 h-4 text-cyan-400" /> Despacho a todo Chile</li>
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-cyan-400" /> 12 meses de garantía oficial</li>
              <li className="flex items-center gap-2"><RotateCcw className="w-4 h-4 text-cyan-400" /> Devolución sin costo 30 días</li>
            </ul>
          </div>

          {/* Categories Links */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">Categorías Top</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li className="hover:text-cyan-400 cursor-pointer">Lámparas Recargables USB-C</li>
              <li className="hover:text-cyan-400 cursor-pointer">Cables Display Vatios 100W</li>
              <li className="hover:text-cyan-400 cursor-pointer">Audífonos ANC Cancelación Ruido</li>
              <li className="hover:text-cyan-400 cursor-pointer">Estaciones MagSafe Wireless</li>
            </ul>
          </div>

          {/* Payment Badges */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">Pagos Seguros</h4>
            <div className="flex flex-wrap gap-2 text-white font-bold">
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[10px]">Webpay Plus</span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[10px]">Stripe</span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[10px]">Transbank</span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[10px]">Visa / Mastercard</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 text-center text-slate-500 text-[11px]">
          © {new Date().getFullYear()} NEXUS TECH E-Commerce. Proyecto construido en local con Google Antigravity.
        </div>
      </div>
    </footer>
  );
}
