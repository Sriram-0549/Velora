import crypto from 'crypto';
import { db } from '../db/db.js';

/**
 * Fake Payment Gateway Simulation (VeloraPay)
 * Simulates real payment gateway behavior:
 * - Card number validation & brand detection (Visa, Mastercard, Amex)
 * - Artificial network processing delay (1.2 seconds)
 * - Test card triggers:
 *    * Any card starting with "4000" or ending with "0000" => DECLINED (Insufficient funds)
 *    * Any card with invalid expiry (past date) => DECLINED (Card expired)
 *    * Any card ending in "9999" => DECLINED (Fraud suspected)
 *    * Standard test card "4242 4242 4242 4242" => APPROVED (Instant success)
 */
export async function processPayment(req, res) {
  try {
    const {
      amount,
      currency = 'USD',
      cardNumber,
      cardExpMonth,
      cardExpYear,
      cardCvv,
      cardHolder,
      orderData
    } = req.body;

    // Basic Input Validations
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        status: 'FAILED',
        error_code: 'INVALID_AMOUNT',
        message: 'A valid payment amount is required.'
      });
    }

    if (!cardNumber || !cardCvv || !cardExpMonth || !cardExpYear || !cardHolder) {
      return res.status(400).json({
        success: false,
        status: 'FAILED',
        error_code: 'MISSING_PAYMENT_DETAILS',
        message: 'All credit card fields (Name, Number, Expiry, CVV) are required.'
      });
    }

    const cleanCard = cardNumber.toString().replace(/[\s-]/g, '');
    if (cleanCard.length < 13 || cleanCard.length > 19) {
      return res.status(400).json({
        success: false,
        status: 'FAILED',
        error_code: 'INVALID_CARD_NUMBER',
        message: 'Card number must be between 13 and 19 digits.'
      });
    }

    // Detect Card Brand
    let cardBrand = 'Generic Card';
    if (/^4/.test(cleanCard)) cardBrand = 'Visa';
    else if (/^(5[1-5]|2[2-7])/.test(cleanCard)) cardBrand = 'MasterCard';
    else if (/^3[47]/.test(cleanCard)) cardBrand = 'American Express';
    else if (/^6(?:011|5)/.test(cleanCard)) cardBrand = 'Discover';

    const last4 = cleanCard.slice(-4);

    // Simulate Payment Gateway Network Latency (1200ms)
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Expiry Check Simulation
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const expYear = parseInt(cardExpYear, 10) < 100 ? 2000 + parseInt(cardExpYear, 10) : parseInt(cardExpYear, 10);
    const expMonth = parseInt(cardExpMonth, 10);

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      return res.status(402).json({
        success: false,
        status: 'DECLINED',
        error_code: 'CARD_EXPIRED',
        message: 'Your card has expired. Please check your expiration date.'
      });
    }

    // Test Failure Triggers for DevOps & QA Testing
    if (cleanCard.startsWith('4000') || cleanCard.endsWith('0000')) {
      return res.status(402).json({
        success: false,
        status: 'DECLINED',
        error_code: 'INSUFFICIENT_FUNDS',
        message: 'Card declined: Insufficient balance. Try using test card 4242 4242 4242 4242.'
      });
    }

    if (cleanCard.endsWith('9999')) {
      return res.status(402).json({
        success: false,
        status: 'DECLINED',
        error_code: 'FRAUD_SUSPECTED',
        message: 'Card declined by risk evaluation. Contact your issuer.'
      });
    }

    // SUCCESSFUL TRANSACTION
    const transactionId = `txn_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const orderId = orderData?.id || `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create order in DB if order payload provided
    let createdOrder = null;
    if (orderData) {
      createdOrder = await db.createOrder({
        orderId,
        customer_name: orderData.customer_name || cardHolder,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone || '',
        shipping_address: orderData.shipping_address,
        shipping_city: orderData.shipping_city,
        shipping_postal_code: orderData.shipping_postal_code,
        subtotal: orderData.subtotal || amount,
        tax: orderData.tax || 0,
        shipping_fee: orderData.shipping_fee || 0,
        total_amount: amount,
        items: orderData.items || []
      });
    }

    // Save payment record
    const paymentRecord = await db.savePayment({
      order_id: orderId,
      transaction_id: transactionId,
      gateway: 'VELORA_MOCK_PAY',
      amount: parseFloat(amount),
      currency,
      card_last4: last4,
      card_brand: cardBrand,
      payment_status: 'SUCCESS',
      receipt_url: `/api/orders/${orderId}/receipt`
    });

    return res.status(200).json({
      success: true,
      status: 'PAID',
      message: 'Payment authorized and processed successfully.',
      payment: {
        transaction_id: transactionId,
        gateway: 'VeloraPay Simulated Gateway',
        amount: parseFloat(amount),
        currency,
        card_brand: cardBrand,
        card_last4: last4,
        card_holder: cardHolder,
        captured: true,
        receipt_number: `RCP-${Date.now().toString().slice(-6)}`
      },
      order: createdOrder || { id: orderId }
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      status: 'ERROR',
      error_code: 'GATEWAY_ERROR',
      message: 'Internal error processing payment transaction'
    });
  }
}
