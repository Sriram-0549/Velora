import React, { useState } from 'react';
import { X, Star, ShoppingBag, ShieldCheck, Truck, Heart } from 'lucide-react';

export default function ProductModal({
  product,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist
}) {
  if (!product) return null;

  const images = product.images && product.images.length > 0 ? product.images : [product.image_url];
  const [activeImage, setActiveImage] = useState(images[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors ? product.colors[0] : null);
  const [selectedSize, setSelectedSize] = useState(product.sizes ? product.sizes[0] : null);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'var(--modal-backdrop)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 60,
      padding: '0.75rem'
    }}
    onClick={onClose}
    >
      <div 
        className="animate-fade-in"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '780px',
          width: '100%',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          position: 'relative',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            zIndex: 10,
            backgroundColor: '#f1f5f9',
            color: '#0f172a',
            borderRadius: '9999px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #e2e8f0',
            cursor: 'pointer'
          }}
        >
          <X size={16} />
        </button>

        {/* Gallery Section - Compact */}
        <div style={{
          padding: '1.25rem',
          backgroundColor: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.65rem',
          borderRight: '1px solid #e2e8f0'
        }}>
          {/* Main Large Image */}
          <div style={{
            width: '100%',
            maxWidth: '320px',
            height: '260px',
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0'
          }}>
            <img
              src={activeImage}
              alt={product.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Clickable Image Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.45rem' }}>
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: activeImage === img ? '2px solid #2563eb' : '1px solid #cbd5e1'
                  }}
                >
                  <img src={img} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Section - Compact */}
        <div style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
              <span style={{
                color: '#2563eb',
                fontSize: '0.7rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                {product.category}
              </span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <Star size={12} fill="#d97706" color="#d97706" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>{product.rating}</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({product.reviews_count})</span>
              </div>
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.25, marginBottom: '0.4rem' }}>
              {product.title}
            </h2>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
                ${Number(product.price).toFixed(2)}
              </span>
              {product.compare_price && (
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                  ${Number(product.compare_price).toFixed(2)}
                </span>
              )}
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#059669', backgroundColor: '#ecfdf5', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                Save ${(product.compare_price - product.price).toFixed(2)}
              </span>
            </div>

            <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.45, marginBottom: '0.85rem' }}>
              {product.description}
            </p>

            {/* Color Swatch Selection */}
            {product.colors && product.colors.length > 0 && (
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                  Color: <span style={{ fontWeight: 500, color: '#64748b' }}>{selectedColor?.name}</span>
                </span>
                <div style={{ display: 'flex', gap: '0.45rem' }}>
                  {product.colors.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedColor(c)}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '9999px',
                        backgroundColor: c.hex,
                        border: selectedColor?.name === c.name ? '2.5px solid #2563eb' : '2px solid #ffffff',
                        boxShadow: selectedColor?.name === c.name ? '0 0 0 2px #2563eb' : '0 1px 4px rgba(0,0,0,0.15)',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size / Variant Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div style={{ marginBottom: '0.85rem' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                  Variant / Size:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {product.sizes.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedSize(s)}
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: selectedSize === s ? 700 : 500,
                        backgroundColor: selectedSize === s ? '#0f172a' : '#f8fafc',
                        color: selectedSize === s ? '#ffffff' : '#334155',
                        border: selectedSize === s ? '1px solid #0f172a' : '1px solid #cbd5e1',
                        cursor: 'pointer'
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Guarantees Box */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              backgroundColor: '#f8fafc',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginBottom: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#334155' }}>
                <Truck size={14} color="#2563eb" />
                <span>Complimentary Express Shipping included</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#334155' }}>
                <ShieldCheck size={14} color="#059669" />
                <span>1-Year Official Warranty with return protection</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => onToggleWishlist(product)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Heart size={16} color={isWishlisted ? '#dc2626' : '#64748b'} fill={isWishlisted ? '#dc2626' : 'none'} />
            </button>

            <button
              onClick={() => {
                onAddToCart({
                  ...product,
                  selectedColor: selectedColor?.name,
                  selectedSize
                });
                onClose();
              }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '0.65rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.9rem',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                cursor: 'pointer'
              }}
            >
              <ShoppingBag size={16} />
              <span>Add to Cart (${Number(product.price).toFixed(2)})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
