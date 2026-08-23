const express = require('express')
const sellerRoutes = require('./routes/seller.route')
const cookieParser = require('cookie-parser')



const app = express()
app.use(express.json())
app.use(cookieParser())

app.get("/", (req, res ) => {
    res.status(200).json({
        message: "Seller service is running"
    })
})


app.use("/seller", sellerRoutes)


module.exports = app