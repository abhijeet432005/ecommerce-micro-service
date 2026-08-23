require('dotenv').config();
const express = require('express')
const { connect } = require('./broker/broker')
const setListeners = require("./broker/listners")

connect().then(() => {
    setListeners()
})

const app = express()
app.use(express.json())


app.get("/", (req, res) => {
    res.send("Notification service is up and running")
})



module.exports = app