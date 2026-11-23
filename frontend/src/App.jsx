import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderReceiptModal from './components/OrderReceiptModal';
import AdminPortal from './components/AdminPortal';
import AuthModal from './components/AuthModal';
import OrderHistoryModal from './components/OrderHistoryModal';
import { fetchProducts, fetchHealth } from './api/client';
import { SlidersHorizontal, Check, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'footwear', name: 'Footwear' },
  { id: 'apparel', name: 'Apparel' },
  { id: 'lifestyle', name: 'Lifestyle' }
];

export default function App() {
  // Navigation View Mode: 'store' | 'admin'
  const [viewMode, setViewMode] = useState('store');

  // Logged In User State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('velora_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');

  // Pagination (12 products per page across the 50 catalog items)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Cart state persisted to localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('velora_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist state persisted to localStorage
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('velora_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Applied Promo Code state
  const [appliedPromo, setAppliedPromo] = useState(null);

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [orderResult, setOrderResult] = useState(null);

  // Health Status
  const [healthStatus, setHealthStatus] = useState('checking');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('velora_user', JSON.stringify(user));
    showToast(`Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('velora_user');
    showToast('Signed out successfully');
  };

  // Reset to page 1 when filter/search/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm, sortBy]);

  // Persist cart
  useEffect(() => {
    localStorage.setItem('velora_cart', JSON.stringify(cart));
  }, [cart]);

  // Persist wishlist
  useEffect(() => {
    localStorage.setItem('velora_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Check backend health
  useEffect(() => {
    async function checkApi() {
      const res = await fetchHealth();
      setHealthStatus(res.status === 'healthy' ? 'healthy' : 'offline');
    }
    checkApi();
    const interval = setInterval(checkApi, 20000);
    return () => clearInterval(interval);
  }, []);

  // Fetch products
  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchProducts({
        category: selectedCategory,
        search: searchTerm,
        sort: sortBy
      });
      setProducts(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadProducts, 200);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchTerm, sortBy]);

  // Cart Handlers
  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`Added "${product.title}" to bag`);
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const handleRemoveCartItem = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  // Wishlist Handlers
  const handleToggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        showToast(`Removed from Wishlist`);
        return prev.filter((item) => item.id !== product.id);
      } else {
        showToast(`Saved to Wishlist ❤️`);
        return [...prev, product];
      }
    });
  };

  const handleOrderSuccess = (result) => {
    setCart([]);
    setAppliedPromo(null);
    setIsCheckoutOpen(false);
    setOrderResult(result);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Pagination Math
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = products.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // RENDER ADMIN PORTAL IF TOGGLED
  if (viewMode === 'admin') {
    return (
      <AdminPortal
        onBackToStore={() => {
          setViewMode('store');
          loadProducts();
        }}
      />
    );
  }

  // RENDER CUSTOMER STOREFRONT
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-page)', width: '100%' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 100,
          backgroundColor: '#0f172a',
          border: '1px solid #3b82f6',
          boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
          color: '#ffffff',
          padding: '0.85rem 1.45rem',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          fontSize: '0.9rem',
          fontWeight: 700
        }} className="animate-fade-in">
          <Check size={18} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navbar with Big Live Search Popover, User Auth, Orders & Badges */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenAdmin={() => setViewMode('admin')}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onLogout={handleLogout}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        products={products}
        onSelectProduct={(p) => setQuickViewProduct(p)}
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        healthStatus={healthStatus}
      />

      {/* Main Container - Full Screen Immersion */}
      <main className="container" style={{ flex: 1, paddingBottom: '3.5rem' }}>
        {/* Big Expansive Hero Section */}
        {selectedCategory === 'all' && !searchTerm && currentPage === 1 && (
          <HeroBanner onShopNow={() => {
            const el = document.getElementById('catalog');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }} />
        )}

        {/* Catalog Header & Controls - Prominent Wide Layout */}
        <section id="catalog" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: '2.5rem 0 2rem 0',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}>
          <div>
            <h2 style={{ fontSize: 'clamp(2rem, 2.6vw, 2.5rem)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>
              {selectedCategory === 'all' ? 'All Products Catalog' : `${selectedCategory} Collection`}
            </h2>
            <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600 }}>
              Showing {products.length > 0 ? `${startIndex + 1}–${Math.min(startIndex + itemsPerPage, products.length)}` : 0} of {products.length} products
            </span>
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <SlidersHorizontal size={20} color="#64748b" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: '1.5px solid #cbd5e1',
                padding: '0.75rem 1.35rem',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <option value="default">Featured First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </section>

        {/* Big Rich Product Grid - Responsive Full Width */}
        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '420px',
            gap: '1.25rem'
          }}>
            <RefreshCw size={42} className="animate-spin" color="#2563eb" />
            <span style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 700 }}>Loading catalog items...</span>
          </div>
        ) : error ? (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '2rem',
            borderRadius: '16px',
            textAlign: 'center',
            fontWeight: 700
          }}>
            <p>Could not connect to backend store: {error}</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '4.5rem',
            textAlign: 'center',
            color: '#64748b',
            boxShadow: 'var(--shadow-card)'
          }}>
            <p style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: '#0f172a', fontWeight: 800 }}>
              No products found for "{searchTerm}".
            </p>
            <p style={{ fontSize: '1rem' }}>Try searching for "headphones", "watch", "shoes", or "jacket".</p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '2rem',
              width: '100%'
            }}>
              {currentProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onQuickView={setQuickViewProduct}
                  isWishlisted={wishlist.some(w => w.id === product.id)}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '3.5rem'
              }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.65rem 1.25rem',
                    borderRadius: '12px',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    color: currentPage === 1 ? '#94a3b8' : '#0f172a',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ChevronLeft size={16} />
                  <span>Prev</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      backgroundColor: currentPage === page ? '#2563eb' : '#ffffff',
                      color: currentPage === page ? '#ffffff' : '#0f172a',
                      border: currentPage === page ? '1.5px solid #2563eb' : '1.5px solid #cbd5e1',
                      boxShadow: currentPage === page ? '0 4px 14px rgba(37, 99, 235, 0.35)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.65rem 1.25rem',
                    borderRadius: '12px',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    color: currentPage === totalPages ? '#94a3b8' : '#0f172a',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '2.75rem 2rem 2.25rem 2rem',
        marginTop: 'auto',
        width: '100%'
      }}>
        <div className="container" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1rem',
              color: '#ffffff'
            }}>
              V
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              VELORA E-STORE
            </span>
          </div>

          <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: '720px', lineHeight: 1.6 }}>
            50 curated items catalog across Electronics, Accessories, Footwear, Apparel, and Lifestyle. Immersive full-screen design with Admin Management and simulated 3D card payment.
          </p>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1.25rem',
            fontSize: '0.85rem',
            color: '#64748b',
            fontWeight: 700
          }}>
            <span>50 Products</span>
            <span>•</span>
            <span>Admin Control Center</span>
            <span>•</span>
            <span>Coupon: DEVOPS20</span>
            <span>•</span>
            <span>3D Card Flip</span>
          </div>

          <span style={{ fontSize: '0.775rem', color: '#94a3b8' }}>
            © {new Date().getFullYear()} Velora E-Store. Ready for your DevOps journey.
          </span>
        </div>
      </footer>

      {/* Drawers & Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        appliedPromo={appliedPromo}
        onApplyPromo={setAppliedPromo}
        onRemovePromo={() => setAppliedPromo(null)}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        items={wishlist}
        onRemoveFromWishlist={(id) => setWishlist(prev => prev.filter(w => w.id !== id))}
        onMoveToCart={(product) => handleAddToCart(product)}
      />

      <ProductModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        isWishlisted={quickViewProduct ? wishlist.some(w => w.id === quickViewProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        appliedPromo={appliedPromo}
        currentUser={currentUser}
        onOrderSuccess={handleOrderSuccess}
      />

      <OrderReceiptModal
        orderResult={orderResult}
        onClose={() => setOrderResult(null)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleLoginSuccess}
      />

      <OrderHistoryModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        currentUser={currentUser}
        onOpenReceipt={(orderData) => {
          setIsOrdersOpen(false);
          setOrderResult({
            success: true,
            orderId: orderData.orderId,
            transactionId: orderData.transactionId,
            card_last4: '4242',
            card_brand: 'Visa',
            customer_name: orderData.customer_name,
            customer_email: orderData.customer_email,
            shipping_address: orderData.shipping_address,
            shipping_city: orderData.shipping_city,
            shipping_postal_code: orderData.shipping_postal_code,
            subtotal: orderData.subtotal,
            tax: orderData.tax,
            shipping_fee: orderData.shipping_fee,
            total_amount: orderData.total_amount,
            items: orderData.items
          });
        }}
      />
    </div>
  );
}
