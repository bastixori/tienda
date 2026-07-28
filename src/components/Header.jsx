import React from 'react';
import { ShoppingBag, Search, Zap, Sun, Moon, LayoutDashboard, Store } from 'lucide-react';

export default function Header({ 
  cartCount, 
  onOpenCart, 
  searchQuery, 
  setSearchQuery, 
  theme, 
  toggleTheme, 
  isAdminView, 
  setIsAdminView 
}) {
  return (
    <header className="glass-nav sticky top-0 z-40 w-full transition-all">
      <div className="container flex items-center justify-between h-20 px-4">
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setIsAdminView(false)}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Zap className="w-6 h-6 text-black fill-black" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
              NEXUS <span className="gradient-text">TECH</span>
            </span>
            <span className="text-[10px] font-bold text-cyan-400 tracking-widest uppercase block -mt-1">
              Store & Gadgets MVP
            </span>
          </div>
        </div>

        {/* Search Bar (Store View) */}
        {!isAdminView && (
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar lámparas, cables USB-C, audífonos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/60 text-slate-200 text-sm rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-slate-500"
            />
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Admin Mode Toggle */}
          <button
            onClick={() => setIsAdminView(!isAdminView)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              isAdminView 
                ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 shadow-sm shadow-cyan-500/20'
                : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
            title="Cambiar entre Vista Tienda y Panel de Administración"
          >
            {isAdminView ? (
              <>
                <Store className="w-4 h-4" />
                <span>Ver Tienda</span>
              </>
            ) : (
              <>
                <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                <span>Admin Shopify</span>
              </>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn-icon"
            title="Cambiar Tema"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          {/* Cart Icon & Count Badge */}
          {!isAdminView && (
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 text-white hover:border-cyan-400 transition-all flex items-center gap-2 group"
            >
              <ShoppingBag className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm hidden sm:inline">Carrito</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-cyan-400 text-black font-extrabold text-xs flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
