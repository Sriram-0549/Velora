import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Tag, Check, Sparkles } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  appliedPromo,
  onApplyPromo,
  onRemovePromo
}) {
  if (!isOpen) return null;

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState(null);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Discount calculation
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percent') {
      discountAmount = (subtotal * appliedPromo.value) / 100;
    } else if (appliedPromo.type === 'fixed') {
      discountAmount = Math.min(appliedPromo.value, subtotal);
    }
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = taxableAmount * 0.08;
  const standardShipping = 9.99;
  const isFreeShipping = subtotal >= 50 || (appliedPromo && appliedPromo.code === 'FREESHIP') || items.length === 0;
  const shippingFee = isFreeShipping ? 0 : standardShipping;
  const total = Math.max(0, taxableAmount + tax + shippingFee);

  const handlePromoSubmit = (e) => {
    e.preventDefault();
    setPromoError(null);
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'DEVOPS20') {
      onApplyPromo({ code: 'DEVOPS20', type: 'percent', value: 20, desc: '20% DevOps Discount' });
      setPromoInput('');
    } else if (code === 'FREESHIP') {
      onApplyPromo({ code: 'FREESHIP', type: 'shipping', value: 9.99, desc: 'Free Express Shipping' });
      setPromoInput('');
    } else if (code === 'VELORA10') {
      onApplyPromo({ code: 'VELORA10', type: 'fixed', value: 10, desc: '$10 Instant Discount' });
      setPromoInput('');
    } else {
      setPromoError('Invalid code. Try DEVOPS20 or FREESHIP');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'var(--modal-backdrop)',
      backdropFilter: 'blur(6px)',
      zIndex: 50,
      display: 'flex',
      justifyContent: 'flex-end'
    }}
    onClick={onClose}
    >
      <div
        className="animate-slide-in"
        style={{
          width: '100%',
          maxWidth: '430px',
          height: '100%',
          backgroundColor: '#ffffff',
          borderLeft: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 30px rgba(0,0,0,0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Compact */}
        <div style={{
          padding: '0.85rem 1.15rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={18} color="#2563eb" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
              Your Bag ({items.reduce((c, i) => c + i.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#f1f5f9',
              color: '#0f172a',
              padding: '0.35rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #e2e8f0',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Free Shipping Progress - Compact */}
        <div style={{
          padding: '0.45rem 1.15rem',
          backgroundColor: isFreeShipping ? '#ecfdf5' : '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          fontSize: '0.75rem'
        }}>
          {isFreeShipping ? (
            <span style={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Check size={14} /> FREE Express Shipping unlocked!
            </span>
          ) : (
            <span style={{ color: '#475569' }}>
              Add <strong style={{ color: '#0f172a' }}>${(50 - subtotal).toFixed(2)}</strong> more for Free Shipping
            </span>
          )}
        </div>

        {/* Items Scroll List - Tight gaps */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1.15rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {items.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '0.75rem',
              color: '#64748b'
            }}>
              <ShoppingBag size={42} strokeWidth={1.5} color="#94a3b8" />
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>Your bag is empty.</p>
              <button
                onClick={onClose}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Browse Products
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  padding: '0.65rem 0.75rem',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
                }}
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  style={{
                    width: '58px',
                    height: '58px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0'
                  }}
                />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        lineHeight: 1.25,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {item.title}
                      </h4>
                      {(item.selectedColor || item.selectedSize) && (
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.15rem' }}>
                          {item.selectedColor && <span>{item.selectedColor}</span>}
                          {item.selectedColor && item.selectedSize && <span> • </span>}
                          {item.selectedSize && <span>{item.selectedSize}</span>}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#94a3b8',
                        padding: '0.15rem',
                        marginLeft: '0.4rem',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '6px',
                      padding: '0.15rem 0.35rem',
                      border: '1px solid #cbd5e1'
                    }}>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        style={{ backgroundColor: 'transparent', color: '#0f172a', display: 'flex', cursor: 'pointer' }}
                      >
                        <Minus size={11} />
                      </button>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, minWidth: '16px', textAlign: 'center', color: '#0f172a' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        style={{ backgroundColor: 'transparent', color: '#0f172a', display: 'flex', cursor: 'pointer' }}
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Promo Code Box & Totals - Compact */}
        {items.length > 0 && (
          <div style={{
            padding: '0.85rem 1.15rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.02)'
          }}>
            {/* Promo Code Input */}
            <div>
              {appliedPromo ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: '#065f46'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Tag size={13} color="#059669" />
                    <span><strong>{appliedPromo.code}</strong> applied ({appliedPromo.desc})</span>
                  </div>
                  <button
                    onClick={onRemovePromo}
                    style={{ background: 'none', color: '#059669', fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePromoSubmit} style={{ display: 'flex', gap: '0.4rem' }}>
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Coupon (e.g. DEVOPS20)"
                    style={{
                      flex: 1,
                      padding: '0.4rem 0.65rem',
                      borderRadius: '6px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.775rem',
                      fontWeight: 600,
                      color: '#0f172a'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Apply
                  </button>
                </form>
              )}
              {promoError && (
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#dc2626', marginTop: '0.15rem' }}>
                  {promoError}
                </span>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', color: '#64748b' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>${subtotal.toFixed(2)}</span>
            </div>

            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', color: '#059669', fontWeight: 700 }}>
                <span>Coupon ({appliedPromo.code})</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', color: '#64748b' }}>
              <span>Estimated Tax (8%)</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>${tax.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', color: '#64748b' }}>
              <span>Express Shipping</span>
              <span style={{ fontWeight: 700, color: isFreeShipping ? '#059669' : '#0f172a' }}>
                {isFreeShipping ? 'FREE' : `$${standardShipping.toFixed(2)}`}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.1rem',
              fontWeight: 800,
              color: '#0f172a',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '0.5rem'
            }}>
              <span>Total</span>
              <span style={{ color: '#2563eb' }}>${total.toFixed(2)} USD</span>
            </div>

            <button
              onClick={onProceedToCheckout}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '0.75rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.9rem',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                marginTop: '0.25rem',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', color: '#64748b', fontSize: '0.7rem' }}>
              <ShieldCheck size={12} color="#059669" />
              <span>Simulated Payment Gateway (Safe sandbox testing)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
