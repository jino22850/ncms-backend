const Payment = require('../models/Payment');
const Coverage = require('../models/Coverage');
const Correspondent = require('../models/Correspondent');
const moment = require('moment');
const nodemailer = require('nodemailer');

const generatePayments = async (req, res) => {
  const { month, year } = req.body;

  if (!month || !year) {
    return res.status(400).json({ message: 'Missing required fields: month or year.' });
  }

  try {
    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const correspondents = await Coverage.distinct('correspondent', {
      telecastDate: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    if (correspondents.length === 0) {
      return res.status(404).json({ message: 'No correspondents found for the specified criteria.' });
    }

    const results = [];
    for (const correspondentId of correspondents) {
      const correspondent = await Correspondent.findById(correspondentId);
      if (!correspondent) {
        results.push({
          correspondentId,
          message: 'Correspondent not found.',
        });
        continue;
      }

      const existingPayment = await Payment.findOne({ correspondentId, month, year });
      if (existingPayment) {
        results.push({
          correspondentId,
          message: 'Payment already exists for this correspondent.',
        });
        continue;
      }

      const coverages = await Coverage.find({
        correspondent: correspondentId,
        telecastDate: {
          $gte: startDate,
          $lt: endDate,
        },
      });

      if (coverages.length === 0) {
        results.push({
          correspondentId,
          message: 'No coverages found for this correspondent.',
        });
        continue;
      }

      let totalAmount = 0;
      const newsDetails = coverages.map((coverage) => {
        let amount = 0;
        if (coverage.telecastType === 'With Voice') amount = 3000;
        else if (coverage.telecastType === 'Without Voice') amount = 2000;
        else if (coverage.telecastType === 'Not Telecast') amount = 1000;

        totalAmount += amount;

        return {
          coverageId: coverage._id,
          coverageNumber: coverage.coverageNumber,
          receivedDate: coverage.receivedDate,
          telecastDate: coverage.telecastDate,
          telecastType: coverage.telecastType,
          amount,
        };
      });

      const payment = new Payment({
        correspondentId,
        month,
        year,
        totalAmount,
        newsDetails,
        approved: false, 
      });

      await payment.save();



      results.push({
        correspondentId,
        correspondentName: correspondent.name, 
        correspondentNIC:correspondent.NIC,
        CorId: correspondent.CorId,           
        district: correspondent.district,      
        totalAmount: payment.totalAmount,     
        payment: {
          _id: payment._id,
          newsDetails: payment.newsDetails,
        },
      });
    }

    res.status(201).json({ message: 'Payments generated.', results });
  } catch (error) {
    console.error('Error generating payments:', error);
    res.status(500).json({ message: 'Error generating payments.', error });
  }
};


// get all generated payments
const getAllGeneratedPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('correspondentId', 'name NIC district CorId')  
      .exec();

    if (payments.length === 0) {
      return res.status(404).json({ message: 'No payments found.' });
    }

    res.status(200).json(
      payments.map((payment) => ({
        _id: payment._id,
        correspondentName: payment.correspondentId?.name || 'Unknown',
        correspondentNIC: payment.correspondentId?.NIC || 'unknown',
        correspondentDistrict: payment.correspondentId?.district || 'Unknown',
        correspondentCorId: payment.correspondentId?.CorId || 'Unknown',
        totalAmount: payment.totalAmount,
        month: payment.month,
        year: payment.year,
        approved: payment.approved,
        newsDetails: payment.newsDetails,
      }))
    );
  } catch (error) {
    console.error('Error fetching all payments:', error);
    res.status(500).json({ message: 'Error fetching payments.', error });
  }
};


// approve payment
const approvePayment = async (req, res) => {
  const { id } = req.params;

  try {
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found.' });
    }

    if (payment.approved) {
      return res.status(400).json({ message: 'Payment is already approved.' });
    }

    payment.approved = true;
    const updatedPayment = await payment.save();

    res.status(200).json({
      message: 'Payment approved successfully.',
      payment: updatedPayment,
    });
  } catch (error) {
    console.error('Error approving payment:', error);
    res.status(500).json({ message: 'Error approving payment.', error });
  }
};

// Send email to all correspondents with approved payments
const sendApprovalEmails = async (req, res) => {
  try {
    const approvedPayments = await Payment.find({ approved: true })
      .populate('correspondentId', 'email name district CorId')
      .exec();

    if (approvedPayments.length === 0) {
      return res.status(404).json({ message: 'No approved payments found.' });
    }

    for (const payment of approvedPayments) {
      const email = payment.correspondentId?.email;
      const name = payment.correspondentId?.name || 'Correspondent';
      const totalAmount = payment.totalAmount;
      const month = payment.month;
      const year = payment.year;

      if (email) {
        const subject = `Payment Approval Notification for ${month}/${year}`;
        const text = `Dear ${name},\n\nYour payment of ${totalAmount} for ${month}/${year} has been approved.\n\nThank you for your contributions!\n\nBest regards,\nXpressBookings Team`;

        await sendEmail(email, subject, text);
      }
    }

    res.status(200).json({ success: true, message: 'Emails sent to all approved payments.' });
  } catch (error) {
    console.error('Error sending emails for approved payments:', error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
};

// send an email
const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, 
      auth: {
        user: 'xpressbookings14@gmail.com',
        pass: 'tizh hnfd bxst xpzs',
      },
    });

    await transporter.sendMail({
      from: '"XpressBookings" <xpressbookings14@gmail.com>',
      to, 
      subject,
      text, 
    });

    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Get all approved payments
