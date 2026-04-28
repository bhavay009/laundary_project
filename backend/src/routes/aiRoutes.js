const express = require('express');
const router = express.Router();
const {
  getPricingSuggestions,
  analyzeOrder,
  getBusinessInsights,
  getDeliveryEstimate,
} = require('../controllers/aiController');

router.get('/pricing-suggestions', getPricingSuggestions);
router.post('/analyze-order', analyzeOrder);
router.get('/business-insights', getBusinessInsights);
router.get('/delivery-estimate', getDeliveryEstimate);

module.exports = router;
