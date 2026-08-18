require('dotenv').config()
const express = require('express')
const connectToDB = require('./db/db')
const cartRoutes = require('./routes/cart.routes')

// middleware
const cookieParser = require('cookie-parser')

// connect tp DB
connectToDB()

// server created
const app = express()

// user middleware
app.use(express.json())
app.use(cookieParser())

// routes
app.use('/cart', cartRoutes)

module.exports = app