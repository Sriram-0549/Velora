# 🛍️ Velora E-Store — Full-Stack E-Commerce Application

A production-structured full stack web e-commerce application featuring a **Clean White High-Contrast Edge-to-Edge React Storefront**, an **Admin Control Portal**, an **Express REST API**, **PostgreSQL database schemas with 50 seed products**, and a **Hyper-Realistic 3D Flipping Simulated Payment Gateway**.

---

## 🎨 Layout & Design Improvements

- **Full-Width Fluid Edge-to-Edge Layout**:
  - Removed all artificial max-width constraints (`max-width: 100%` with responsive clamp padding).
  - Content stretches cleanly across the full browser width on 1080p, 1440p, and widescreen monitors with **zero empty side voids**.
- **Scaled-Up High-Impact Visuals**:
  - **Hero Banner**: Expansive gradient canvas with larger typography (`3.75rem`), prominent action buttons, and live feature stat tiles (`50+ Curated Items`, `3D Card`, `20% OFF`, `Postgres`).
  - **Product Cards**: Significantly larger cards (`minmax(320px, 1fr)`), taller 85% aspect-ratio photo showcases, larger bold titles (`1.2rem`), high-contrast price tags (`1.6rem`), and one-click "Add to Cart" pills.
  - **Navbar & Search**: Extended search bar (`780px` max width), quick-match popover, and dedicated **Admin Portal** button.
- **Admin Control Center**:
  - Complete live admin dashboard accessible directly from the navbar.
  - **Product CRUD**: Add new products, edit existing items (title, category, price, stock, images), and delete products with real-time database updates.
  - **KPI Dashboard**: Live counters for Total Catalog Items, Total Orders, Lifetime Revenue, and Low Stock Alerts.
  - **Order Log**: Live audit trail of all transactions processed through the 3D payment simulator.

---

## 🏗️ Architecture & Component Layers

### 1. Database Layer (`backend/src/db/`)
- **`schema.sql`**: Production relational database schema (`products`, `categories`, `orders`, `order_items`, `payments`).
- **`seeds.sql` & `mockData.js`**: **50 curated products** across 5 categories (Electronics, Accessories, Footwear, Apparel, Lifestyle) with multi-image galleries, color swatches, and size specifications.
- **`db.js`**: Dual-mode engine:
  - Connects to **PostgreSQL** via `pg` connection pools when `DATABASE_URL` is set.
  - Automatically falls back to a **local file-backed store** (`backend/data/velora-store.json`) for instant zero-config local development.

### 2. Backend API (`backend/src/`)
- Built with **Node.js + Express** (ES Modules).
- **Endpoints**:
  - `GET /api/health`: Health monitor (uptime, memory, database mode).
  - `GET /api/products`: Full catalog of 50 items with search, category filter, and sorting.
  - `GET /api/products/:id`: Individual product details.
  - `POST /api/products`: Create new product (Admin).
  - `PUT /api/products/:id`: Update existing product (Admin).
  - `DELETE /api/products/:id`: Delete product (Admin).
  - `GET /api/admin/stats`: KPI dashboard stats (Admin).
  - `GET /api/orders`: Order history log (Admin).
  - `POST /api/orders`: Order creation.
  - `POST /api/payment/process`: Fake payment gateway processor.

---

## 🚀 How to Run the Application

Start both the Frontend and Backend together with **one command**:

```powershell
npm.cmd start
```

- **Frontend Storefront**: `http://localhost:3000`
- **Admin Portal**: Click the **Admin** button in the top navbar or open the admin view
- **Backend API Health**: `http://localhost:5000/api/health`

---

## 💳 Test Cards & Promo Codes Cheat Sheet

### Promo Coupons
| Coupon Code | Discount | Description |
| :--- | :--- | :--- |
| `DEVOPS20` | **20% OFF** | 20% discount on order subtotal |
| `FREESHIP` | **Free Delivery** | Waives the $9.99 express shipping fee |
| `VELORA10` | **$10.00 OFF** | $10 instant discount on order |

### Test Payment Cards
| Scenario | Card Number | Expiry | CVV | Result |
| :--- | :--- | :--- | :--- | :--- |
| **Success Payment** | `4242 4242 4242 4242` | `12/28` | `123` | **Approved** ➔ Order confirmation receipt |
| **Insufficient Funds** | `4000 0000 0000 0000` | `08/27` | `456` | **Declined** ➔ Warning banner: "Insufficient balance" |
| **Expired Card** | `4242 4242 4242 4242` | `01/22` | `789` | **Declined** ➔ Warning banner: "Your card has expired" |
