import React, { useState, useEffect } from 'react';
import { X, Package, Clock, CheckCircle2, ChevronRight, FileText, ShoppingBag, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { fetchUserOrders } from '../api/client';

export default function OrderHistoryModal({ isOpen, onClose, currentUser, onOpenReceipt }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchEmail, setSearchEmail] = useState(currentUser?.email || '');

  const loadOrders = async (emailToFetch) => {
    if (!emailToFetch) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetchUserOrders(emailToFetch);
      setOrders(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve order history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const email = currentUser?.email || searchEmail;
      setSearchEmail(email);
      if (email) loadOrders(email);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

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
      zIndex: 100,
      padding: '1rem'
    }} onClick={onClose}>
      <div 
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
          border: '1px solid #e2e8f0',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in"
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb'
            }}>
              <Package size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>
                My Order History
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                {currentUser ? `Tracking orders for ${currentUser.email}` : 'Enter your order email address below'}
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              backgroundColor: '#f1f5f9',
              border: 'none',
              borderRadius: '9999px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Email Lookup Bar (if not logged in or searching another email) */}
        <div style={{
          padding: '0.85rem 2rem',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center'
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Search orders by customer email..."
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem 0.55rem 2.5rem',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.875rem',
                backgroundColor: '#ffffff',
                color: '#0f172a'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') loadOrders(searchEmail);
              }}
            />
          </div>
          <button
            onClick={() => loadOrders(searchEmail)}
            style={{
              padding: '0.55rem 1.25rem',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <RefreshCw size={14} />
            <span>Search</span>
          </button>
        </div>

        {/* Orders List Container */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2rem' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px', gap: '0.75rem' }}>
              <RefreshCw size={32} className="animate-spin" color="#2563eb" />
              <span style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 600 }}>Loading your orders...</span>
            </div>
          ) : error ? (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '1.25rem', borderRadius: '14px', textAlign: 'center', fontWeight: 600 }}>
              <AlertCircle size={20} style={{ margin: '0 auto 0.5rem' }} />
              <p>{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '9999px',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <ShoppingBag size={30} color="#94a3b8" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                No Orders Placed Yet
              </h3>
              <p style={{ fontSize: '0.925rem', maxWidth: '380px', margin: '0 auto' }}>
                Any orders you complete using our 3D card payment simulator will be logged here in real-time.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {orders.map((order) => (
                <div 
                  key={order.id}
                  style={{
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '1.35rem 1.5rem',
                    backgroundColor: '#ffffff',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'border-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                        ORDER NUMBER
                      </span>
                      <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', fontFamily: 'monospace' }}>
                        {order.id}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                        <Clock size={13} />
                        <span>{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        backgroundColor: '#ecfdf5',
                        color: '#059669',
                        border: '1px solid #a7f3d0',
                        fontSize: '0.775rem',
                        fontWeight: 800,
                        padding: '0.3rem 0.75rem',
                        borderRadius: '9999px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}>
                        <CheckCircle2 size={13} />
                        {order.order_status || 'PAID'}
                      </span>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Total</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                          ${Number(order.total_amount).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Summary */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '0.85rem 1rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem'
                  }}>
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                        <span style={{ color: '#334155', fontWeight: 600 }}>
                          {item.quantity}× {item.title}
                        </span>
                        <span style={{ color: '#0f172a', fontWeight: 700 }}>
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Footer Actions */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '0.85rem'
                  }}>
                    <span style={{ fontSize: '0.825rem', color: '#64748b' }}>
                      Shipped to <strong>{order.shipping_city}</strong>
                    </span>

                    <button
                      onClick={() => {
                        onOpenReceipt({
                          orderId: order.id,
                          transactionId: `TXN-LOGGED-${order.id.slice(-6)}`,
                          customer_name: order.customer_name,
                          customer_email: order.customer_email,
                          shipping_address: order.shipping_address,
                          shipping_city: order.shipping_city,
                          shipping_postal_code: order.shipping_postal_code,
                          subtotal: order.subtotal,
                          tax: order.tax,
                          shipping_fee: order.shipping_fee,
                          total_amount: order.total_amount,
                          items: order.items || []
                        });
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        padding: '0.45rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.825rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      <FileText size={15} />
                      <span>View Printable Invoice</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
