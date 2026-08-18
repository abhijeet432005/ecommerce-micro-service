const { default: mongoose } = require('mongoose')
const orderModel = require('../models/orders.models')
const axios = require('axios')

const createOrder = async (req, res) => {
    const user = req.user
    const token = req.cookies.token || req.headers?.authorization?.split(' ')[1]
    console.log({
        street: req.body.shippingAddress.street,
        city: req.body.shippingAddress.city,
        state: req.body.shippingAddress.state,
        pincode: req.body.shippingAddress.pincode,
        country: req.body.shippingAddress.country,
    })

    try {
        const cartResponse = await axios.get('http://localhost:3002/cart', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        const products = await Promise.all(cartResponse.data.cart.items.map(async (item) => {
            return (await axios.get(`http://localhost:3001/products/${item.productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })).data.data
        }))

        let priceAmount = 0

        const orderItems = cartResponse.data.cart.items.map((item, index) => {

            const product = products.find(p => p._id === item.productId)

            if (!product.stock || product.stock < item.quantity) {
                throw new Error(`Product ${product.title} is out of stock or insufficient`);

            }

            const itemTotal = product?.price?.amount * item?.quantity
            priceAmount += itemTotal

            return {
                product: item.productId,
                quantity: item.quantity,
                price: {
                    amount: itemTotal,
                    currency: product.price.currency
                }
            }
        })

        const order = await orderModel.create({
            user: user.id,
            items: orderItems,
            status: 'PENDING',
            totalPrice: {
                amount: priceAmount,
                currency: "INR"
            },
            shippingAddress: {
                street: req.body.shippingAddress.street,
                city: req.body.shippingAddress.city,
                state: req.body.shippingAddress.state,
                zip: req.body.shippingAddress.pincode,
                country: req.body.shippingAddress.country,
            }
        })

        res.status(201).json({
            order
        })

    } catch (error) {
        console.log("Error from createOrder : ", error)
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        })
    }
}

const getMyOrders = async (req, res) => {
    try {
        const user = req.user

        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const skip = (page - 1) * limit

        const orders = await orderModel.find({ user: user.id }).skip(skip).limit(limit).exec()
        const totalOrders = await orderModel.countDocuments({ user: user.id })

        res.status(200).json({
            orders,
            meta: {
                total: totalOrders,
                page,
                limit
            }
        })

    } catch (error) {
        console.log("Error in getOrderByID : ", error)
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        })
    }
}

const getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id
        const user = req.user

        const order = await orderModel.findById(orderId)

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            })
        }

        if (order.user.toString() !== user.id) {
            return res.status(403).json({
                message: "Forbidden: You do not have access"
            })
        }

        res.status(200).json({
            order
        })

    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        })
    }
}

const cancelOrderById = async (req, res) => {
    try {
        const orderId = req.params.id
        const user = req.user

        const order = await orderModel.findById(orderId)

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            })
        }

        if (order.user.toString() !== user.id) {
            return res.status(403).json({
                message: "Forbidden: You do not have access to this order"
            })
        }

        // only PENDING orders can be cancelled
        if (order.status !== "PENDING") {
            return res.status(409).json({
                message: "Order cannot be cancell at this stage"
            })
        }

        order.status = "CANCELLED"
        await order.save()

        res.status(200).json({ order });

    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        })
    }
}


const UpdateOrderAddressById = async (req, res) => {
    try {
        const orderId = req.params.id
        const user = req.user

        const order = await orderModel.findById(orderId)

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            })
        }

        if (order.user.toString() !== user.id) {
            return res.status(403).json({
                message: "Forbidden: you do not have access"
            })
        }

        // only PENDING orders can have address updated
        if (order.status !== "PENDING") {
            return res.status(409).json({ message: "Order address cannot be updated at this stage" });
        }

        order.shippingAddress = {
            street: req.body.shippingAddress.street,
            city: req.body.shippingAddress.city,
            state: req.body.shippingAddress.state,
            zip: req.body.shippingAddress.zip,
            country: req.body.shippingAddress.country,
        }

        await order.save()

        res.status(200).json({
            order
        })

    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        })
    }
}



module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrderById,
    UpdateOrderAddressById
}