require('dotenv').config()
const express = require('express')
const ConnectToDB = require('./db/db')
const productRoutes = require('./routes/product.routes')


// The test suite owns its database connection (MongoDB Memory Server).
if (process.env.NODE_ENV !== 'test') {
    ConnectToDB()
}

// middleware
const cookieParser = require('cookie-parser')

// create server
const app = express()

// use middleware
app.use(express.json())
app.use(cookieParser())


// routes
app.use('/products', productRoutes)

module.exports = app
