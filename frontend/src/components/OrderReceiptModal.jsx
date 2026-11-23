import React from 'react';
import { CheckCircle2, ArrowRight, Printer, Sparkles } from 'lucide-react';

export default function OrderReceiptModal({ orderResult, onClose }) {
  if (!orderResult) return null;

  const order = orderResult.order || {};
  const payment = orderResult.payment || {};

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
      zIndex: 70,
      padding: '0.75rem'
    }}>
      <div 
        className="animate-fade-in"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '1.5rem',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.18)',
          textAlign: 'center'
        }}
      >
        {/* Success Icon - Compact */}
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '9999px',
          backgroundColor: '#ecfdf5',
          border: '2px solid #059669',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 0.75rem auto'
        }}>
          <CheckCircle2 size={32} color="#059669" />
        </div>

        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          color: '#059669',
          fontSize: '0.75rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '0.35rem',
          backgroundColor: '#ecfdf5',
          padding: '0.2rem 0.6rem',
          borderRadius: '9999px'
        }}>
          <Sparkles size={12} /> Transaction Authorized & Confirmed
        </span>

        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
          Thank You, {order.customer_name || 'Customer'}!
        </h2>

        <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '1rem' }}>
          Your payment was authorized via the simulated gateway. An electronic invoice has been saved to the database.
        </p>

        {/* Receipt Box - Compact */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '1rem 1.15rem',
          textAlign: 'left',
          marginBottom: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.55rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.45rem' }}>
            <span style={{ fontSize: '0.775rem', color: '#64748b', fontWeight: 500 }}>Order ID</span>
            <span style={{ fontSize: '0.825rem', fontWeight: 800, color: '#2563eb', fontFamily: 'monospace' }}>
              {order.id || 'ORD-TEST-9981'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.45rem' }}>
            <span style={{ fontSize: '0.775rem', color: '#64748b', fontWeight: 500 }}>Transaction Reference</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
              {payment.transaction_id || 'txn_mock_success'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.45rem' }}>
            <span style={{ fontSize: '0.775rem', color: '#64748b', fontWeight: 500 }}>Payment Method</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
              {payment.card_brand || 'Visa'} (•••• {payment.card_last4 || '4242'})
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.45rem' }}>
            <span style={{ fontSize: '0.775rem', color: '#64748b', fontWeight: 500 }}>Destination</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>
              {order.shipping_address}, {order.shipping_city}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.15rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>Total Paid</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>
              ${Number(payment.amount || order.total_amount || 0).toFixed(2)} USD
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            onClick={() => window.print()}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              padding: '0.65rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer'
            }}
          >
            <Printer size={14} />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={onClose}
            style={{
              flex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '0.65rem',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.85rem',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
              cursor: 'pointer'
            }}
          >
            <span>Continue Shopping</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
