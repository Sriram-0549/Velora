import React, { useState, useEffect } from 'react';
import {
  Package,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Search,
  CheckCircle2,
  X,
  RefreshCw,
  ExternalLink,
  SlidersHorizontal,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchAdminOrders,
  fetchAdminStats
} from '../api/client';

const CATEGORIES = ['Electronics', 'Accessories', 'Footwear', 'Apparel', 'Lifestyle'];

export default function AdminPortal({ onBackToStore }) {
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total_products: 0,
    total_orders: 0,
    total_revenue: 0,
    low_stock_count: 0
  });

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null for new, object for edit
  const [modalForm, setModalForm] = useState({
    title: '',
    category: 'Electronics',
    price: '',
    compare_price: '',
    stock: '20',
    image_url: '',
    description: '',
    badge: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Load dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes, statsRes] = await Promise.all([
        fetchProducts(),
        fetchAdminOrders(),
        fetchAdminStats()
      ]);
      setProducts(prodRes.data || []);
      setOrders(orderRes.data || []);
      setStats(statsRes.data || stats);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Filter products for the table
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || p.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Modal Handlers
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setModalForm({
      title: '',
      category: 'Electronics',
      price: '',
      compare_price: '',
      stock: '25',
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      description: '',
      badge: 'New Arrival'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setModalForm({
      title: product.title,
      category: product.category,
      price: product.price,
      compare_price: product.compare_price || '',
      stock: product.stock,
      image_url: product.image_url,
      description: product.description,
      badge: product.badge || ''
    });
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, modalForm);
        showNotification(`Updated "${modalForm.title}" successfully!`);
      } else {
        await createProduct(modalForm);
        showNotification(`Created new product "${modalForm.title}"!`);
      }
      setIsModalOpen(false);
      loadDashboardData();
    } catch (err) {
      alert(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${product.title}"?`)) {
      return;
    }
    try {
      await deleteProduct(product.id);
      showNotification(`Deleted "${product.title}"`);
      loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      {/* Toast Notification */}
      {notification && (
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 100,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '0.85rem 1.45rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}
        >
          <CheckCircle2 size={18} color="#10b981" />
          <span>{notification}</span>
        </div>
      )}

      {/* Admin Top Header Bar */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '1.15rem clamp(1.25rem, 2.5vw, 3.5rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-sm)',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800
            }}
          >
            V
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>
              VELORA CONTROL CENTER
            </h1>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
              Live Store Inventory & Order Operations
            </span>
          </div>
        </div>

        {/* Return to Storefront Button */}
        <button
          onClick={onBackToStore}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '0.65rem 1.35rem',
            borderRadius: '9999px',
            fontWeight: 800,
            fontSize: '0.9rem',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
        >
          <ArrowLeft size={16} />
          <span>Back to Storefront</span>
        </button>
      </header>

      {/* Main Container - Full Screen Span */}
      <main className="container" style={{ padding: '2rem 0', width: '100%', maxWidth: '100%' }}>
        {/* KPI Analytics Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem'
          }}
        >
          {/* Card 1: Total Products */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>
                Total Products
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginTop: '0.25rem' }}>
                {stats.total_products}
              </div>
            </div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #bfdbfe'
              }}
            >
              <Package size={24} color="#2563eb" />
            </div>
          </div>

          {/* Card 2: Total Orders */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>
                Orders Placed
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginTop: '0.25rem' }}>
                {stats.total_orders}
              </div>
            </div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#f5f3ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #ddd6fe'
              }}
            >
              <ShoppingBag size={24} color="#7c3aed" />
            </div>
          </div>

          {/* Card 3: Total Revenue */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>
                Total Revenue (Mock)
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#059669', marginTop: '0.25rem' }}>
                ${Number(stats.total_revenue || 0).toFixed(2)}
              </div>
            </div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #a7f3d0'
              }}
            >
              <DollarSign size={24} color="#059669" />
            </div>
          </div>

          {/* Card 4: Low Stock Alert */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>
                Low Stock (&lt;20 items)
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#d97706', marginTop: '0.25rem' }}>
                {stats.low_stock_count}
              </div>
            </div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#fffbeb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #fde68a'
              }}
            >
              <AlertTriangle size={24} color="#d97706" />
            </div>
          </div>
        </div>

        {/* Tab Navigation & Search Toolbar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#e2e8f0', padding: '0.35rem', borderRadius: '12px' }}>
            <button
              onClick={() => setActiveTab('products')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1.25rem',
                borderRadius: '9px',
                fontSize: '0.9rem',
                fontWeight: 800,
                backgroundColor: activeTab === 'products' ? '#ffffff' : 'transparent',
                color: activeTab === 'products' ? '#0f172a' : '#64748b',
                boxShadow: activeTab === 'products' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer'
              }}
            >
              <Package size={16} />
              <span>Products ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1.25rem',
                borderRadius: '9px',
                fontSize: '0.9rem',
                fontWeight: 800,
                backgroundColor: activeTab === 'orders' ? '#ffffff' : 'transparent',
                color: activeTab === 'orders' ? '#0f172a' : '#64748b',
                boxShadow: activeTab === 'orders' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer'
              }}
            >
              <ShoppingBag size={16} />
              <span>Orders & Transactions ({orders.length})</span>
            </button>
          </div>

          {/* Action buttons (Add Product button when in products tab) */}
          {activeTab === 'products' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Search */}
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Filter products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: '0.55rem 1rem 0.55rem 2.4rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.85rem',
                    backgroundColor: '#ffffff',
                    width: '220px'
                  }}
                />
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.85rem',
                  backgroundColor: '#ffffff',
                  fontWeight: 600
                }}
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Add Product Button */}
              <button
                onClick={handleOpenAddModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} />
                <span>Add Product</span>
              </button>
            </div>
          )}
        </div>

        {/* TAB 1: PRODUCTS TABLE */}
        {activeTab === 'products' && (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                <RefreshCw size={28} className="animate-spin" color="#2563eb" />
                <p style={{ marginTop: '0.75rem', fontWeight: 600 }}>Loading inventory...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>No products match your filter.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '0.9rem 1.25rem' }}>Product</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Category</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Price</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Stock</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Badge</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Rating</th>
                      <th style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s ease' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                      >
                        {/* Thumbnail & Title */}
                        <td style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <img
                            src={product.image_url}
                            alt={product.title}
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              border: '1px solid #e2e8f0',
                              backgroundColor: '#f8fafc'
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{product.title}</div>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: #{product.id}</span>
                          </div>
                        </td>

                        {/* Category */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            style={{
                              backgroundColor: '#eff6ff',
                              color: '#2563eb',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              fontWeight: 700,
                              fontSize: '0.75rem'
                            }}
                          >
                            {product.category}
                          </span>
                        </td>

                        {/* Price */}
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#0f172a' }}>
                          ${Number(product.price).toFixed(2)}
                          {product.compare_price && (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through', marginLeft: '0.35rem' }}>
                              ${Number(product.compare_price).toFixed(2)}
                            </span>
                          )}
                        </td>

                        {/* Stock */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              backgroundColor: product.stock < 20 ? '#fef2f2' : '#ecfdf5',
                              color: product.stock < 20 ? '#dc2626' : '#059669'
                            }}
                          >
                            {product.stock} units
                          </span>
                        </td>

                        {/* Badge */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {product.badge ? (
                            <span style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.75rem' }}>
                              {product.badge}
                            </span>
                          ) : (
                            <span style={{ color: '#cbd5e1' }}>—</span>
                          )}
                        </td>

                        {/* Rating */}
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                          ★ {product.rating} <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({product.reviews_count})</span>
                        </td>

                        {/* Actions (Edit / Delete) */}
                        <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                            <button
                              onClick={() => handleOpenEditModal(product)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.35rem 0.65rem',
                                borderRadius: '6px',
                                backgroundColor: '#f1f5f9',
                                color: '#0f172a',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                border: '1px solid #cbd5e1',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                            >
                              <Pencil size={13} />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleDeleteProduct(product)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.35rem 0.65rem',
                                borderRadius: '6px',
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                border: '1px solid #fecaca',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fee2e2')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ORDERS & TRANSACTIONS LOG */}
        {activeTab === 'orders' && (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            {orders.length === 0 ? (
              <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
                <ShoppingBag size={48} color="#cbd5e1" style={{ margin: '0 auto 0.75rem auto' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>No Orders Recorded Yet</h3>
                <p style={{ fontSize: '0.85rem' }}>Place a test order in the storefront to see it appear here in real-time.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '0.9rem 1.25rem' }}>Order ID</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Customer</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Destination</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Purchased Items</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Total Paid</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.85rem 1.25rem', fontWeight: 800, color: '#2563eb', fontFamily: 'monospace' }}>
                          {order.id}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{order.customer_name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.customer_email}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#475569', fontSize: '0.8rem' }}>
                          {order.shipping_address}, {order.shipping_city}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {order.items && order.items.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              {order.items.map((it, idx) => (
                                <span key={idx} style={{ fontSize: '0.75rem', color: '#0f172a', fontWeight: 600 }}>
                                  • {it.quantity}x {it.title}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Order items</span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 900, color: '#059669' }}>
                          ${Number(order.total_amount).toFixed(2)} USD
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.75rem' }}>
                            {order.order_status || 'PAID'}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', color: '#64748b', fontSize: '0.75rem' }}>
                          {new Date(order.created_at || Date.now()).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="animate-fade-in"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              padding: '1.75rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ backgroundColor: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '0.35rem', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Noise-Cancelling Headphones"
                  value={modalForm.title}
                  onChange={(e) => setModalForm({ ...modalForm, title: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                    Category *
                  </label>
                  <select
                    value={modalForm.category}
                    onChange={(e) => setModalForm({ ...modalForm, category: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600, backgroundColor: '#fff' }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                    Selling Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="99.99"
                    value={modalForm.price}
                    onChange={(e) => setModalForm({ ...modalForm, price: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                    Compare Price (MSRP $)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="129.99"
                    value={modalForm.compare_price}
                    onChange={(e) => setModalForm({ ...modalForm, compare_price: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                    Inventory Stock *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="25"
                    value={modalForm.stock}
                    onChange={(e) => setModalForm({ ...modalForm, stock: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                  Badge (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Best Seller, Trending, Sale"
                  value={modalForm.badge}
                  onChange={(e) => setModalForm({ ...modalForm, badge: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                  Image URL (Unsplash or CDN link)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={modalForm.image_url}
                  onChange={(e) => setModalForm({ ...modalForm, image_url: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                />
                {modalForm.image_url && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={modalForm.image_url}
                      alt="Preview"
                      style={{ width: '50px', height: '50px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                      onError={(e) => (e.target.style.display = 'none')}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Live image preview</span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                  Product Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe features, build quality, and specifications..."
                  value={modalForm.description}
                  onChange={(e) => setModalForm({ ...modalForm, description: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '0.6rem 1.5rem',
                    borderRadius: '8px',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    border: 'none',
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
