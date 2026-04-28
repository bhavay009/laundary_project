const mongoose = require('mongoose');

// ─── Sub-schemas ──────────────────────────────────────────────────────

const garmentSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    pricePerItem: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ─── Main Order Schema ───────────────────────────────────────────────

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    garments: {
      type: [garmentSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: 'At least one garment is required',
      },
    },
    totalBill: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['RECEIVED', 'PROCESSING', 'READY', 'DELIVERED'],
      default: 'RECEIVED',
    },
    estimatedDelivery: {
      type: Date,
    },
    statusHistory: [statusHistorySchema],
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes for performant queries ──────────────────────────────────

orderSchema.index({ customerName: 'text' });
orderSchema.index({ phoneNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
