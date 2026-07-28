import React, { useState } from 'react';
import { Plus, Package, ShoppingCart, DollarSign, TrendingUp, Edit2, Trash2, CheckCircle2, Clock } from 'lucide-react';

export default function AdminDashboard({ products, orders, onAddProduct, onDeleteProduct, onUpdateOrderStatus }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '',
    category: 'Lámparas Recargables',
    price: '',
    stock: '',
    badge: 'NUEVO',
    description: '',
    image: '/assets/lamp.jpg'
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(price * 1000);
  };

  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);

  const handleSubmitNewProduct = (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price) return;

    const created = {
      id: `prod-${Date.now()}`,
      name: newProd.name,
      category: newProd.category,
      price: parseFloat(newProd.price),
      oldPrice: parseFloat(newProd.price) * 1.2,
      rating: 5.0,
      reviewsCount: 1,
      stock: parseInt(newProd.stock) || 10,
      badge: newProd.badge,
      image: newProd.image,
      description: newProd.description || 'Producto de alta tecnología recargable MVP.',
      specs: ['Garantía oficial 12 meses', 'Tecnología inteligente USB-C']
    };

    onAddProduct(created);
    setShowAddForm(false);
    setNewProd({
      name: '',
      category: 'Lámparas Recargables',
      price: '',
      stock: '',
      badge: 'NUEVO',
      description: '',
      image: '/assets/lamp.jpg'
    });
  };

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            Panel de Administración <span className="gradient-text">Shopify Style</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Gestiona tu catálogo de productos de tecnología, inventario y órdenes en tiempo real.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Nuevo Producto</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 bg-slate-900/80 border-slate-800">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Ventas Totales</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{formatPrice(totalRevenue)}</div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1">↑ +18% esta semana</div>
        </div>

        <div className="glass-panel p-5 bg-slate-900/80 border-slate-800">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Pedidos Recibidos</span>
            <ShoppingCart className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{orders.length} órdenes</div>
          <div className="text-[11px] text-cyan-400 font-semibold mt-1">NEXUS Store Live</div>
        </div>

        <div className="glass-panel p-5 bg-slate-900/80 border-slate-800">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Productos Activos</span>
            <Package className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{products.length} ítems</div>
          <div className="text-[11px] text-purple-400 font-semibold mt-1">Catálogo MVP</div>
        </div>

        <div className="glass-panel p-5 bg-slate-900/80 border-slate-800">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Estado Servidor</span>
            <TrendingUp className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">Online</div>
          <div className="text-[11px] text-slate-400 mt-1">Antigravity Local Host</div>
        </div>
      </div>

      {/* MODAL: ADD PRODUCT FORM */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel w-full max-w-lg bg-slate-900 border-slate-700 p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Agregar Producto al Catálogo</h3>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNewProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Lámpara Táctica Recargable 2000LM"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Categoría</label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Lámparas Recargables">Lámparas Recargables</option>
                    <option value="Cables & Carga Rápida">Cables & Carga Rápida</option>
                    <option value="Audio & Audífonos">Audio & Audífonos</option>
                    <option value="Gadgets Tech">Gadgets Tech</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Precio (en miles CLP)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="Ej. 29.99"
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    placeholder="15"
                    value={newProd.stock}
                    onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Insignia (Badge)</label>
                  <input
                    type="text"
                    placeholder="MÁS VENDIDO / NUEVO"
                    value={newProd.badge}
                    onChange={(e) => setNewProd({ ...newProd, badge: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Descripción</label>
                <textarea
                  rows="3"
                  placeholder="Detalles técnicos del gadget..."
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCTS INVENTORY TABLE */}
      <div className="glass-panel p-6 bg-slate-900/80 border-slate-800">
        <h3 className="text-base font-bold text-white mb-4">Inventario de Productos ({products.length})</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-3 px-3">Producto</th>
                <th className="py-3 px-3">Categoría</th>
                <th className="py-3 px-3">Precio</th>
                <th className="py-3 px-3">Stock</th>
                <th className="py-3 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 text-slate-200">
                  <td className="py-3 px-3 font-semibold flex items-center gap-3">
                    <img src={p.image} alt="" className="w-8 h-8 rounded-lg object-cover bg-slate-950" />
                    <span>{p.name}</span>
                  </td>
                  <td className="py-3 px-3 text-cyan-400">{p.category}</td>
                  <td className="py-3 px-3 font-bold text-white">{formatPrice(p.price)}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      p.stock > 10 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {p.stock} unidades
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onDeleteProduct(p.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                      title="Eliminar del catálogo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDERS LIST */}
      <div className="glass-panel p-6 bg-slate-900/80 border-slate-800">
        <h3 className="text-base font-bold text-white mb-4">Órdenes Recibidas ({orders.length})</h3>

        {orders.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No hay órdenes registradas aún. Haz una compra desde la tienda para probar el flujo.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => (
              <div key={ord.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-extrabold text-cyan-400 text-sm">{ord.id}</span>
                    <span className="text-slate-500">• {ord.date}</span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-[10px]">
                      {ord.status}
                    </span>
                  </div>
                  <div className="text-slate-300 font-semibold">{ord.customer} ({ord.email})</div>
                  <div className="text-slate-400 text-[11px]">{ord.address} • {ord.paymentMethod}</div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-extrabold text-emerald-400">{formatPrice(ord.total)}</div>
                  <div className="text-[11px] text-slate-400">{ord.items?.length || 0} productos</div>
                  <button
                    onClick={() => onUpdateOrderStatus(ord.id, ord.status === 'Procesando' ? 'Enviado' : 'Entregado')}
                    className="mt-2 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                  >
                    Marcar como {ord.status === 'Procesando' ? 'Enviado 🚚' : 'Entregado ✅'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
