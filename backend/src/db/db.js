import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import pg from 'pg';
import { mockProducts, mockCategories } from './mockData.js';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Persistent file-backed storage path for standalone mode
const dataDir = path.join(__dirname, '../../data');
const dataFilePath = path.join(dataDir, 'velora-store.json');

let pool = null;
let isPostgresConnected = false;

export function hashPassword(plainText) {
  return crypto.createHash('sha256').update(plainText || '').digest('hex');
}

// Initialize file-backed memory database
function getInitialData() {
  return {
    users: [
      {
        id: 1,
        name: 'Alex Morgan',
        email: 'alex@velora.com',
        password_hash: hashPassword('password'),
        role: 'customer',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Store Admin',
        email: 'admin@velora.com',
        password_hash: hashPassword('password'),
        role: 'admin',
        created_at: new Date().toISOString()
      }
    ],
    products: [...mockProducts],
    categories: [...mockCategories],
    orders: [],
    order_items: [],
    payments: []
  };
}

let localDb = getInitialData();

function saveLocalDb() {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(localDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Failed to persist local DB file:', err.message);
  }
}

function loadLocalDb() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, 'utf-8');
      localDb = JSON.parse(content);
      // Ensure products exist if empty
      if (!localDb.products || localDb.products.length === 0) {
        localDb.products = [...mockProducts];
      }
      // Ensure users exist if empty
      if (!localDb.users || localDb.users.length === 0) {
        localDb.users = getInitialData().users;
      }
      saveLocalDb();
    } else {
      saveLocalDb();
    }
  } catch (err) {
    console.warn('[DB] Local store init fallback:', err.message);
    localDb = getInitialData();
  }
}

// Try connecting to PostgreSQL if DATABASE_URL is present
export async function initDb() {
  loadLocalDb();
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log('[DB] No DATABASE_URL specified. Running with local persistent data store.');
    return;
  }

  try {
    pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 2000,
      idleTimeoutMillis: 10000
    });

    const client = await pool.connect();
    isPostgresConnected = true;
    console.log('[DB] Successfully connected to PostgreSQL database!');

    // Initialize schema if needed
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      await client.query(schemaSql);
    }

    // Check if products exist in PostgreSQL, if not seed them
    const productCountResult = await client.query('SELECT COUNT(*) FROM products');
    if (parseInt(productCountResult.rows[0].count, 10) === 0) {
      console.log('[DB] Seeding PostgreSQL with initial catalog...');
      const seedsPath = path.join(__dirname, 'seeds.sql');
      if (fs.existsSync(seedsPath)) {
        const seedSql = fs.readFileSync(seedsPath, 'utf-8');
        await client.query(seedSql);
      }
    }

    client.release();
  } catch (err) {
    isPostgresConnected = false;
    console.warn(`[DB] PostgreSQL connection skipped (${err.message}). Using local store.`);
  }
}

