/**
 * Seed script — populates the database with realistic sample orders.
 * Run: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../src/models/Order');

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/cleanq_laundry';

// ─── Helpers ──────────────────────────────────────────────────────────

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60), 0, 0);
  return d;
};

const addBusinessDays = (date, days) => {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0 && result.getDay() !== 6) added++;
  }
  return result;
};

const buildHistory = (status, createdDate) => {
  const flow = ['RECEIVED', 'PROCESSING', 'READY', 'DELIVERED'];
  const idx = flow.indexOf(status);
  const history = [];
  for (let i = 0; i <= idx; i++) {
    const ts = new Date(createdDate);
    ts.setDate(ts.getDate() + i);
    ts.setHours(ts.getHours() + i * 3);
    history.push({ status: flow[i], timestamp: ts });
  }
  return history;
};

// ─── Sample Data ──────────────────────────────────────────────────────

const orders = [
  // DELIVERED orders (oldest)
  {
    orderId: 'LD-R4H7K2',
    customerName: 'Rahul Sharma',
    phoneNumber: '9876543210',
    garments: [
      { type: 'Shirt', quantity: 3, pricePerItem: 50 },
      { type: 'Trousers', quantity: 2, pricePerItem: 60 },
    ],
    status: 'DELIVERED',
    notes: 'Regular customer, prefers light starch',
    _daysAgo: 7,
  },
  {
    orderId: 'LD-M9P3A5',
    customerName: 'Priya Patel',
    phoneNumber: '9812345678',
    garments: [
      { type: 'Saree', quantity: 2, pricePerItem: 150 },
      { type: 'Blouse', quantity: 2, pricePerItem: 40 },
    ],
    status: 'DELIVERED',
    notes: 'Handle silk sarees with care',
    _daysAgo: 6,
  },
  {
    orderId: 'LD-T2W8N6',
    customerName: 'Amit Kumar',
    phoneNumber: '9898765432',
    garments: [
      { type: 'Suit', quantity: 1, pricePerItem: 250 },
      { type: 'Shirt', quantity: 2, pricePerItem: 50 },
      { type: 'Tie', quantity: 2, pricePerItem: 30 },
    ],
    status: 'DELIVERED',
    notes: '',
    _daysAgo: 6,
  },
  {
    orderId: 'LD-B5X1Q9',
    customerName: 'Sneha Reddy',
    phoneNumber: '9871234560',
    garments: [
      { type: 'Dress', quantity: 2, pricePerItem: 120 },
      { type: 'Scarf', quantity: 1, pricePerItem: 40 },
    ],
    status: 'DELIVERED',
    notes: 'Pickup after 5 PM',
    _daysAgo: 5,
  },
  {
    orderId: 'LD-G8J4L1',
    customerName: 'Vikram Singh',
    phoneNumber: '9845678901',
    garments: [
      { type: 'Blazer', quantity: 1, pricePerItem: 200 },
      { type: 'Trousers', quantity: 3, pricePerItem: 60 },
    ],
    status: 'DELIVERED',
    notes: '',
    _daysAgo: 5,
  },

  // READY orders
  {
    orderId: 'LD-C3F6D8',
    customerName: 'Meera Nair',
    phoneNumber: '9823456789',
    garments: [
      { type: 'Kurta', quantity: 4, pricePerItem: 80 },
      { type: 'Dupatta', quantity: 2, pricePerItem: 50 },
    ],
    status: 'READY',
    notes: 'Call before delivery',
    _daysAgo: 3,
  },
  {
    orderId: 'LD-Y7E2V4',
    customerName: 'Arjun Mehta',
    phoneNumber: '9867891234',
    garments: [
      { type: 'Jeans', quantity: 3, pricePerItem: 70 },
      { type: 'T-Shirt', quantity: 5, pricePerItem: 40 },
    ],
    status: 'READY',
    notes: '',
    _daysAgo: 3,
  },
  {
    orderId: 'LD-N1S5Z3',
    customerName: 'Kavita Joshi',
    phoneNumber: '9856789012',
    garments: [
      { type: 'Bedsheet', quantity: 3, pricePerItem: 80 },
      { type: 'Curtain', quantity: 2, pricePerItem: 120 },
    ],
    status: 'READY',
    notes: 'Large items, extra drying time',
    _daysAgo: 2,
  },
  {
    orderId: 'LD-U9K7W2',
    customerName: 'Rohan Gupta',
    phoneNumber: '9834567890',
    garments: [
      { type: 'Shirt', quantity: 5, pricePerItem: 50 },
      { type: 'Trousers', quantity: 3, pricePerItem: 60 },
    ],
    status: 'READY',
    notes: '',
    _daysAgo: 2,
  },

  // PROCESSING orders
  {
    orderId: 'LD-H4P8M6',
    customerName: 'Ananya Desai',
    phoneNumber: '9812340987',
    garments: [
      { type: 'Dress', quantity: 3, pricePerItem: 120 },
      { type: 'Jacket', quantity: 1, pricePerItem: 180 },
    ],
    status: 'PROCESSING',
    notes: 'Stain removal on jacket',
    _daysAgo: 2,
  },
  {
    orderId: 'LD-Q6R1T5',
    customerName: 'Sanjay Verma',
    phoneNumber: '9878901234',
    garments: [
      { type: 'Coat', quantity: 1, pricePerItem: 250 },
      { type: 'Sweater', quantity: 2, pricePerItem: 100 },
    ],
    status: 'PROCESSING',
    notes: 'Wool items, gentle wash',
    _daysAgo: 1,
  },
  {
    orderId: 'LD-X3A9B7',
    customerName: 'Deepa Iyer',
    phoneNumber: '9890123456',
    garments: [
      { type: 'Saree', quantity: 1, pricePerItem: 150 },
      { type: 'Kurta', quantity: 2, pricePerItem: 80 },
      { type: 'Churidar', quantity: 2, pricePerItem: 60 },
    ],
    status: 'PROCESSING',
    notes: '',
    _daysAgo: 1,
  },
  {
    orderId: 'LD-F2G5J8',
    customerName: 'Karan Malhotra',
    phoneNumber: '9867654321',
    garments: [
      { type: 'Suit', quantity: 2, pricePerItem: 250 },
      { type: 'Shirt', quantity: 4, pricePerItem: 50 },
    ],
    status: 'PROCESSING',
    notes: 'Wedding outfits, priority',
    _daysAgo: 1,
  },

  // RECEIVED orders (newest)
  {
    orderId: 'LD-W5D2E9',
    customerName: 'Neha Agarwal',
    phoneNumber: '9843210987',
    garments: [
      { type: 'Skirt', quantity: 2, pricePerItem: 60 },
      { type: 'Blouse', quantity: 3, pricePerItem: 40 },
      { type: 'Scarf', quantity: 1, pricePerItem: 40 },
    ],
    status: 'RECEIVED',
    notes: '',
    _daysAgo: 0,
  },
  {
    orderId: 'LD-L8V3I1',
    customerName: 'Rajesh Khanna',
    phoneNumber: '9821098765',
    garments: [
      { type: 'Towel', quantity: 6, pricePerItem: 30 },
      { type: 'Bedsheet', quantity: 2, pricePerItem: 80 },
    ],
    status: 'RECEIVED',
    notes: 'Bulk order, regular client',
    _daysAgo: 0,
  },
  {
    orderId: 'LD-O4Z6S0',
    customerName: 'Pooja Chatterjee',
    phoneNumber: '9809876543',
    garments: [
      { type: 'Dress', quantity: 1, pricePerItem: 120 },
      { type: 'Jacket', quantity: 1, pricePerItem: 180 },
    ],
    status: 'RECEIVED',
    notes: 'Need by Friday',
    _daysAgo: 0,
  },
  {
    orderId: 'LD-J7M0P4',
    customerName: 'Aditya Banerjee',
    phoneNumber: '9865432109',
    garments: [
      { type: 'Shirt', quantity: 6, pricePerItem: 50 },
      { type: 'Trousers', quantity: 4, pricePerItem: 60 },
      { type: 'Blazer', quantity: 1, pricePerItem: 200 },
    ],
    status: 'RECEIVED',
    notes: 'Office wardrobe, weekly pickup',
    _daysAgo: 0,
  },
];

// ─── Seed Runner ──────────────────────────────────────────────────────

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    await Order.deleteMany({});
    console.log('🗑️  Cleared existing orders');

    const enriched = orders.map((o) => {
      const created = daysAgo(o._daysAgo);
      const totalBill = o.garments.reduce(
        (sum, g) => sum + g.quantity * g.pricePerItem,
        0
      );
      const { _daysAgo, ...rest } = o;
      return {
        ...rest,
        totalBill,
        estimatedDelivery: addBusinessDays(created, 3),
        statusHistory: buildHistory(o.status, created),
        createdAt: created,
        updatedAt: new Date(),
      };
    });

    await Order.insertMany(enriched);
    console.log(`✅ Seeded ${enriched.length} orders successfully`);

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
