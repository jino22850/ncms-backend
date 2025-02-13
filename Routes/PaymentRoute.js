const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/Auth');
const { 
  generatePayments, 
  getAllGeneratedPayments,
  approvePayment, 
  sendApprovalEmails,
  getApprovedPayments,
  calculateApprovedPaymentsCurrentMonth,
  calculateApprovedPaymentsPreviousMonth,
  calculatePendingPaymentsCurrentMonth,
  getApprovedPaymentsByFilter
} = require('../Controllers/paymentController');

// Routes
router.post('/payments/generate-all', verifyToken, generatePayments);

router.get('/payments/generated/all',verifyToken,getAllGeneratedPayments);

router.patch('/payment/approve/:id', verifyToken, approvePayment);

router.post('/payments/approved/email', sendApprovalEmails);

router.get('/payments/approved/all', verifyToken, getApprovedPayments);

router.get('/payments/approved/previous-month',calculateApprovedPaymentsPreviousMonth);

router.get('/payments/approved/current-month', calculateApprovedPaymentsCurrentMonth);

router.get('/payments/pending/current-month', calculatePendingPaymentsCurrentMonth);

router.get('/payments/approvedby/all',verifyToken,getApprovedPaymentsByFilter);

module.exports = router;


