const express = require('express');
const router = express.Router();
const { generateRecommendation, bulkAnalyze } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/recommend/:id', generateRecommendation);
router.get('/bulk-analyze', bulkAnalyze);

module.exports = router;
