const express = require('express')
const authRoutes = express.Router()
const validator = require('../middleware/validator.middleware')
const authController = require('../controller/auth.controller')
const authMiddleware = require('../middleware/auth.middleware')

authRoutes.post("/register", validator.registerUserValidation, authController.registerUser)

// login

authRoutes.post("/login", validator.loginUserValidation, authController.loginUser)

// logout

authRoutes.get("/logout", authController.logoutUser)

// get currentUser
authRoutes.get("/me", authMiddleware.authMiddleware, authController.getUserData)

// address

authRoutes.get("/users/me/addresses", authMiddleware.authMiddleware, authController.userAddress)
authRoutes.post('/users/me/addresses', validator.addUserAddressValidation, authMiddleware.authMiddleware, authController.addUserAddress)
authRoutes.delete('/users/me/addresses/:addressId', authMiddleware.authMiddleware, authController.deleteUserAddress)


module.exports = authRoutes
