const app = require('./src/app')
const connectToDB = require('./src/db/db')
const { connect } = require('./src/broker/broker')

connect()

// Connect to database before starting server
connectToDB()

app.listen(3003, () => {
    console.log("Server is running on port 3003")
})