import React from 'react';
import { ShieldCheck, Truck, Cpu, BatteryCharging } from 'lucide-react';

export default function Hero({ activeCategory, setSelectedCategory, categories }) {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 border-b border-slate-800/60">
      {/* Glow Backdrop */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container px-4">
        {/* Main Banner */}
        <div className="glass-panel p-8 sm:p-12 relative overflow-hidden bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-950/95 border-cyan-500/20 shadow-2xl">
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-6">
              <BatteryCharging className="w-4 h-4 animate-pulse" />
              <span>Tecnología Recargable USB-C & Alta Gamma</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              Gadgets Inteligentes para tu <span className="gradient-text">Vida Digital</span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">
              Explora nuestra colección seleccionada de lámparas táctiles recargables, cables con pantalla digital de vatios, audífonos ANC Hi-Res y estaciones de carga inalámbricas.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Envío Exprés</h4>
                  <p className="text-[11px] text-slate-400">Despacho en 24h</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Garantía Tech</h4>
                  <p className="text-[11px] text-slate-400">12 meses oficial</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Calidad MVP</h4>
                  <p className="text-[11px] text-slate-400">Testeo de fábrica</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto py-6 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black border-cyan-300 shadow-lg shadow-cyan-500/20 scale-105'
                  : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
