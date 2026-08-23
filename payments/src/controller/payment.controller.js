const paymentModel = require('../models/payment.model')
const axios = require('axios')
const Razorpay = require('razorpay');
const { publishToQueue } = require('../broker/broker.js')

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createPayment = async (req, res) => {
    try {
        const user = req.user
        const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1]
        const orderId = req.params.orderId
        console.log("User:", user)

        const orderResponse = await axios.get(`http://localhost:3003/orders/${orderId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        console.log(orderResponse?.data)

        const price = orderResponse?.data?.order?.totalPrice

        const order = await razorpay.orders.create(price);

        const payment = await paymentModel.create({
            order: orderId,
            razorpayOrderId: order.id,
            user: user.id,
            price: {
                amount: order.amount,
                currency: order.currency
            }
        })

        // PAYMENT_NOTIFICATION.PAYMENT_INITIATED
        await publishToQueue("PAYMENT_NOTIFICATION.PAYMENT_INITIATED", {
            email: user.email,
            paymentId: payment._id,
            orderId: payment.order,
            amount: payment.price.amount / 100,
            currency: payment.price.currency,
            fullName: user.fullName,
        })

        // SELLER_DASHBOARD.PAYMENT_CREATED

        await publishToQueue("SELLER_DASHBOARD.PAYMENT_CREATED", payment);

        res.status(201).json({
            message: "Payment initiated",
            payment
        })

    } catch (error) {
        // console.log(error)
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        })
    }
}

const verifyPayment = async (req, res) => {
    const { razorpayOrderId, razorpayPaymentId, signature } = req.body
    const secret = process.env.RAZORPAY_KEY_SECRET

    try {
        const { validatePaymentVerification } = require('../../node_modules/razorpay/dist/utils/razorpay-utils.js')

        const isValid = validatePaymentVerification(
            { order_id: razorpayOrderId, payment_id: razorpayPaymentId },
            signature,
            secret,
        );

        if (!isValid) {
            return res.status(400).send('Invalid signature');
        }

        const payment = await paymentModel.findOne({
            razorpayOrderId,
            status: 'PENDING'
        })

        if (!payment) {
            return res.status(404).json({
                message: "Payment not found"
            })
        }

        payment.paymentId = razorpayPaymentId;
        payment.signature = signature;
        payment.status = 'COMPLETED';
        await payment.save();

        await publishToQueue("PAYMENT_NOTIFICATION.PAYMENT_COMPLETED", {
            email: req.user.email,
            paymentId: payment._id,
            orderId: payment.order,
            amount: payment.price.amount / 100,
            currency: payment.price.currency,
            fullName: req.user.fullName,
        })

        // SELLER_DASHBOARD.PAYMENT_UPDATED
        await publishToQueue("SELLER_DASHBOARD.PAYMENT_UPDATED", payment);

        res.status(200).json({
            message: "Payment verified successfully",
            payment
        })

    } catch (error) {
        console.log(error);

        await publishToQueue("PAYMENT_NOTIFICATION.PAYMENT_FAILED", {
            email: req.user.email,
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
            fullName: req.user.fullName,
        })
        res.status(500).send('Error verifying payment');
    }
}

module.exports = {
    createPayment,
    verifyPayment
}