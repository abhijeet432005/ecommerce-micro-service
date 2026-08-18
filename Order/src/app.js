require('dotenv').config()
const express = require('express')
const orderRoutes = require('./routes/order.routes')

// middleware
const cookieParser = require('cookie-parser')

// create server 
const app = express()

// use middleware
app.use(express.json())
app.use(cookieParser())

// use routes
app.use('/orders', orderRoutes)

module.exports = app