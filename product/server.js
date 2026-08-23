const app = require('./src/app')
const { connect } = require('./src/broker/broker')

connect()

app.listen(3001, () => {
    console.log("Product server is listening on port 3001")
})