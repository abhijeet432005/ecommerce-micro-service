const cartModel = require('../model/cart.model')

const addItemToCart = async (req, res) => {
    try {
        const { productId, qty } = req.body

        const user = req.user

        let cart = await cartModel.findOne({ user: user.id })

        if (!cart) {
            cart = new cartModel({
                user: user.id,
                items: []
            })
        }

        const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId)

        if (existingItemIndex >= 0) {
            cart.items[existingItemIndex].quantity += qty
        } else {
            cart.items.push({
                productId: productId,
                quantity: qty
            })
        }

        await cart.save()

        res.status(200).json({
            message: "Item added to cart",
            cart,
        })

    } catch (error) {
        console.error('Error adding item to cart:', error)

        res.status(500).json({
            message: "Internal server error",
            error: error.message
        })
    }
}

const updateItemQuantity = async (req, res) => {
    try {
        const user = req.user
        const { productId } = req.params
        const { qty } = req.body

        const cart = await cartModel.findOne({ user: user.id })

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found"
            })
        }

        const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (existingItemIndex === -1) {
            return res.status(404).json({
                message: "Item not found"
            })
        }

        cart.items[existingItemIndex].quantity = qty

        await cart.save()

        res.status(200).json({
            message: "Item updated",
            cart
        })


    } catch (error) {
        console.log("error from PATCH", error)
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        })
    }



}


const getCart = async (req, res) => {
    const user = req.user

    let cart = await cartModel.findOne({ user: user.id })

    if (!cart) {
        cart = new cartModel({ user: user.id, items: [] })
        await cart.save()
    }

    res.status(200).json({
        cart,
        totals: {
            itemCount: cart.items.length,
            totalQuantity: cart.items.reduce((sum, item) => sum + item.quantity, 0)
        }
    })
}

module.exports = {
    addItemToCart,
    updateItemQuantity,
    getCart
}