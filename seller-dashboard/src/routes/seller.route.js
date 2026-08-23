const express = require('express')
const routes = express.Router()
const createAuthMiddleware = require('../middleware/auth.middleware')
const sellerController = require('../controllers/seller.controller')

routes.get("/metrics", 
    createAuthMiddleware(["seller"]),
    sellerController.getMetrics
)

routes.get("/orders",
    createAuthMiddleware(["seller"]),
    sellerController.getOrders
)
routes.get("/products",
    createAuthMiddleware(["seller"]),
    sellerController.getProducts
)


module.exports = routes