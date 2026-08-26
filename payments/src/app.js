require('dotenv').config()
const express = require('express')
const connectToDB = require('./db/db')
const paymentRoutes = require('./routes/payment.route')
const { connect } = require('./broker/broker')

// middle ware
const cookieParser = require('cookie-parser')

// connect to database
connectToDB()

// connect to rabbitmq
connect()


// create server
const app = express()


// use middlewwre
app.use(express.json())
app.use(cookieParser())


app.get("/", (req, res) => {
    res.status(200).json({
        message: "Payment service is running"
    })
})


// use routes
app.use('/api/payments', paymentRoutes)

module.exports = app