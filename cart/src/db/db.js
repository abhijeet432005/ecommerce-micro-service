const mongoose = require('mongoose')

async function connectToDB() {
    // Skip connection in test environment
    if (process.env.NODE_ENV === 'test') {
        return;
    }
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to DB")
    } catch (error) {
        console.log(error)
    }
}


module.exports = connectToDB