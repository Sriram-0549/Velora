import React from 'react';
import { ArrowRight, Truck, RefreshCw, Lock, Sparkles, Tag, ShieldCheck, Zap } from 'lucide-react';

export default function HeroBanner({ onShopNow }) {
  return (
    <section style={{
      margin: '1.5rem 0 2rem 0',
      position: 'relative',
      borderRadius: '24px',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 40%, #4338ca 100%)',
      boxShadow: '0 20px 40px -12px rgba(37, 99, 235, 0.45)',
      color: '#ffffff',
      width: '100%'
    }}>
      <div style={{
        padding: 'clamp(2.5rem, 4vw, 4.25rem) clamp(2rem, 3.5vw, 4rem)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        alignItems: 'center',
        gap: '3rem'
      }}>
        {/* Left Headline Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.5rem 1.25rem',
            backgroundColor: 'rgba(255, 255, 255, 0.22)',
            backdropFilter: 'blur(8px)',
            borderRadius: '9999px',
            color: '#ffffff',
            fontSize: '0.95rem',
            fontWeight: 800,
            width: 'fit-content',
            border: '1px solid rgba(255, 255, 255, 0.4)'
          }}>
            <Tag size={17} />
            Limited Offer: 20% OFF with coupon "DEVOPS20"
          </div>

          <h2 style={{
            fontSize: 'clamp(2.4rem, 3.8vw, 3.75rem)',
            fontWeight: 900,
            lineHeight: 1.12,
            letterSpacing: '-0.035em',
            color: '#ffffff'
          }}>
            Curated Essentials. Refined Engineering.
          </h2>

          <p style={{
            fontSize: 'clamp(1.1rem, 1.35vw, 1.25rem)',
            lineHeight: 1.6,
            color: 'rgba(255, 255, 255, 0.95)',
            maxWidth: '780px'
          }}>
            Explore our curated collection of 50 studio headphones, mechanical keyboards, precision timepieces, and performance apparel. Full transactional cart with interactive 3D card checkout.
          </p>

          <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.5rem' }}>
            <button
              onClick={onShopNow}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: '#ffffff',
                color: '#1e40af',
                padding: '1rem 2.5rem',
                borderRadius: '16px',
                fontWeight: 900,
                fontSize: '1.125rem',
                boxShadow: '0 10px 28px rgba(0, 0, 0, 0.25)',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 14px 32px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 28px rgba(0, 0, 0, 0.25)';
              }}
            >
              <span>Explore 50 Products</span>
              <ArrowRight size={22} />
            </button>
          </div>
        </div>

        {/* Right Feature Highlights Grid (Fills wide desktop screen!) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem'
        }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(12px)',
            borderRadius: '20px',
            padding: '1.75rem',
            border: '1px solid rgba(255, 255, 255, 0.25)'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>50+</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#93c5fd', marginTop: '0.5rem' }}>Curated Items</div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.85)', marginTop: '0.35rem', lineHeight: 1.4 }}>Audio, watches, footwear, apparel & lifestyle</p>
          </div>

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(12px)',
            borderRadius: '20px',
            padding: '1.75rem',
            border: '1px solid rgba(255, 255, 255, 0.25)'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>3D Card</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#86efac', marginTop: '0.5rem' }}>Interactive Flip</div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.85)', marginTop: '0.35rem', lineHeight: 1.4 }}>Simulated gateway with test card validation</p>
          </div>

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(12px)',
            borderRadius: '20px',
            padding: '1.75rem',
            border: '1px solid rgba(255, 255, 255, 0.25)'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>20% OFF</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fde047', marginTop: '0.5rem' }}>Coupon Engine</div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.85)', marginTop: '0.35rem', lineHeight: 1.4 }}>Code: DEVOPS20 for instant cart discounts</p>
          </div>

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(12px)',
            borderRadius: '20px',
            padding: '1.75rem',
            border: '1px solid rgba(255, 255, 255, 0.25)'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>Postgres</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#c4b5fd', marginTop: '0.5rem' }}>DevOps Ready</div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.85)', marginTop: '0.35rem', lineHeight: 1.4 }}>Dual-mode database with real order tables</p>
          </div>
        </div>
      </div>

      {/* Feature perks bar - Full horizontal span */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        backgroundColor: 'rgba(15, 23, 42, 0.28)',
        backdropFilter: 'blur(10px)',
        padding: '1.25rem clamp(2rem, 3.5vw, 4rem)',
        gap: '1.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Truck size={24} color="#93c5fd" />
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Free Express Delivery Over $50</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Lock size={24} color="#86efac" />
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>3D Flipping Card Simulator</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <RefreshCw size={24} color="#fde047" />
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Instant Database Persistence</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <ShieldCheck size={24} color="#a5b4fc" />
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>100% Mock Sandbox Safe</span>
        </div>
      </div>
    </section>
  );
}
