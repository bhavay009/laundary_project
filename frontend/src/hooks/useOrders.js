import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'laundry_orders';

// Generate unique order ID like LDRY1001
const generateOrderId = (existingOrders) => {
  const maxNum = existingOrders.reduce((max, order) => {
    const num = parseInt(order.id.replace('LDRY', ''), 10);
    return num > max ? num : max;
  }, 1000);
  return `LDRY${maxNum + 1}`;
};

// Get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Initial dummy orders
const initialOrders = [
  {
    id: 'LDRY1001',
    customerName: 'Rahul Sharma',
    phone: '9876543210',
    garments: [
      { name: 'Shirt', quantity: 3, price: 50 },
      { name: 'Pants', quantity: 2, price: 80 },
    ],
    totalAmount: 310,
    status: 'PROCESSING',
    date: getCurrentDate(),
  },
  {
    id: 'LDRY1002',
    customerName: 'Priya Patel',
    phone: '9123456789',
    garments: [
      { name: 'Saree', quantity: 2, price: 150 },
      { name: 'Blouse', quantity: 1, price: 100 },
    ],
    totalAmount: 400,
    status: 'READY',
    date: getCurrentDate(),
  },
  {
    id: 'LDRY1003',
    customerName: 'Amit Kumar',
    phone: '9988776655',
    garments: [
      { name: 'Jeans', quantity: 4, price: 60 },
      { name: 'T-Shirt', quantity: 2, price: 40 },
    ],
    totalAmount: 320,
    status: 'RECEIVED',
    date: getCurrentDate(),
  },
];

export function useOrders() {
  const [orders, setOrders] = useState(() => {
    // Try to load from localStorage on initialization
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse stored orders:', e);
        }
      }
    }
    return initialOrders;
  });

  // Save to localStorage whenever orders change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    }
  }, [orders]);

  // Create new order
  const addOrder = useCallback((orderData) => {
    const newOrder = {
      id: generateOrderId(orders),
      customerName: orderData.customerName,
      phone: orderData.phone,
      garments: orderData.garments,
      totalAmount: orderData.garments.reduce(
        (sum, g) => sum + g.quantity * g.price,
        0
      ),
      status: 'RECEIVED',
      date: getCurrentDate(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  }, [orders]);

  // Update order status
  const updateOrderStatus = useCallback((orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  }, []);

  // Update entire order
  const updateOrder = useCallback((orderId, updates) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, ...updates } : order
      )
    );
  }, []);

  // Delete order
  const deleteOrder = useCallback((orderId) => {
    setOrders((prev) => prev.filter((order) => order.id !== orderId));
  }, []);

  // Get single order
  const getOrder = useCallback((orderId) => {
    return orders.find((order) => order.id === orderId);
  }, [orders]);

  // Filter orders
  const filterOrders = useCallback((searchTerm, statusFilter) => {
    return orders.filter((order) => {
      const matchesSearch =
        !searchTerm ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phone.includes(searchTerm) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        !statusFilter || statusFilter === 'ALL' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders]);

  return {
    orders,
    addOrder,
    updateOrderStatus,
    updateOrder,
    deleteOrder,
    getOrder,
    filterOrders,
  };
}

export default useOrders;