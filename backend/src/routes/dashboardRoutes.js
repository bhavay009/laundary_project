const express = require('express');
const router = express.Router();
const {
  getStats,
  getRevenueTrend,
  getTopGarments,
  getTodayStats,
} = require('../controllers/dashboardController');

router.get('/stats', getStats);
router.get('/revenue-trend', getRevenueTrend);
router.get('/top-garments', getTopGarments);
router.get('/today', getTodayStats);

module.exports = router;
