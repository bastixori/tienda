import React from 'react';
import { Star, ShoppingCart, Eye, Check } from 'lucide-react';

export default function ProductCard({ product, onQuickView, onAddToCart, isAdded }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(price * 1000);
  };

  return (
    <div className="product-card glass-panel flex flex-col justify-between p-4 group">
      <div>
        {/* Product Image & Badge Overlay */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 mb-4 flex items-center justify-center">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // Fallback placeholder if image load fails
              e.target.src = "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80";
            }}
          />

          {/* Top Badge */}
          {product.badge && (
            <span className="absolute top-3 left-3 badge-tech shadow-md">
              {product.badge}
            </span>
          )}

          {/* Quick View Button */}
          <button
            onClick={() => onQuickView(product)}
            className="absolute bottom-3 right-3 p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-cyan-400 hover:text-black shadow-lg"
            title="Vista Rápida"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Category & Title */}
        <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
          {product.category}
        </div>

        <h3 
          onClick={() => onQuickView(product)}
          className="text-base font-bold text-white line-clamp-2 hover:text-cyan-400 cursor-pointer transition-colors mb-2"
        >
          {product.name}
        </h3>

        {/* Rating & Stock */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-200">{product.rating}</span>
            <span>({product.reviewsCount})</span>
          </div>
          <span className="text-emerald-400 font-semibold">Stock: {product.stock} u.</span>
        </div>
      </div>

      {/* Pricing & Add to Cart Action */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div>
          <div className="text-lg font-extrabold text-white">
            {formatPrice(product.price)}
          </div>
          {product.oldPrice && (
            <div className="text-xs text-slate-500 line-through">
              {formatPrice(product.oldPrice)}
            </div>
          )}
        </div>

        <button
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
          className={`btn-primary !px-3.5 !py-2.5 text-xs font-bold ${
            isAdded ? '!bg-emerald-500 !text-white' : ''
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4" />
              <span>Agregado</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              <span>Agregar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
