const app = require('./src/app')
const connectToDB = require('./src/db/db')

// Connect to database before starting server
connectToDB()

app.listen(3003, () => {
    console.log("Server is running on port 3003")
})