// Data Access Methods (works in both PostgreSQL & Local File store)
export const db = {
  getMode() {
    return isPostgresConnected ? 'postgresql' : 'embedded_local';
  },

  async getProducts({ category, search, sort } = {}) {
    if (isPostgresConnected) {
      let query = 'SELECT * FROM products WHERE 1=1';
      const params = [];

      if (category && category.toLowerCase() !== 'all') {
        params.push(category);
        query += ` AND LOWER(category) = LOWER($${params.length})`;
      }

      if (search) {
        params.push(`%${search.toLowerCase()}%`);
        query += ` AND (LOWER(title) LIKE $${params.length} OR LOWER(description) LIKE $${params.length})`;
      }

      if (sort === 'price-low') {
        query += ' ORDER BY price ASC';
      } else if (sort === 'price-high') {
        query += ' ORDER BY price DESC';
      } else if (sort === 'rating') {
        query += ' ORDER BY rating DESC';
      } else {
        query += ' ORDER BY id ASC';
      }

      const res = await pool.query(query, params);
      return res.rows;
    }

    // Local in-memory filter
    let items = [...localDb.products];
    if (category && category.toLowerCase() !== 'all') {
      items = items.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const s = search.toLowerCase();
      items = items.filter(p => p.title.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
    }
    if (sort === 'price-low') {
      items.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      items.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      items.sort((a, b) => b.rating - a.rating);
    }
    return items;
  },

  async getProductById(id) {
    const numId = Number(id);
    if (isPostgresConnected) {
      const res = await pool.query('SELECT * FROM products WHERE id = $1', [numId]);
      return res.rows[0] || null;
    }
    return localDb.products.find(p => p.id === numId) || null;
  },

  async addProduct(productData) {
    const slug = productData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
    const price = parseFloat(productData.price) || 0;
    const comparePrice = productData.compare_price ? parseFloat(productData.compare_price) : null;
    const stock = parseInt(productData.stock, 10) || 10;
    const rating = productData.rating ? parseFloat(productData.rating) : 4.8;
    const reviewsCount = productData.reviews_count ? parseInt(productData.reviews_count, 10) : 0;
    const imageUrl = productData.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';

    if (isPostgresConnected) {
      const query = `
        INSERT INTO products (title, slug, description, price, compare_price, category, image_url, stock, rating, reviews_count, badge)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *;
      `;
      const res = await pool.query(query, [
        productData.title,
        slug,
        productData.description || '',
        price,
        comparePrice,
        productData.category || 'Electronics',
        imageUrl,
        stock,
        rating,
        reviewsCount,
        productData.badge || null
      ]);
      return res.rows[0];
    }

    const newId = localDb.products.length > 0 ? Math.max(...localDb.products.map(p => p.id)) + 1 : 1;
    const newProduct = {
      id: newId,
      title: productData.title,
      slug,
      description: productData.description || '',
      price,
      compare_price: comparePrice,
      category: productData.category || 'Electronics',
      image_url: imageUrl,
      images: [imageUrl],
      colors: productData.colors || [{ name: 'Default', hex: '#0f172a' }],
      sizes: productData.sizes || ['Standard'],
      stock,
      rating,
      reviews_count: reviewsCount,
      featured: false,
      badge: productData.badge || 'New'
    };

    localDb.products.unshift(newProduct);
    saveLocalDb();
    return newProduct;
  },

  async updateProduct(id, updates) {
    const numId = Number(id);

    if (isPostgresConnected) {
      const current = await this.getProductById(numId);
      if (!current) return null;

      const title = updates.title || current.title;
      const description = updates.description !== undefined ? updates.description : current.description;
      const price = updates.price !== undefined ? parseFloat(updates.price) : current.price;
      const comparePrice = updates.compare_price !== undefined ? parseFloat(updates.compare_price) : current.compare_price;
      const category = updates.category || current.category;
      const imageUrl = updates.image_url || current.image_url;
      const stock = updates.stock !== undefined ? parseInt(updates.stock, 10) : current.stock;
      const badge = updates.badge !== undefined ? updates.badge : current.badge;

      const query = `
        UPDATE products
        SET title = $1, description = $2, price = $3, compare_price = $4, category = $5, image_url = $6, stock = $7, badge = $8, updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        RETURNING *;
      `;
      const res = await pool.query(query, [title, description, price, comparePrice, category, imageUrl, stock, badge, numId]);
      return res.rows[0] || null;
    }

    const index = localDb.products.findIndex(p => p.id === numId);
    if (index === -1) return null;

    localDb.products[index] = {
      ...localDb.products[index],
      ...updates,
      id: numId,
      price: updates.price !== undefined ? parseFloat(updates.price) : localDb.products[index].price,
      compare_price: updates.compare_price !== undefined ? (updates.compare_price ? parseFloat(updates.compare_price) : null) : localDb.products[index].compare_price,
      stock: updates.stock !== undefined ? parseInt(updates.stock, 10) : localDb.products[index].stock
    };

    saveLocalDb();
    return localDb.products[index];
  },

  async deleteProduct(id) {
    const numId = Number(id);
    if (isPostgresConnected) {
      const res = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *;', [numId]);
      return res.rows[0] || null;
    }

    const index = localDb.products.findIndex(p => p.id === numId);
    if (index === -1) return null;

    const [deleted] = localDb.products.splice(index, 1);
    saveLocalDb();
    return deleted;
  },

  async getCategories() {
    if (isPostgresConnected) {
      const res = await pool.query('SELECT DISTINCT category AS name FROM products ORDER BY category ASC');
      return [{ id: 'all', name: 'All' }, ...res.rows.map((r, i) => ({ id: i + 1, name: r.name }))];
    }
    return localDb.categories;
  },

  async createOrder({
    orderId,
    customer_name,
    customer_email,
    customer_phone = '',
    shipping_address,
    shipping_city,
    shipping_postal_code,
    subtotal,
    tax = 0,
    shipping_fee = 0,
    total_amount,
    items = []
  }) {
    if (isPostgresConnected) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const orderInsert = `
          INSERT INTO orders (id, customer_name, customer_email, customer_phone, shipping_address, shipping_city, shipping_postal_code, subtotal, tax, shipping_fee, total_amount, order_status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'PAID')
          RETURNING *;
        `;
        const orderRes = await client.query(orderInsert, [
          orderId,
          customer_name,
          customer_email,
          customer_phone,
          shipping_address,
          shipping_city,
          shipping_postal_code,
          subtotal,
          tax,
          shipping_fee,
          total_amount
        ]);

        for (const item of items) {
          await client.query(`
            INSERT INTO order_items (order_id, product_id, title, price, quantity, total)
            VALUES ($1, $2, $3, $4, $5, $6);
          `, [orderId, item.id || null, item.title, item.price, item.quantity, (item.price * item.quantity).toFixed(2)]);
        }

        await client.query('COMMIT');
        return { ...orderRes.rows[0], items };
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    }

    // Local fallback
    const newOrder = {
      id: orderId,
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      shipping_city,
      shipping_postal_code,
      subtotal,
      tax,
      shipping_fee,
      total_amount,
      order_status: 'PAID',
      created_at: new Date().toISOString(),
      items
    };

    localDb.orders.unshift(newOrder);
    saveLocalDb();
    return newOrder;
  },

  async getOrderById(id) {
    if (isPostgresConnected) {
      const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
      if (orderRes.rows.length === 0) return null;
      const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [id]);
      return { ...orderRes.rows[0], items: itemsRes.rows };
    }
    return localDb.orders.find(o => o.id === id) || null;
  },

  async getAllOrders() {
    if (isPostgresConnected) {
      const orderRes = await pool.query(`
        SELECT o.*, 
          COALESCE(json_agg(json_build_object('id', i.id, 'title', i.title, 'price', i.price, 'quantity', i.quantity)) FILTER (WHERE i.id IS NOT NULL), '[]') as items
        FROM orders o
        LEFT JOIN order_items i ON o.id = i.order_id
        GROUP BY o.id
        ORDER BY o.created_at DESC;
      `);
      return orderRes.rows;
    }
    return localDb.orders;
  },

  async getAdminStats() {
    if (isPostgresConnected) {
      const pCountRes = await pool.query('SELECT COUNT(*) as count FROM products');
      const oCountRes = await pool.query('SELECT COUNT(*) as count FROM orders');
      const revenueRes = await pool.query('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE order_status = \'PAID\'');
      const lowStockRes = await pool.query('SELECT COUNT(*) as count FROM products WHERE stock < 20');

      return {
        total_products: parseInt(pCountRes.rows[0].count, 10),
        total_orders: parseInt(oCountRes.rows[0].count, 10),
        total_revenue: parseFloat(revenueRes.rows[0].total),
        low_stock_count: parseInt(lowStockRes.rows[0].count, 10)
      };
    }

    const totalRevenue = localDb.orders
      .filter(o => o.order_status === 'PAID')
      .reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);

    const lowStock = localDb.products.filter(p => p.stock < 20).length;

    return {
      total_products: localDb.products.length,
      total_orders: localDb.orders.length,
      total_revenue: parseFloat(totalRevenue.toFixed(2)),
      low_stock_count: lowStock
    };
  },

  async savePayment(paymentData) {
    if (isPostgresConnected) {
      const q = `
        INSERT INTO payments (order_id, transaction_id, gateway, amount, currency, card_last4, card_brand, payment_status, receipt_url, error_message)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
      `;
      const res = await pool.query(q, [
        paymentData.order_id,
        paymentData.transaction_id,
        paymentData.gateway || 'VELORA_MOCK_PAY',
        paymentData.amount,
        paymentData.currency || 'USD',
        paymentData.card_last4,
        paymentData.card_brand,
        paymentData.payment_status,
        paymentData.receipt_url || null,
        paymentData.error_message || null
      ]);
      return res.rows[0];
    }

    const rec = {
      id: localDb.payments.length + 1,
      ...paymentData,
      created_at: new Date().toISOString()
    };
    localDb.payments.unshift(rec);
    saveLocalDb();
    return rec;
  },

  // User Authentication Data Access
  async findUserByEmail(email) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (isPostgresConnected) {
      const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail]);
      return res.rows[0] || null;
    }
    return localDb.users.find(u => u.email.toLowerCase() === cleanEmail) || null;
  },

  async findUserById(id) {
    const numId = Number(id);
    if (isPostgresConnected) {
      const res = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [numId]);
      return res.rows[0] || null;
    }
    const user = localDb.users.find(u => u.id === numId);
    if (!user) return null;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  async createUser({ name, email, password, role = 'customer' }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim();
    const passwordHash = hashPassword(password);

    if (isPostgresConnected) {
      const q = `
        INSERT INTO users (name, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role, created_at;
      `;
      const res = await pool.query(q, [cleanName, cleanEmail, passwordHash, role]);
      return res.rows[0];
    }

    const newId = localDb.users.length > 0 ? Math.max(...localDb.users.map(u => u.id)) + 1 : 1;
    const newUser = {
      id: newId,
      name: cleanName,
      email: cleanEmail,
      password_hash: passwordHash,
      role,
      created_at: new Date().toISOString()
    };
    localDb.users.push(newUser);
    saveLocalDb();
    const { password_hash, ...safeUser } = newUser;
    return safeUser;
  },

  async getUserOrders(email) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (isPostgresConnected) {
      const res = await pool.query(`
        SELECT o.*,
          COALESCE(json_agg(json_build_object('id', i.id, 'title', i.title, 'price', i.price, 'quantity', i.quantity)) FILTER (WHERE i.id IS NOT NULL), '[]') as items
        FROM orders o
        LEFT JOIN order_items i ON o.id = i.order_id
        WHERE LOWER(o.customer_email) = $1
        GROUP BY o.id
        ORDER BY o.created_at DESC;
      `, [cleanEmail]);
      return res.rows;
    }

    return localDb.orders.filter(o => o.customer_email && o.customer_email.toLowerCase() === cleanEmail);
  }
};
