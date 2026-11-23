import { db } from '../db/db.js';

export async function createOrder(req, res) {
  try {
    const {
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
      items
    } = req.body;

    if (!customer_name || !customer_email || !shipping_address || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required order fields (customer info, address, or items).'
      });
    }

    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await db.createOrder({
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
      total_amount,
      items
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Server error creating order' });
  }
}

export async function getOrderById(req, res) {
  try {
    const order = await db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getAllOrders(req, res) {
  try {
    const orders = await db.getAllOrders();
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ success: false, message: 'Server error fetching orders' });
  }
}
