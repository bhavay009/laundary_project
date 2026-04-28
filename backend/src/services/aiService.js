/**
 * ─── AI Intelligence Engine ─────────────────────────────────────────────
 *
 * Rule-based AI service that provides smart analysis for laundry orders.
 * Runs entirely offline — no API keys required.
 *
 * Architecture note: Each function follows a provider pattern. To swap in
 * OpenAI/Gemini, replace the rule-based logic inside while keeping the
 * same function signatures. The controller & frontend stay untouched.
 *
 * Capabilities:
 * 1. Smart Pricing        — market-rate suggestions per garment type
 * 2. Care Instructions    — fabric-specific wash/dry/iron tips
 * 3. Anomaly Detection    — flags unusual orders (quantity, value, mix)
 * 4. Order Summary        — natural-language order description
 * 5. Business Insights    — actionable recommendations from order patterns
 * 6. Delivery Estimation  — workload-aware delivery prediction
 */

const Order = require('../models/Order');

// ═══════════════════════════════════════════════════════════════════════
// 1. SMART PRICING — Suggested market rates per garment type
// ═══════════════════════════════════════════════════════════════════════

const PRICING_DATABASE = {
  'Shirt':            { min: 30,  max: 60,  suggested: 50,  category: 'regular' },
  'T-Shirt':          { min: 25,  max: 50,  suggested: 40,  category: 'regular' },
  'Pants / Trousers': { min: 40,  max: 80,  suggested: 60,  category: 'regular' },
  'Jeans':            { min: 50,  max: 90,  suggested: 70,  category: 'regular' },
  'Jacket / Blazer':  { min: 150, max: 300, suggested: 200, category: 'premium' },
  'Suit (2-piece)':   { min: 200, max: 400, suggested: 250, category: 'premium' },
  'Suit (3-piece)':   { min: 300, max: 500, suggested: 350, category: 'premium' },
  'Dress':            { min: 80,  max: 180, suggested: 120, category: 'delicate' },
  'Skirt':            { min: 40,  max: 80,  suggested: 60,  category: 'regular' },
  'Saree':            { min: 100, max: 250, suggested: 150, category: 'delicate' },
  'Kurta':            { min: 50,  max: 120, suggested: 80,  category: 'regular' },
  'Bedsheet':         { min: 50,  max: 120, suggested: 80,  category: 'bulk' },
  'Curtain':          { min: 80,  max: 180, suggested: 120, category: 'bulk' },
  'Blanket':          { min: 100, max: 200, suggested: 150, category: 'bulk' },
  'Other':            { min: 30,  max: 100, suggested: 50,  category: 'regular' },
};

/**
 * Returns AI-suggested pricing for all garment types.
 * Used to auto-fill price fields in the order form.
 */
exports.getPricingSuggestions = () => {
  return Object.entries(PRICING_DATABASE).map(([type, data]) => ({
    type,
    ...data,
    confidence: data.category === 'premium' ? 0.92 : 0.88,
    source: 'market_analysis',
  }));
};

// ═══════════════════════════════════════════════════════════════════════
// 2. CARE INSTRUCTIONS — Fabric-specific wash/dry/iron tips
// ═══════════════════════════════════════════════════════════════════════

