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

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            quantity: {
                type: Number,
                default: 1,
                min: 1
            },
            price: {
                currency: {
                    type: String,
                    enum: ["USD", "INR"],
                    default: "INR",
                    required: true
                },
                amount: {
                    type: Number,
                    required: true
                }
            }
        }
    ],
    status: {
        type: String,
        enum: ["PENDING", 'CONFIRMED', 'CANCELLED', 'SHIPPED'],
    },
    totalPrice: {
        currency: {
            type: String,
            enum: ["USD", "INR"],
            default: "INR",
            required: true
        },
        amount: {
            type: Number,
            required: true
        }
    },
    shippingAddress: {
        type: addressSchema,
        required: true
    }
}, {
    timestamps: true
})

const orderModel = mongoose.model("order", orderSchema)

module.exports = orderModel