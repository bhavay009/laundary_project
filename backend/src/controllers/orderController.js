const Order = require('../models/Order');
const generateOrderId = require('../utils/generateOrderId');
const { AppError } = require('../middleware/errorHandler');

// ─── Helpers ──────────────────────────────────────────────────────────

/** Add N business days (skip weekends) */
const addBusinessDays = (date, days) => {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0 && result.getDay() !== 6) added++;
  }
  return result;
};

const STATUS_FLOW = ['RECEIVED', 'PROCESSING', 'READY', 'DELIVERED'];

// ─── GET /api/orders ──────────────────────────────────────────────────
// List orders with optional status filter, search, pagination, sort
exports.getOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 12, sort = '-createdAt' } = req.query;

    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { customerName: { $regex: escaped, $options: 'i' } },
        { phoneNumber: { $regex: escaped, $options: 'i' } },
        { orderId: { $regex: escaped, $options: 'i' } },
      ];
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/orders/:id ──────────────────────────────────────────────
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new AppError('Order not found', 404));
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/orders ─────────────────────────────────────────────────
exports.createOrder = async (req, res, next) => {
  try {
    const { customerName, phoneNumber, garments, notes } = req.body;

    // Calculate total
    const totalBill = garments.reduce(
      (sum, g) => sum + g.quantity * g.pricePerItem,
      0
    );

    // Generate unique order ID
    let orderId = generateOrderId();
    while (await Order.findOne({ orderId })) {
      orderId = generateOrderId();
    }

    const estimatedDelivery = addBusinessDays(new Date(), 3);

    const order = await Order.create({
      orderId,
      customerName: customerName.trim(),
      phoneNumber: phoneNumber.trim(),
      garments,
      totalBill,
      status: 'RECEIVED',
      estimatedDelivery,
      notes: notes || '',
      statusHistory: [{ status: 'RECEIVED', timestamp: new Date() }],
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/orders/:id ──────────────────────────────────────────────
exports.updateOrder = async (req, res, next) => {
  try {
    const { customerName, phoneNumber, garments, notes } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return next(new AppError('Order not found', 404));

    if (order.status === 'DELIVERED') {
      return next(new AppError('Cannot edit a delivered order', 400));
    }

    if (customerName) order.customerName = customerName.trim();
    if (phoneNumber) order.phoneNumber = phoneNumber.trim();
    if (notes !== undefined) order.notes = notes;

    if (garments && garments.length > 0) {
      order.garments = garments;
      order.totalBill = garments.reduce(
        (sum, g) => sum + g.quantity * g.pricePerItem,
        0
      );
    }

    await order.save();
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/orders/:id/status ─────────────────────────────────────
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!STATUS_FLOW.includes(status)) {
      return next(new AppError('Invalid status value', 400));
    }

    const order = await Order.findById(req.params.id);
    if (!order) return next(new AppError('Order not found', 404));

    const currentIdx = STATUS_FLOW.indexOf(order.status);
    const newIdx = STATUS_FLOW.indexOf(status);

    if (newIdx <= currentIdx) {
      return next(new AppError('Status can only move forward in the pipeline', 400));
    }

    order.status = status;
    order.statusHistory.push({ status, timestamp: new Date() });

    await order.save();
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/orders/:id ───────────────────────────────────────────
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new AppError('Order not found', 404));

    await order.deleteOne();
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
