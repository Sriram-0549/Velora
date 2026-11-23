import React, { useState } from 'react';
import { X, Lock, AlertCircle, Loader2, Wifi } from 'lucide-react';
import { processFakePayment } from '../api/client';

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  appliedPromo,
  currentUser,
  onOrderSuccess
}) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
  const isFreeShipping = subtotal >= 50 || (appliedPromo && appliedPromo.code === 'FREESHIP') || cartItems.length === 0;
  const shippingFee = isFreeShipping ? 0 : standardShipping;
  const total = Math.max(0, taxableAmount + tax + shippingFee);

  // Form states - Pre-filled with logged in user or demo defaults
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || 'Alex Morgan',
    email: currentUser?.email || 'alex@velora.com',
    phone: '+1 (555) 019-2834',
    address: '742 Evergreen Terrace',
    city: 'Springfield',
    postalCode: '97477',
    cardNumber: '4242 4242 4242 4242',
    cardExpMonth: '12',
    cardExpYear: '2028',
    cardCvv: '123',
    cardHolder: currentUser?.name ? currentUser.name.toUpperCase() : 'ALEX MORGAN'
  });

  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Format card number with spaces every 4 digits
  const formatCardNumber = (val) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    return raw.replace(/(\d{4})/g, '$1 ').trim();
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({ ...prev, cardNumber: formatted }));
  };

  // Detect brand
  const cleanDigits = formData.cardNumber.replace(/\s/g, '');
  let cardBrand = 'Visa';
  if (/^5[1-5]/.test(cleanDigits)) cardBrand = 'Mastercard';
  else if (/^3[47]/.test(cleanDigits)) cardBrand = 'American Express';
  else if (/^6(?:011|5)/.test(cleanDigits)) cardBrand = 'Discover';

  // Quick fill helper for testing
  const setTestCard = (type) => {
    setErrorMessage(null);
    if (type === 'success') {
      setFormData(prev => ({
        ...prev,
        cardNumber: '4242 4242 4242 4242',
        cardExpMonth: '12',
        cardExpYear: '2028',
        cardCvv: '123',
        cardHolder: 'Alex Johnson'
      }));
    } else if (type === 'decline_balance') {
      setFormData(prev => ({
        ...prev,
        cardNumber: '4000 0000 0000 0000',
        cardExpMonth: '08',
        cardExpYear: '2027',
        cardCvv: '456',
        cardHolder: 'Alex Johnson'
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const payload = {
        amount: parseFloat(total.toFixed(2)),
        currency: 'USD',
        cardNumber: formData.cardNumber,
        cardExpMonth: formData.cardExpMonth,
        cardExpYear: formData.cardExpYear,
        cardCvv: formData.cardCvv,
        cardHolder: formData.cardHolder,
        orderData: {
          customer_name: formData.fullName,
          customer_email: formData.email,
          customer_phone: formData.phone,
          shipping_address: formData.address,
          shipping_city: formData.city,
          shipping_postal_code: formData.postalCode,
          subtotal: parseFloat(subtotal.toFixed(2)),
          tax: parseFloat(tax.toFixed(2)),
          shipping_fee: parseFloat(shippingFee.toFixed(2)),
          discount_amount: parseFloat(discountAmount.toFixed(2)),
          promo_code: appliedPromo ? appliedPromo.code : null,
          items: cartItems.map(i => ({
            id: i.id,
            title: i.title,
            price: i.price,
            quantity: i.quantity,
            selectedColor: i.selectedColor || null,
            selectedSize: i.selectedSize || null
          }))
        }
      };

      const result = await processFakePayment(payload);
      setLoading(false);
      onOrderSuccess(result);
    } catch (err) {
      setLoading(false);
      setErrorMessage(err.message || 'Payment processing failed. Check test card details.');
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
          maxWidth: '740px',
          width: '100%',
          maxHeight: '94vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 20px 50px rgba(0,0,0,0.18)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Compact */}
        <div style={{
          padding: '0.75rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          backgroundColor: '#ffffff',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #bfdbfe'
            }}>
              <Lock size={15} color="#2563eb" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                Secure Checkout
              </h2>
              <span style={{ fontSize: '0.675rem', color: '#059669', fontWeight: 700 }}>
                ● Velora Mock Gateway • Sandbox Safe Testing
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#f1f5f9',
              color: '#0f172a',
              padding: '0.35rem',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            margin: '0.75rem 1.25rem 0 1.25rem',
            padding: '0.65rem 0.95rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#dc2626',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handlePaymentSubmit} style={{ padding: '1rem 1.25rem' }}>
          {/* Section 1: Shipping Info - Compact */}
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              1. Delivery Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '6px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '0.8rem',
                    fontWeight: 500
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '6px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '0.8rem',
                    fontWeight: 500
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '6px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '0.8rem',
                    fontWeight: 500
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>City & Zip</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    required
                    style={{
                      flex: 2,
                      padding: '0.45rem 0.65rem',
                      borderRadius: '6px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      fontSize: '0.8rem',
                      fontWeight: 500
                    }}
                  />
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="Zip"
                    required
                    style={{
                      flex: 1,
                      padding: '0.45rem 0.65rem',
                      borderRadius: '6px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      fontSize: '0.8rem',
                      fontWeight: 500
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: 3D Flipping Card & Payment Inputs - Compact */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                2. Simulated Card (Interactive 3D Flip)
              </h3>
              {/* Quick Fill Test Buttons */}
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => setTestCard('success')}
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.55rem',
                    borderRadius: '5px',
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    border: '1px solid #a7f3d0',
                    cursor: 'pointer'
                  }}
                >
                  ✓ Fill Success Card
                </button>
                <button
                  type="button"
                  onClick={() => setTestCard('decline_balance')}
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.55rem',
                    borderRadius: '5px',
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    cursor: 'pointer'
                  }}
                >
                  ✕ Fill Decline Card
                </button>
              </div>
            </div>

            {/* 3D Flipping Credit Card Visual Container - Compact 180px */}
            <div className="card-3d-wrap" style={{ marginBottom: '0.85rem' }}>
              <div className={`card-3d-inner ${isCardFlipped ? 'flipped' : ''}`}>
                
                {/* Card Front */}
                <div className="card-face card-face-front">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      {/* Metallic EMV Chip */}
                      <div style={{
                        width: '36px',
                        height: '26px',
                        borderRadius: '5px',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #d97706 100%)',
                        border: '1px solid #b45309',
                        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4)',
                        position: 'relative'
                      }}>
                        <div style={{ position: 'absolute', top: '8px', left: 0, right: 0, height: '1px', background: '#b45309' }} />
                        <div style={{ position: 'absolute', top: '16px', left: 0, right: 0, height: '1px', background: '#b45309' }} />
                        <div style={{ position: 'absolute', left: '16px', top: 0, bottom: 0, width: '1px', background: '#b45309' }} />
                      </div>
                      <Wifi size={16} color="#93c5fd" style={{ transform: 'rotate(90deg)' }} />
                    </div>

                    <span style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                      {cardBrand}
                    </span>
                  </div>

                  <div style={{
                    fontSize: '1.2rem',
                    letterSpacing: '0.15em',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    margin: '0.75rem 0'
                  }}>
                    {formData.cardNumber || '•••• •••• •••• ••••'}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.75rem' }}>
                    <div>
                      <span style={{ display: 'block', color: '#93c5fd', fontSize: '0.6rem', fontWeight: 700 }}>CARDHOLDER</span>
                      <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {formData.cardHolder || 'ALEX JOHNSON'}
                      </span>
                    </div>
                    <div>
                      <span style={{ display: 'block', color: '#93c5fd', fontSize: '0.6rem', fontWeight: 700 }}>EXPIRES</span>
                      <span style={{ fontWeight: 700 }}>
                        {formData.cardExpMonth || '12'} / {formData.cardExpYear ? formData.cardExpYear.slice(-2) : '28'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Back (Shown on CVV focus) */}
                <div className="card-face card-face-back">
                  {/* Magnetic Stripe */}
                  <div style={{ width: '100%', height: '34px', backgroundColor: '#020617', marginTop: '0.4rem' }} />

                  {/* Signature strip with CVV */}
                  <div style={{ padding: '0 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <div style={{
                      backgroundColor: '#ffffff',
                      height: '28px',
                      flex: 1,
                      marginRight: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '0.65rem',
                      fontStyle: 'italic',
                      color: '#64748b',
                      fontSize: '0.7rem'
                    }}>
                      Authorized Signature
                    </div>
                    <div style={{
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      padding: '0.25rem 0.55rem',
                      borderRadius: '4px'
                    }}>
                      {formData.cardCvv || '•••'}
                    </div>
                  </div>

                  <div style={{ padding: '0 1.25rem', fontSize: '0.6rem', color: '#94a3b8' }}>
                    This card is a simulated test token for full-stack & DevOps demonstration. No monetary value.
                  </div>
                </div>

              </div>
            </div>

            {/* Inputs Grid - Compact */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.65rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleCardNumberChange}
                  onFocus={() => setIsCardFlipped(false)}
                  placeholder="4242 4242 4242 4242"
                  required
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '6px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    letterSpacing: '0.04em'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>Exp (MM / YYYY)</label>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <input
                    type="text"
                    name="cardExpMonth"
                    value={formData.cardExpMonth}
                    onChange={handleInputChange}
                    onFocus={() => setIsCardFlipped(false)}
                    placeholder="12"
                    maxLength={2}
                    required
                    style={{
                      width: '50%',
                      padding: '0.45rem 0.5rem',
                      borderRadius: '6px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      fontSize: '0.8rem',
                      textAlign: 'center',
                      fontWeight: 600
                    }}
                  />
                  <input
                    type="text"
                    name="cardExpYear"
                    value={formData.cardExpYear}
                    onChange={handleInputChange}
                    onFocus={() => setIsCardFlipped(false)}
                    placeholder="2028"
                    maxLength={4}
                    required
                    style={{
                      width: '50%',
                      padding: '0.45rem 0.5rem',
                      borderRadius: '6px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      fontSize: '0.8rem',
                      textAlign: 'center',
                      fontWeight: 600
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>
                  CVV (Flips Card)
                </label>
                <input
                  type="text"
                  name="cardCvv"
                  value={formData.cardCvv}
                  onChange={handleInputChange}
                  onFocus={() => setIsCardFlipped(true)}
                  onBlur={() => setIsCardFlipped(false)}
                  placeholder="123"
                  maxLength={4}
                  required
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '6px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '0.8rem',
                    textAlign: 'center',
                    fontWeight: 700
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Summary & Pay Button - Compact */}
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', color: '#64748b' }}>
              <span>Items Total ({cartItems.reduce((c, i) => c + i.quantity, 0)})</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>${subtotal.toFixed(2)}</span>
            </div>

            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', color: '#059669', fontWeight: 700 }}>
                <span>Coupon Applied ({appliedPromo.code})</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', color: '#64748b' }}>
              <span>Estimated Tax (8%)</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>${tax.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', color: '#64748b' }}>
              <span>Shipping</span>
              <span style={{ fontWeight: 700, color: isFreeShipping ? '#059669' : '#0f172a' }}>
                {isFreeShipping ? 'FREE' : `$${standardShipping.toFixed(2)}`}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.15rem',
              fontWeight: 800,
              color: '#0f172a',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '0.4rem'
            }}>
              <span>Total Due</span>
              <span style={{ color: '#2563eb' }}>${total.toFixed(2)} USD</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                backgroundColor: loading ? '#3b82f6' : '#2563eb',
                color: '#ffffff',
                padding: '0.75rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.925rem',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                marginTop: '0.25rem',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Authorizing Simulated Gateway...</span>
                </>
              ) : (
                <>
                  <Lock size={15} />
                  <span>Pay ${total.toFixed(2)} USD</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
