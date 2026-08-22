const express = require('express')
const routes = express.Router()
const createAuthMiddleware = require('../middleware/auth.middleware')
const paymentController = require('../controller/payment.controller')

routes.post("/create/:orderId",
    createAuthMiddleware(["user"]),
    paymentController.createPayment
)
routes.post("/verify",
    createAuthMiddleware(["user"]),
    paymentController.verifyPayment
)


module.exports = routes