const CARE_DATABASE = {
  'Shirt':            { wash: 'Machine wash warm (40°C)', dry: 'Tumble dry medium', iron: 'Medium heat', fabric: 'Cotton blend', special: null },
  'T-Shirt':          { wash: 'Machine wash cold (30°C)', dry: 'Tumble dry low', iron: 'Low heat, inside out', fabric: 'Cotton/Polyester', special: null },
  'Pants / Trousers': { wash: 'Machine wash cold, inside out', dry: 'Hang dry recommended', iron: 'Medium heat with steam', fabric: 'Cotton/Poly blend', special: null },
  'Jeans':            { wash: 'Machine wash cold, inside out', dry: 'Hang dry to prevent shrinkage', iron: 'Steam press only', fabric: 'Denim', special: 'Separate from light colors' },
  'Jacket / Blazer':  { wash: 'Dry clean only', dry: 'Professional press', iron: 'Low heat with press cloth', fabric: 'Wool/Polyester', special: 'Use garment bag for storage' },
  'Suit (2-piece)':   { wash: 'Dry clean only', dry: 'Professional press', iron: 'Professional steaming', fabric: 'Wool blend', special: 'Steam between wears to extend cleaning cycle' },
  'Suit (3-piece)':   { wash: 'Dry clean only', dry: 'Professional press', iron: 'Professional steaming', fabric: 'Premium wool', special: 'Handle vest separately, check button security' },
  'Dress':            { wash: 'Gentle cycle or hand wash', dry: 'Lay flat to dry', iron: 'Low heat, test fabric first', fabric: 'Varies', special: 'Check care label for fabric-specific needs' },
  'Skirt':            { wash: 'Machine wash gentle cycle', dry: 'Hang dry', iron: 'Low to medium heat', fabric: 'Cotton/Poly', special: null },
  'Saree':            { wash: 'Dry clean recommended for silk. Hand wash cotton sarees', dry: 'Hang dry in shade', iron: 'Low heat for silk, medium for cotton', fabric: 'Silk/Cotton', special: '⚠️ Test colors for bleeding before wash' },
  'Kurta':            { wash: 'Hand wash or gentle cycle', dry: 'Hang dry in shade', iron: 'Medium heat', fabric: 'Cotton/Khadi', special: 'Embroidered kurtas need inside-out washing' },
  'Bedsheet':         { wash: 'Machine wash warm (40°C)', dry: 'Tumble dry medium', iron: 'High heat, steam press', fabric: 'Cotton', special: 'Wash separately from clothes' },
  'Curtain':          { wash: 'Machine wash cold, gentle cycle', dry: 'Hang dry immediately', iron: 'Medium heat while slightly damp', fabric: 'Cotton/Poly blend', special: 'Check for metal hooks before washing' },
  'Blanket':          { wash: 'Machine wash cold, extra rinse', dry: 'Tumble dry low or line dry', iron: 'Not recommended', fabric: 'Cotton/Wool/Synthetic', special: 'Use large capacity machine' },
  'Other':            { wash: 'Check care label', dry: 'Follow label instructions', iron: 'Test on hidden area first', fabric: 'Unknown', special: 'When in doubt, gentle cycle cold water' },
};

/**
 * Returns care instructions for a list of garment types.
 */
exports.getCareInstructions = (garmentTypes) => {
  return garmentTypes.map((type) => ({
    type,
    care: CARE_DATABASE[type] || CARE_DATABASE['Other'],
  }));
};

// ═══════════════════════════════════════════════════════════════════════
// 3. ANOMALY DETECTION — Flags unusual orders
// ═══════════════════════════════════════════════════════════════════════

const ANOMALY_THRESHOLDS = {
  highQuantity: 15,       // Total items across all garments
  highValue: 2000,        // Total bill in ₹
  premiumMixRatio: 0.6,   // >60% premium items is noteworthy
  duplicateTypeCount: 3,  // Same garment type with qty > 3 batches
};

/**
 * Analyzes an order for anomalies and returns flags.
 * Each flag has a type ('warning' | 'info'), a message, and a suggestion.
 */
