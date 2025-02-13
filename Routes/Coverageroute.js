const express = require('express');
const router = express.Router();
const coverageController = require('../Controllers/CoverageController');
const verifyToken = require('../middleware/Auth');


// Add new coverage
router.post('/coverage/add', verifyToken , coverageController.addCoverage);

// Get all coverages
router.get('/coverage/all', verifyToken, coverageController.getAllCoverages);

// Get a specific coverage by coverage number
router.get('/coverage/:coverageNumber',  coverageController.getCoverageByNumber);

router.get('/coverages/telecast',  coverageController.getCoveragesByTelecastDate);

// Define the route for filtering coverages
router.get('/coverages/filter', verifyToken, coverageController.filterCoverages);


// Update a coverage by coverage number
router.put('/coverage/update/:coverageNumber',verifyToken, coverageController.updateCoverage);

// Delete a coverage by coverage number
router.delete('/coverage/delete/:coverageNumber', coverageController.deleteCoverage);

router.get('/coverages/current-month', verifyToken, coverageController.getCoveragesCurrentMonth);

router.get('/coverages/month-count-for-all', verifyToken, coverageController.getCoverageCountByCorrespondent);

router.get('/coverages/type',verifyToken,coverageController.getCoverageCountsByType);

router.get('/coverages/district-wise-coverages',verifyToken, coverageController. getCoveragesByDistrict);

// router.get('/coverages/district-coverage-payments',verifyToken, coverageController. getCoveragePaymentsByDistrict);

router.get('/coverage/payment/all', verifyToken, coverageController.getAllCoverage);





module.exports = router;
