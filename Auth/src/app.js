require('dotenv').config()
const express = require('express')

// routes
const authRoutes = require('./routes/auth.routes')


// Middleware
const cors = require('cors')
const cookieParser = require('cookie-parser')


// Create Sever
const app = express()


// use middleware
app.use(express.json())
app.use(cors())
app.use(cookieParser())


app.get("/", (req, res ) => {
    res.status(200).json({
        message: "Auth service is running"
    })
})



// use routes
app.use("/auth", authRoutes)
app.use("/auth", authRoutes)

module.exports = app
