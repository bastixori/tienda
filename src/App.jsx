import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';

import { INITIAL_PRODUCTS, CATEGORIES } from './data/products';
import { Sparkles, ShoppingBag } from 'lucide-react';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('nexus_theme') || 'dark');
  
  // View mode state ('store' vs 'admin')
  const [isAdminView, setIsAdminView] = useState(false);

  // Products catalog state
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('nexus_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Cart state
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('nexus_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Orders state (for admin & checkout)
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('nexus_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Search & Filter state
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [activeModalProduct, setActiveModalProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutTotal, setCheckoutTotal] = useState(0);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState(null);
  const [addedItemIds, setAddedItemIds] = useState(new Set());

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('nexus_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('nexus_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('nexus_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nexus_theme', theme);
  }, [theme]);

  // Toggle Dark/Light Theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Toast Notification Helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Add to Cart Action
  const handleAddToCart = (product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });

    setAddedItemIds(prev => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedItemIds(prev => {
        const copy = new Set(prev);
        copy.delete(product.id);
        return copy;
      });
    }, 2000);

    showToast(`" ${product.name}" agregado al carrito`);
  };

  // Update Cart Quantity
  const handleUpdateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
  };

  // Remove Item from Cart
  const handleRemoveItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Admin: Add New Product
  const handleAddProduct = (newProduct) => {
    setProducts(prev => [newProduct, ...prev]);
    showToast(`Nuevo producto "${newProduct.name}" agregado al catálogo`);
  };

  // Admin: Delete Product
  const handleDeleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast("Producto eliminado del catálogo");
  };

  // Admin: Update Order Status
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(ord => ord.id === orderId ? { ...ord, status: newStatus } : ord));
    showToast(`Orden ${orderId} actualizada a "${newStatus}"`);
  };

  // Filtered Products Calculation
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotalCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col selection:bg-cyan-400 selection:text-black">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="toast-notification">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Header */}
      <Header
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        theme={theme}
        toggleTheme={toggleTheme}
        isAdminView={isAdminView}
        setIsAdminView={setIsAdminView}
      />

      {/* MAIN VIEW SWITCHER */}
      {isAdminView ? (
        <main className="flex-1">
          <AdminDashboard
            products={products}
            orders={orders}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        </main>
      ) : (
        <main className="flex-1">
          {/* Hero Section */}
          <Hero
            activeCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={CATEGORIES}
          />

          {/* Product Grid Section */}
          <section className="container py-12 px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-white">
                  Catálogo de <span className="gradient-text">Gadgets Tech</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Mostrando {filteredProducts.length} productos disponibles
                </p>
              </div>

              {selectedCategory !== 'Todos' && (
                <button
                  onClick={() => setSelectedCategory('Todos')}
                  className="text-xs font-bold text-cyan-400 hover:underline"
                >
                  Ver Todos los Productos
                </button>
              )}
            </div>

            {/* Empty Search Fallback */}
            {filteredProducts.length === 0 ? (
              <div className="glass-panel p-12 text-center text-slate-400 space-y-3">
                <p className="text-base font-bold text-slate-200">No se encontraron productos en esta búsqueda</p>
                <button
                  onClick={() => { setSelectedCategory('Todos'); setSearchQuery(''); }}
                  className="btn-secondary text-xs"
                >
                  Restablecer Filtros
                </button>
              </div>
            ) : (
              <div className="grid-products">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setActiveModalProduct(p)}
                    onAddToCart={handleAddToCart}
                    isAdded={addedItemIds.has(product.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {/* Global Footer */}
      <Footer />

      {/* Modals & Drawers */}
      <ProductModal
        product={activeModalProduct}
        onClose={() => setActiveModalProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={(total) => {
          setCheckoutTotal(total);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        totalAmount={checkoutTotal}
        onClearCart={() => setCart([])}
        onAddOrderToAdmin={(order) => setOrders(prev => [order, ...prev])}
      />
    </div>
  );
}
