import express from 'express';
import {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminStats
} from '../controllers/productController.js';
import { createOrder, getOrderById, getAllOrders } from '../controllers/orderController.js';
import { processPayment } from '../controllers/paymentController.js';
import { getHealth } from '../controllers/healthController.js';
import { register, login, getUserOrders } from '../controllers/authController.js';

const router = express.Router();

// Health Check Endpoint (Essential for DevOps / Liveness Probes)
router.get('/health', getHealth);

// Authentication & User Accounts
router.post('/auth/register', register);
router.post('/auth/login', login);

// Admin Stats
router.get('/admin/stats', getAdminStats);

// Product Catalog (Public & Admin)
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/categories', getCategories);

// Orders (Public, Customer History & Admin)
router.post('/orders', createOrder);
router.get('/orders', getAllOrders);
router.get('/orders/user/:email', getUserOrders);
router.get('/orders/:id', getOrderById);

// Simulated Payment Gateway
router.post('/payment/process', processPayment);

export default router;
