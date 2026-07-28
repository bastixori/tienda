import React, { useState } from 'react';
import { X, Star, ShoppingBag, ShieldCheck, Cpu, Check, Zap } from 'lucide-react';

export default function ProductModal({ product, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(price * 1000);
  };

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-3xl bg-slate-900 border-slate-700/60 overflow-hidden relative max-h-[90vh] flex flex-col md:flex-row shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Section */}
        <div className="w-full md:w-1/2 bg-slate-950 p-6 flex items-center justify-center relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full max-h-80 object-cover rounded-2xl shadow-lg"
          />
          {product.badge && (
            <span className="absolute top-6 left-6 badge-tech shadow-lg">
              {product.badge}
            </span>
          )}
        </div>

        {/* Product Info & Specs Section */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">
              {product.category}
            </div>

            <h2 className="text-xl md:text-2xl font-extrabold text-white mb-3">
              {product.name}
            </h2>

            {/* Rating & Price */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1 text-sm text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-bold text-white">{product.rating}</span>
                <span className="text-slate-400 text-xs">({product.reviewsCount} opiniones)</span>
              </div>
              <span className="badge-green">En Stock ({product.stock} unidades)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-2xl font-black text-white">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-sm text-slate-500 line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>

            <p className="text-slate-300 text-xs md:text-sm mb-6 leading-relaxed">
              {product.description}
            </p>

            {/* Technical Specifications */}
            <div className="mb-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                Especificaciones Técnicas
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {product.specs?.map((spec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Add to Cart Controls */}
          <div className="pt-4 border-t border-slate-800 flex items-center gap-4">
            <div className="flex items-center border border-slate-700 rounded-xl bg-slate-950 overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-slate-300 hover:bg-slate-800 text-sm font-bold"
              >
                -
              </button>
              <span className="px-4 py-2 text-white font-bold text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-3 py-2 text-slate-300 hover:bg-slate-800 text-sm font-bold"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAdd}
              className={`flex-1 btn-primary justify-center ${
                added ? '!bg-emerald-500 !text-white' : ''
              }`}
            >
              {added ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>¡Agregado al Carrito!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>Agregar al Carrito</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
