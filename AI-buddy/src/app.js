require('dotenv').config()
const express = require('express')
const connectToDB = require('./db/db')

connectToDB()

const app = express()
app.use(express.json())

app.get("/", (req, res ) => {
    res.status(200).json({
        message: "AI service is running"
    })
})

module.exports = app