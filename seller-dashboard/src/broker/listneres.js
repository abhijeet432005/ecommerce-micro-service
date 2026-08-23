const { subscribeToQueue } = require("./broker")
const userModel = require("../models/user.model")
const productModel = require("../models/product.model")
const orderModel = require("../models/orders.models")
const paymentModel = require("../models/payment.model")



module.exports = function () {
    subscribeToQueue("AUTH_SELLER_DASHBOARD.USER_CREATED", async (user) => {
        await userModel.create(user)
    })

    // product events
    subscribeToQueue("PRODUCT_SELLER_DASHBOARD.PRODUCT_CREATED", async (product) => {
        await productModel.create(product)
    })

    subscribeToQueue("PRODUCT_SELLER_DASHBOARD.PRODUCT_UPDATED", async (product) => {
        await productModel.findOneAndUpdate({ _id: product._id }, product)
    })

    subscribeToQueue("PRODUCT_SELLER_DASHBOARD.PRODUCT_DELETED", async (product) => {
        await productModel.deleteOne({ _id: product.id })
    })


    // order events
    subscribeToQueue("PRODUCT_SELLER_DASHBOARD.ORDER_CREATED", async (order) => {
        await orderModel.create(order)
    })


    // payment events
    // SELLER_DASHBOARD.PAYMENT_CREATED
    subscribeToQueue("SELLER_DASHBOARD.PAYMENT_CREATED", async (payment) => {
        await paymentModel.create(payment)
    })

    // SELLER_DASHBOARD.PAYMENT_UPDATED
    subscribeToQueue("SELLER_DASHBOARD.PAYMENT_UPDATED", async (payment) => {
        await paymentModel.findOneAndUpdate({ orderId: payment.orderId }, { ...payment })
    })
}