const Order = require('../models/Order');

// ─── GET /api/dashboard/stats ─────────────────────────────────────────
// Returns aggregate stats: totals, revenue, status breakdown
exports.getStats = async (_req, res, next) => {
  try {
    const [totalOrders, revenueAgg, statusCounts] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: '$totalBill' } } },
      ]),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    const statusMap = {};
    statusCounts.forEach((s) => {
      statusMap[s._id] = s.count;
    });

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        avgOrderValue:
          totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        pendingPickup: statusMap['READY'] || 0,
        statusBreakdown: {
          RECEIVED: statusMap['RECEIVED'] || 0,
          PROCESSING: statusMap['PROCESSING'] || 0,
          READY: statusMap['READY'] || 0,
          DELIVERED: statusMap['DELIVERED'] || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/dashboard/revenue-trend ─────────────────────────────────
// Returns daily revenue + order count for the last 7 days
exports.getRevenueTrend = async (_req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const trend = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalBill' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing days with zero values for a continuous chart
    const result = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const found = trend.find((t) => t._id === dateStr);
      result.push({
        date: dateStr,
        revenue: found?.revenue || 0,
        orders: found?.orders || 0,
      });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/dashboard/top-garments ──────────────────────────────────
// Returns top 5 garment types by total quantity ordered
exports.getTopGarments = async (_req, res, next) => {
  try {
    const topGarments = await Order.aggregate([
      { $unwind: '$garments' },
      {
        $group: {
          _id: '$garments.type',
          totalQuantity: { $sum: '$garments.quantity' },
          totalRevenue: { $sum: { $multiply: ['$garments.quantity', '$garments.pricePerItem'] } },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $project: {
          type: '$_id',
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1,
          _id: 0,
        },
      },
    ]);

    res.json({ success: true, data: topGarments });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/dashboard/today ─────────────────────────────────────────
// Returns today's order count, revenue, and status breakdown
exports.getTodayStats = async (_req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [todayOrders, todayRevenue] = await Promise.all([
      Order.find({ createdAt: { $gte: startOfDay } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: '$totalBill' }, count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        ordersToday: todayRevenue[0]?.count || 0,
        revenueToday: todayRevenue[0]?.total || 0,
        latestOrders: todayOrders.slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
};