exports.detectAnomalies = (order) => {
  const flags = [];
  const totalItems = order.garments.reduce((sum, g) => sum + g.quantity, 0);
  const totalBill = order.garments.reduce((sum, g) => sum + g.quantity * g.pricePerItem, 0);

  // High quantity check
  if (totalItems >= ANOMALY_THRESHOLDS.highQuantity) {
    flags.push({
      type: 'info',
      icon: 'package',
      title: 'Bulk Order Detected',
      message: `${totalItems} items — this is a large order. Consider offering a bulk discount.`,
      suggestion: `Suggest ${Math.round(totalItems * 0.05)}% bulk discount (saves ₹${Math.round(totalBill * 0.05)})`,
    });
  }

  // High value check
  if (totalBill >= 1000) {
    flags.push({
      type: 'info',
      icon: 'sparkles',
      title: 'High-Bill Priority',
      message: `₹${totalBill.toLocaleString()} — High value order detected.`,
      suggestion: 'Suggest 24h Express Service for 20% premium markup.',
    });
  }

  // Premium garment mix check
  const premiumItems = order.garments
    .filter((g) => {
      const pricing = PRICING_DATABASE[g.type];
      return pricing && pricing.category === 'premium';
    })
    .reduce((sum, g) => sum + g.quantity, 0);

  if (totalItems > 0 && premiumItems / totalItems >= ANOMALY_THRESHOLDS.premiumMixRatio) {
    flags.push({
      type: 'warning',
      icon: 'shield-check',
      title: 'Premium Protocol',
      message: `${Math.round((premiumItems / totalItems) * 100)}% premium items — specialized handling required.`,
      suggestion: 'Assign to Head Washer. Use Eco-solvent cleaning mode.',
    });
  }

  // Underpriced garment check
  order.garments.forEach((g) => {
    const pricing = PRICING_DATABASE[g.type];
    if (pricing && g.pricePerItem < pricing.min) {
      flags.push({
        type: 'warning',
        icon: 'alert-triangle',
        title: `Underpriced: ${g.type}`,
        message: `₹${g.pricePerItem} is below market minimum (₹${pricing.min}).`,
        suggestion: `Consider raising to ₹${pricing.suggested} (suggested rate).`,
      });
    }
  });

  return {
    isAnomalous: flags.some((f) => f.type === 'warning'),
    totalFlags: flags.length,
    flags,
  };
};

// ═══════════════════════════════════════════════════════════════════════
// 4. ORDER SUMMARY — Natural language order description
// ═══════════════════════════════════════════════════════════════════════

/**
 * Generates a human-readable summary of an order.
 * Designed to sound natural, not template-y.
 */
exports.generateOrderSummary = (order) => {
  const totalItems = order.garments.reduce((sum, g) => sum + g.quantity, 0);
  const totalBill = order.totalBill || order.garments.reduce((sum, g) => sum + g.quantity * g.pricePerItem, 0);
  const garmentList = order.garments
    .map((g) => `${g.quantity}× ${g.type}`)
    .join(', ');

  const premiumItems = order.garments.filter((g) => {
    const p = PRICING_DATABASE[g.type];
    return p && p.category === 'premium';
  });

  const hasPremium = premiumItems.length > 0;
  const hasBulk = order.garments.some((g) => {
    const p = PRICING_DATABASE[g.type];
    return p && p.category === 'bulk';
  });

  let serviceType = 'standard laundry';
  if (hasPremium) serviceType = 'dry cleaning & laundry';
  else if (hasBulk) serviceType = 'bulk laundry';

  let summary = `${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} order for ${order.customerName}. `;
  summary += `${totalItems} item${totalItems !== 1 ? 's' : ''} (${garmentList}) totaling ₹${totalBill.toLocaleString()}. `;

  if (hasPremium) {
    summary += `Includes premium items (${premiumItems.map((g) => g.type).join(', ')}) requiring specialized care. `;
  }

  if (order.notes) {
    summary += `Customer note: "${order.notes}". `;
  }

  return summary.trim();
};

// ═══════════════════════════════════════════════════════════════════════
// 5. BUSINESS INSIGHTS — Actionable recommendations from order data
// ═══════════════════════════════════════════════════════════════════════

/**
 * Analyzes recent order patterns and returns business recommendations.
 * Queries MongoDB for the last 30 days of data.
 */
