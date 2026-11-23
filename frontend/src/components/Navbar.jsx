import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Search, Heart, ShieldCheck, Activity, Sparkles, X, Star, Settings, User, Package, LogOut } from 'lucide-react';

export default function Navbar({
  cartCount,
  onOpenCart,
  wishlistCount,
  onOpenWishlist,
  onOpenAdmin,
  currentUser,
  onOpenAuth,
  onOpenOrders,
  onLogout,
  searchTerm,
  onSearchChange,
  products = [],
  onSelectProduct,
  categories,
  selectedCategory,
  onSelectCategory,
  healthStatus
}) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);

  // Filter live search preview results (up to 5 matching items)
  const searchResults = searchTerm.trim().length > 0
    ? products.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5)
    : [];

  // Close live search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-light)',
      boxShadow: 'var(--shadow-sm)',
      width: '100%'
    }}>
      {/* Top announcement bar - Full width & clean */}
      <div style={{
        backgroundColor: '#f1f5f9',
        borderBottom: '1px solid #e2e8f0',
        padding: '0.6rem clamp(1.25rem, 2.5vw, 3.5rem)',
        fontSize: '0.875rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#334155'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Sparkles size={16} color="#2563eb" />
          <span style={{ fontWeight: 600 }}>
            Special Promo: Use coupon <strong style={{ color: '#2563eb', backgroundColor: '#dbeafe', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>DEVOPS20</strong> for 20% off • Free Express Shipping on orders over $50
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Activity size={15} color={healthStatus === 'healthy' ? '#059669' : '#d97706'} />
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: healthStatus === 'healthy' ? '#059669' : '#d97706' }}>
              API Health: {healthStatus === 'healthy' ? 'Active & Connected' : 'Checking...'}
            </span>
          </div>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 600, color: '#64748b', fontSize: '0.825rem' }}>
            <ShieldCheck size={16} color="#059669" />
            100% Mock Sandbox Checkout
          </span>
        </div>
      </div>

      {/* Main navigation - Full Screen Wide Proportional */}
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '1rem',
        paddingBottom: '1rem',
        gap: '2rem'
      }}>
        {/* Brand */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }}
          onClick={() => onSelectCategory('all')}
        >
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '1.5rem',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
          }}>
            V
          </div>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05, color: '#0f172a' }}>
              VELORA
            </h1>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Concept Store
            </span>
          </div>
        </div>

        {/* Big Expanded Live Search Bar */}
        <div 
          ref={searchContainerRef}
          style={{
            flex: 1,
            maxWidth: '780px',
            position: 'relative'
          }}
        >
          <Search size={20} style={{
            position: 'absolute',
            left: '1.25rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#64748b'
          }} />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search across all 50 products (audio, watches, footwear, apparel, gear)..."
            style={{
              width: '100%',
              padding: '0.85rem 3rem 0.85rem 3.25rem',
              borderRadius: '9999px',
              backgroundColor: '#f8fafc',
              border: isSearchFocused ? '2px solid #2563eb' : '1.5px solid #cbd5e1',
              color: '#0f172a',
              fontSize: '1rem',
              fontWeight: 500,
              boxShadow: isSearchFocused ? '0 0 0 4px rgba(37, 99, 235, 0.15)' : 'none',
              transition: 'all 0.15s ease'
            }}
          />

          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'transparent',
                color: '#94a3b8',
                display: 'flex',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          )}

          {/* Floating Live Search Dropdown */}
          {isSearchFocused && searchTerm.trim().length > 0 && (
            <div 
              className="animate-fade-in"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.75rem',
                zIndex: 50,
                maxHeight: '360px',
                overflowY: 'auto'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '0.35rem 0.75rem 0.5rem' }}>
                Quick Matches ({searchResults.length})
              </div>

              {searchResults.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                  No matching products found.
                </div>
              ) : (
                searchResults.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      onSelectProduct(product);
                      setIsSearchFocused(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <img
                      src={product.image_url}
                      alt={product.title}
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #e2e8f0'
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {product.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                        <span>{product.category}</span>
                        <span>•</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Star size={12} fill="#d97706" color="#d97706" />
                          <span>{product.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#2563eb' }}>
                      ${Number(product.price).toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Actions (Auth, Orders, Admin, Wishlist, Cart) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* My Orders Button */}
          <button
            onClick={onOpenOrders}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.75rem 1.25rem',
              backgroundColor: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              borderRadius: '9999px',
              color: '#0f172a',
              fontWeight: 800,
              fontSize: '0.925rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#2563eb';
              e.currentTarget.style.backgroundColor = '#eff6ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.backgroundColor = '#f8fafc';
            }}
          >
            <Package size={17} color="#2563eb" />
            <span>My Orders</span>
          </button>

          {/* User Sign In / Profile Pill */}
          {currentUser ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: '#eff6ff',
              border: '1.5px solid #bfdbfe',
              borderRadius: '9999px',
              padding: '0.4rem 0.5rem 0.4rem 1rem'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '9999px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 900
              }}>
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e40af' }}>
                {currentUser.name ? currentUser.name.split(' ')[0] : 'Account'}
              </span>
              <button
                onClick={onLogout}
                title="Sign Out"
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '9999px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.75rem 1.25rem',
                backgroundColor: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: '9999px',
                color: '#0f172a',
                fontWeight: 800,
                fontSize: '0.925rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.backgroundColor = '#eff6ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.backgroundColor = '#f8fafc';
              }}
            >
              <User size={17} color="#2563eb" />
              <span>Sign In</span>
            </button>
          )}

          {/* Admin Control Center Button */}
          <button
            onClick={onOpenAdmin}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.75rem 1.35rem',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: '1.5px solid #0f172a',
              borderRadius: '9999px',
              fontWeight: 800,
              fontSize: '0.925rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#334155')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0f172a')}
          >
            <Settings size={17} />
            <span>Admin</span>
          </button>

          {/* Wishlist Button */}
          <button
            onClick={onOpenWishlist}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.75rem 1.35rem',
              backgroundColor: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              borderRadius: '9999px',
              color: '#0f172a',
              fontWeight: 800,
              fontSize: '0.925rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#dc2626';
              e.currentTarget.style.backgroundColor = '#fef2f2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.backgroundColor = '#f8fafc';
            }}
          >
            <Heart size={18} color={wishlistCount > 0 ? '#dc2626' : '#64748b'} fill={wishlistCount > 0 ? '#dc2626' : 'none'} />
            <span>Wishlist</span>
            {wishlistCount > 0 && (
              <span style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                fontSize: '0.775rem',
                fontWeight: 900,
                padding: '0.15rem 0.55rem',
                borderRadius: '9999px'
              }}>
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.75rem 1.55rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: '1.5px solid #2563eb',
              borderRadius: '9999px',
              fontWeight: 900,
              fontSize: '0.95rem',
              boxShadow: '0 4px 16px rgba(37, 99, 235, 0.35)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            <ShoppingBag size={18} color="#ffffff" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span style={{
                backgroundColor: '#ffffff',
                color: '#2563eb',
                fontSize: '0.8rem',
                fontWeight: 900,
                padding: '0.15rem 0.6rem',
                borderRadius: '9999px'
              }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category Pills Bar - Expanded Wide Layout */}
      <div className="container" style={{
        display: 'flex',
        gap: '0.65rem',
        paddingTop: '0.25rem',
        paddingBottom: '1rem',
        overflowX: 'auto'
      }}>
        {categories.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
          return (
            <button
              key={cat.id || cat.name}
              onClick={() => onSelectCategory(cat.name)}
              style={{
                padding: '0.55rem 1.35rem',
                borderRadius: '9999px',
                fontSize: '0.925rem',
                fontWeight: isSelected ? 800 : 600,
                backgroundColor: isSelected ? '#0f172a' : '#f1f5f9',
                color: isSelected ? '#ffffff' : '#334155',
                border: isSelected ? '1.5px solid #0f172a' : '1.5px solid #e2e8f0',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = '#e2e8f0';
                  e.currentTarget.style.color = '#0f172a';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                  e.currentTarget.style.color = '#334155';
                }
              }}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </header>
  );
}
