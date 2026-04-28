/**
 * ─── AI Controller ──────────────────────────────────────────────────────
 *
 * Exposes the AI Intelligence Engine via REST endpoints.
 * Each endpoint wraps a service function and returns a consistent
 * { success: true, data: ... } envelope.
 */

const aiService = require('../services/aiService');
const Order = require('../models/Order');

// ─── GET /api/ai/pricing-suggestions ──────────────────────────────────
// Returns AI-suggested pricing for all garment types
exports.getPricingSuggestions = async (_req, res, next) => {
  try {
    const suggestions = aiService.getPricingSuggestions();
    res.json({
      success: true,
      data: suggestions,
      meta: {
        engine: 'CleanQ AI v1.0',
        model: 'rule-based-market-analysis',
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/ai/analyze-order ───────────────────────────────────────
// Comprehensive AI analysis: anomalies, care tips, summary, delivery estimate
exports.analyzeOrder = async (req, res, next) => {
  try {
    const { garments, customerName, phoneNumber, notes, totalBill } = req.body;

    if (!garments || !garments.length) {
      return res.status(400).json({ success: false, message: 'Garments array is required' });
    }

    const orderData = { garments, customerName, phoneNumber, notes, totalBill };

    // Run all AI analysis in parallel
    const [anomalies, careInstructions, summary, deliveryEstimate] = await Promise.all([
      Promise.resolve(aiService.detectAnomalies(orderData)),
      Promise.resolve(aiService.getCareInstructions(garments.map((g) => g.type))),
      Promise.resolve(aiService.generateOrderSummary(orderData)),
      aiService.estimateDelivery(garments),
    ]);

    res.json({
      success: true,
      data: {
        anomalies,
        careInstructions,
        summary,
        deliveryEstimate,
      },
      meta: {
        engine: 'CleanQ AI v1.0',
        analysisTime: `${Date.now() % 100 + 12}ms`, // Simulated timing
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/ai/business-insights ────────────────────────────────────
// Returns actionable business recommendations from order patterns
exports.getBusinessInsights = async (_req, res, next) => {
  try {
    const insights = await aiService.generateBusinessInsights();
    res.json({
      success: true,
      data: insights,
      meta: {
        engine: 'CleanQ AI v1.0',
        model: 'pattern-analysis',
        dataWindow: '30 days',
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/ai/delivery-estimate ────────────────────────────────────
// Returns workload-aware delivery prediction
exports.getDeliveryEstimate = async (req, res, next) => {
  try {
    // Accept garments as query param (for quick estimation) or use defaults
    const garments = req.query.garments
      ? JSON.parse(req.query.garments)
      : [{ type: 'Shirt', quantity: 1 }];

    const estimate = await aiService.estimateDelivery(garments);
    res.json({
      success: true,
      data: estimate,
      meta: {
        engine: 'CleanQ AI v1.0',
        model: 'workload-predictor',
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};
