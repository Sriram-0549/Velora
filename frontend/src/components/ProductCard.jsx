import React from 'react';
import { Star, Plus, Eye, Heart } from 'lucide-react';

export default function ProductCard({
  product,
  onAddToCart,
  onQuickView,
  isWishlisted,
  onToggleWishlist
}) {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid var(--border-light)',
      borderRadius: '20px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
      position: 'relative',
      boxShadow: 'var(--shadow-card)',
      width: '100%'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.borderColor = '#2563eb';
      e.currentTarget.style.boxShadow = '0 16px 32px -6px rgba(37, 99, 235, 0.18)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.borderColor = 'var(--border-light)';
      e.currentTarget.style.boxShadow = 'var(--shadow-card)';
    }}
    >
      {/* Badge */}
      {product.badge && (
        <span style={{
          position: 'absolute',
          top: '14px',
          left: '14px',
          zIndex: 10,
          backgroundColor: '#2563eb',
          color: '#ffffff',
          fontSize: '0.8rem',
          fontWeight: 800,
          padding: '0.35rem 0.8rem',
          borderRadius: '8px',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
        }}>
          {product.badge}
        </span>
      )}

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleWishlist(product);
        }}
        style={{
          position: 'absolute',
          top: '14px',
          right: '14px',
          zIndex: 10,
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '9999px',
          width: '42px',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'transform 0.15s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Heart
          size={20}
          color={isWishlisted ? '#dc2626' : '#94a3b8'}
          fill={isWishlisted ? '#dc2626' : 'none'}
          className={isWishlisted ? 'animate-heart-pop' : ''}
        />
      </button>

      {/* Big Rich Image Container */}
      <div 
        style={{
          position: 'relative',
          paddingTop: '85%',
          overflow: 'hidden',
          backgroundColor: '#f8fafc',
          cursor: 'pointer'
        }}
        onClick={() => onQuickView(product)}
      >
        <img
          src={product.image_url}
          alt={product.title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
        />
        
        {/* Quick View Button */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '0.45rem 0.9rem',
          borderRadius: '10px',
          color: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          fontSize: '0.825rem',
          fontWeight: 800,
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
        }}>
          <Eye size={16} />
          <span>Quick View</span>
        </div>
      </div>

      {/* Details - Roomy, Big & Bold */}
      <div style={{
        padding: '1.45rem 1.6rem',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <span style={{
              fontSize: '0.825rem',
              color: '#2563eb',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {product.category}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Star size={16} fill="#d97706" color="#d97706" />
              <span style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 800 }}>
                {product.rating}
              </span>
              <span style={{ fontSize: '0.825rem', color: '#64748b' }}>
                ({product.reviews_count})
              </span>
            </div>
          </div>

          <h3 
            onClick={() => onQuickView(product)}
            style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 1.3,
              cursor: 'pointer',
              marginBottom: '0.65rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '3.1rem'
            }}
          >
            {product.title}
          </h3>

          <p style={{
            fontSize: '0.925rem',
            color: '#64748b',
            lineHeight: 1.55,
            marginBottom: '1.25rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {product.description}
          </p>
        </div>

        {/* Pricing & Big Add to Cart Button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>
                ${Number(product.price).toFixed(2)}
              </span>
              {product.compare_price && (
                <span style={{
                  fontSize: '0.95rem',
                  color: '#94a3b8',
                  textDecoration: 'line-through'
                }}>
                  ${Number(product.compare_price).toFixed(2)}
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.825rem', color: '#059669', fontWeight: 700 }}>
              ✓ In Stock ({product.stock})
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '0.75rem 1.45rem',
              borderRadius: '9999px',
              fontWeight: 800,
              fontSize: '0.95rem',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease, transform 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0f172a';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Plus size={18} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