const getApprovedPayments = async (req, res) => {
    try {
      const approvedPayments = await Payment.find({ approved: true })
        .populate('correspondentId', 'name district CorId NIC')
        .exec();
  
      if (approvedPayments.length === 0) {
        return res.status(404).json({ message: 'No approved payments found.' });
      }
  
      res.status(200).json(
        approvedPayments.map((payment) => ({
          _id: payment._id,
          correspondentName: payment.correspondentId?.name || 'Unknown',
          correspondentDistrict: payment.correspondentId?.district || 'Unknown',
          correspondentCorId: payment.correspondentId?.CorId || 'Unknown',
          correspondentNIC: payment.correspondentId?.NIC || 'Unknown',
          totalAmount: payment.totalAmount,
          month: payment.month,
          year: payment.year,
          newsDetails: payment.newsDetails,
        }))
      );
    } catch (err) {
      console.error('Error fetching approved payments:', err);
      res.status(500).json({ message: 'Server error, please try again later.' });
    }
  };
  
  // calculate total approved payments for the previous month
  const calculateApprovedPaymentsPreviousMonth = async (req, res) => {
    try {
      const firstDayPrevMonth = moment().subtract(1, 'month').startOf('month').toDate();
      const lastDayPrevMonth = moment().subtract(1, 'month').endOf('month').toDate();
  
      const approvedPayments = await Payment.find({
        approved: true,
        createdAt: { $gte: firstDayPrevMonth, $lt: lastDayPrevMonth },
      });
  
      if (approvedPayments.length === 0) {
        return res.status(404).json({ message: 'No approved payments found for the previous month.' });
      }
  
      const totalApprovedAmount = approvedPayments.reduce((acc, payment) => acc + payment.totalAmount, 0);
  
      res.status(200).json({ totalApprovedAmount });
    } catch (error) {
      console.error('Error calculating approved payments for the previous month:', error);
      res.status(500).json({ message: 'Error calculating approved payments.', error });
    }
  };
  
  // calculate total approved payments for the current month
  const calculateApprovedPaymentsCurrentMonth = async (req, res) => {
    try {
      const firstDayCurrentMonth = moment().startOf('month').toDate();
      const lastDayCurrentMonth = moment().endOf('month').toDate();
  
      const approvedPayments = await Payment.find({
        approved: true,
        createdAt: { $gte: firstDayCurrentMonth, $lt: lastDayCurrentMonth },
      });
  
      if (approvedPayments.length === 0) {
        return res.status(404).json({ message: 'No approved payments found for the current month.' });
      }
  
      const totalApprovedAmount = approvedPayments.reduce((acc, payment) => acc + payment.totalAmount, 0);
  
      res.status(200).json({ totalApprovedAmount });
    } catch (error) {
      console.error('Error calculating approved payments for the current month:', error);
      res.status(500).json({ message: 'Error calculating approved payments.', error });
    }
  };
  
  // calculate total pending payments for the current month
  const calculatePendingPaymentsCurrentMonth = async (req, res) => {
    try {
      const firstDayCurrentMonth = moment().startOf('month').toDate();
      const lastDayCurrentMonth = moment().endOf('month').toDate();
  
      const pendingPayments = await Payment.find({
        approved: false,
        createdAt: { $gte: firstDayCurrentMonth, $lt: lastDayCurrentMonth },
      });
  
      if (pendingPayments.length === 0) {
        return res.status(404).json({ message: 'No pending payments found for the current month.' });
      }
  
      const totalPendingAmount = pendingPayments.reduce((acc, payment) => acc + payment.totalAmount, 0);
  
      res.status(200).json({ totalPendingAmount });
    } catch (error) {
      console.error('Error calculating pending payments for the current month:', error);
      res.status(500).json({ message: 'Error calculating pending payments.', error });
    }
  };
  
  // Get all approved payments with filters
  const getApprovedPaymentsByFilter = async (req, res) => {
    const { correspondentId, startDate, endDate } = req.query;
  
    try {
      let filter = { approved: true };
  
      if (correspondentId) {
        if (!mongoose.isValidObjectId(correspondentId)) {
          return res.status(400).json({ message: 'Invalid correspondent ID format.' });
        }
        filter['correspondentId'] = new mongoose.Types.ObjectId(correspondentId); 
      }
  
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        filter['createdAt'] = { $gte: start, $lte: end };
      }
  
      const approvedPayments = await Payment.find(filter)
        .populate('correspondentId', 'name district CorId NIC')
        .exec();
  
      if (approvedPayments.length === 0) {
        return res.status(404).json({ message: 'No approved payments found for the given filters.' });
      }
  
      res.status(200).json(
        approvedPayments.map((payment) => ({
          _id: payment._id,
          correspondentName: payment.correspondentId?.name || 'Unknown',
          correspondentDistrict: payment.correspondentId?.district || 'Unknown',
          correspondentCorId: payment.correspondentId?.CorId || 'Unknown',
          correspondentNIC: payment.correspondentId?.NIC || 'Unknown',
          totalAmount: payment.totalAmount,
          month: payment.month,
          year: payment.year,
          newsDetails: payment.newsDetails,
        }))
      );
    } catch (err) {
      console.error('Error fetching approved payments:', err);
      res.status(500).json({ message: 'Server error, please try again later.' });
    }
  };
  

module.exports = {
  generatePayments,
  getAllGeneratedPayments,
  approvePayment,
  sendApprovalEmails,
  getApprovedPayments,
  calculateApprovedPaymentsPreviousMonth,
  calculateApprovedPaymentsCurrentMonth,
  calculatePendingPaymentsCurrentMonth,
  getApprovedPaymentsByFilter
};
