import { db, hashPassword } from '../db/db.js';

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    const existing = await db.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email already exists'
      });
    }

    const newUser = await db.createUser({
      name,
      email,
      password,
      role: 'customer'
    });

    const token = `velora_tok_${newUser.id}_${Date.now()}`;

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: newUser,
        token
      }
    });
  } catch (err) {
    console.error('[Auth] Registration error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to create user account'
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const hashedInput = hashPassword(password);
    if (user.password_hash !== hashedInput) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const { password_hash, ...safeUser } = user;
    const token = `velora_tok_${safeUser.id}_${Date.now()}`;

    return res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: safeUser,
        token
      }
    });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
}

export async function getUserOrders(req, res) {
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Customer email is required'
      });
    }

    const orders = await db.getUserOrders(email);
    return res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    console.error('[Auth] Get user orders error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch customer orders'
    });
  }
}
