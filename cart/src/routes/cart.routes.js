const express = require('express')
const routes = express.Router()
const authMiddleware = require('../middleware/auth.middleware')
const cartController = require('../controller/cart.controller')
const { validateAddItemCart, validateUpdateCartItem } = require('../validators/cart.validator')


routes.post('/items', authMiddleware(["user"]), validateAddItemCart, cartController.addItemToCart)

routes.patch("/items/:productId", authMiddleware(["user"]), validateUpdateCartItem,cartController.updateItemQuantity)

routes.get("/", authMiddleware(["user"]), cartController.getCart)

module.exports = routes