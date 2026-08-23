require('dotenv').config()
const app = require('./src/app')

const connectToDB = require('./src/db/db')
const listner = require('./src/broker/listneres')
const { connect } = require('./src/broker/broker')

connectToDB()
connect().then(() => {
    listner()
})

app.listen(3007, () => {
    console.log("Seller server is running on 3007")
})