const mongoose = require('mongoose')

// sub schema

const addressSchema = new mongoose.Schema({
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    isDefault: { type: Boolean, default: false }
})

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        alias: 'username'
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    fullName: {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        }
    },
    role: {
        type: String,
        enum: ["user", "seller"],
        default: "user"
    },
    addresses: [
        addressSchema
    ]
}, {
    timestamps: true
})

const userModel = mongoose.model("user", userSchema)

module.exports = userModel
