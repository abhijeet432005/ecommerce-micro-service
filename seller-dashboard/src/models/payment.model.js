const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        requried: true
    },
    order : {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    razorpayOrderId: {
        type: String,
        required: true
    },
    paymentId: {
        type: String
    },
    signature: {
        type: String
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING'
    },
    price: {
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            enum: ['INR', 'USD'],
            default: 'INR',
            required: true
        }
    }
}, {
    timestamps: true
})


const paymentModel = mongoose.model("payment", paymentSchema)

module.exports = paymentModel