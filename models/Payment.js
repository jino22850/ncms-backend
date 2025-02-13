const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  correspondentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Correspondent',
    required: true,
  },

  month: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  newsDetails: [
    {
      coverageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coverage',
        required: true,
      },
      coverageNumber: { type: String, required: true },
      receivedDate: { type: Date, required: true },
      telecastDate: { type: Date, required: true },
      telecastType: { type: String, required: true },
      amount: { type: Number, required: true },
    },
  ],
  approved: { type: Boolean, default: false },
});

module.exports = mongoose.model('Payment', paymentSchema);