exports.generateBusinessInsights = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    allOrders,
    overdueReady,
    todayCount,
    repeatCustomers,
  ] = await Promise.all([
    Order.find({ createdAt: { $gte: thirtyDaysAgo } }),
    Order.find({ status: 'READY', updatedAt: { $lte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } }),
    Order.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    }),
    Order.aggregate([
      { $group: { _id: '$phoneNumber', count: { $sum: 1 }, name: { $first: '$customerName' } } },
      { $match: { count: { $gte: 2 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const insights = [];

  // Overdue pickup alert
  if (overdueReady.length > 0) {
    insights.push({
      type: 'warning',
      icon: 'clock',
      title: 'Overdue Pickups',
      message: `${overdueReady.length} order${overdueReady.length > 1 ? 's are' : ' is'} ready but not picked up for 2+ days.`,
      suggestion: `Contact: ${overdueReady.map((o) => o.customerName).join(', ')}`,
      priority: 'high',
    });
  }

  // Repeat customer detection
  if (repeatCustomers.length > 0) {
    const top = repeatCustomers[0];
    insights.push({
      type: 'success',
      icon: 'users',
      title: 'Loyal Customers Detected',
      message: `${repeatCustomers.length} repeat customer${repeatCustomers.length > 1 ? 's' : ''} found. ${top.name} has ${top.count} orders.`,
      suggestion: 'Consider offering loyalty discounts or priority service.',
      priority: 'medium',
    });
  }

  // Revenue opportunity — premium garments
  const premiumOrderCount = allOrders.filter((o) =>
    o.garments.some((g) => {
      const p = PRICING_DATABASE[g.type];
      return p && p.category === 'premium';
    })
  ).length;

  if (premiumOrderCount > 0) {
    const premiumPercent = Math.round((premiumOrderCount / Math.max(allOrders.length, 1)) * 100);
    insights.push({
      type: 'info',
      icon: 'sparkles',
      title: 'Premium Service Opportunity',
      message: `${premiumPercent}% of orders include premium garments (suits, blazers, sarees).`,
      suggestion: 'Offer an "Express Premium" tier with faster turnaround at 20% markup.',
      priority: 'medium',
    });
  }

  // Workload alert
  if (todayCount >= 8) {
    insights.push({
      type: 'warning',
      icon: 'alert-triangle',
      title: 'High Workload Today',
      message: `${todayCount} orders received today — above typical daily volume.`,
      suggestion: 'Consider extending delivery estimates by 1 business day.',
      priority: 'high',
    });
  } else if (todayCount === 0) {
    insights.push({
      type: 'info',
      icon: 'inbox',
      title: 'Slow Day',
      message: 'No orders received today yet.',
      suggestion: 'Good time for equipment maintenance or marketing outreach.',
      priority: 'low',
    });
  }

  // Pending processing bottleneck
  const processingCount = allOrders.filter((o) => o.status === 'PROCESSING').length;
  if (processingCount >= 5) {
    insights.push({
      type: 'warning',
      icon: 'loader',
      title: 'Processing Bottleneck',
      message: `${processingCount} orders currently in processing — potential delay risk.`,
      suggestion: 'Prioritize oldest processing orders to clear the queue.',
      priority: 'high',
    });
  }

  return insights.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
  });
};

// ═══════════════════════════════════════════════════════════════════════
// 6. DELIVERY ESTIMATION — Workload-aware delivery prediction
// ═══════════════════════════════════════════════════════════════════════

/**
 * Estimates delivery date based on current workload.
 * Default is 3 business days; adds 1 day per 5 pending orders.
 */
exports.estimateDelivery = async (garments) => {
  const pendingCount = await Order.countDocuments({
    status: { $in: ['RECEIVED', 'PROCESSING'] },
  });

  const baseBusinessDays = 3;
  const workloadPenalty = Math.floor(pendingCount / 5);
  const totalDays = Math.min(baseBusinessDays + workloadPenalty, 7); // Cap at 7

  const totalItems = garments.reduce((sum, g) => sum + g.quantity, 0);
  const hasPremium = garments.some((g) => {
    const p = PRICING_DATABASE[g.type];
    return p && p.category === 'premium';
  });

  // Premium items add 1 extra day
  const finalDays = hasPremium ? totalDays + 1 : totalDays;

  return {
    estimatedDays: finalDays,
    baselineDays: baseBusinessDays,
    workloadPenalty,
    premiumPenalty: hasPremium ? 1 : 0,
    currentPendingOrders: pendingCount,
    confidence: pendingCount < 10 ? 0.9 : 0.75,
    reason: workloadPenalty > 0
      ? `${pendingCount} pending orders adding ${workloadPenalty} day${workloadPenalty > 1 ? 's' : ''} to baseline`
      : 'Normal workload — standard timeline',
  };
};
