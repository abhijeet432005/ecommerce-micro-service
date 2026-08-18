const { uploadImage } = require("../service/imageKit.service")
const productModel = require('../model/product.model')
const { default: mongoose } = require("mongoose")

const createProduct = async (req, res) => {
    try {
        const { title, description, priceAmount, priceCurrency = 'INR' } = req.body
        const amount = Number(priceAmount)

        if (!title?.trim() || !priceAmount || !Number.isFinite(amount)) {
            return res.status(400).json({
                message: 'title and a valid priceAmount are required',
            })
        }

        if (!req.files?.length) {
            return res.status(400).json({
                message: 'At least one image is required',
            })
        }

        const images = await Promise.all(req.files.map((file) => uploadImage(file.buffer)))

        const product = await productModel.create({
            seller: req.user.id,
            title,
            description,
            price: {
                amount,
                currency: priceCurrency,
            },
            images
        })

        return res.status(201).json({
            data: product
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        })
    }
}


const getProducts = async (req, res) => {

    const { q, minprice, maxprice, skip = 0, limit = 20 } = req.query

    const filter = {}

    if (q) {
        filter.$text = { $search: q }
    }

    if (minprice) {
        filter['price.amount'] = { ...filter['price.amount'], $gte: Number(minprice) }
    }

    if (maxprice) {
        filter['price.amount'] = { ...filter['price.amount'], $lte: Number(maxprice) }
    }

    const products = await productModel.find(filter).skip(Number(skip)).limit(Math.min(Number(limit), 20))

    return res.status(200).json({ data: products });
}

const getByID = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            Message: "invalid product id"
        })
    }

    const product = await productModel.findById({ _id: id })

    if (!product) {
        return res.status(404).json({
            Message: "Product not found"
        })
    }

    res.status(200).json({
        Message: "product fetched successfully",
        data: product
    })
}

const updateProduct = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            Message: "invalid product id"
        })
    }

    const product = await productModel.findById({
        _id: id,
    })

    if (!product) {
        return res.status(404).json({
            Message: "Product not found"
        })
    }


    if (product.seller.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden: You can only update your own products' });
    }


    const allowedUpdates = ['title', 'description', 'price'];
    for (const key of Object.keys(req.body)) {
        if (allowedUpdates.includes(key)) {
            if (key === 'price' && typeof req.body.price === 'object') {
                if (req.body.price.amount !== undefined) {
                    product.price.amount = Number(req.body.price.amount);
                }
                if (req.body.price.currency !== undefined) {
                    product.price.currency = req.body.price.currency;
                }
            } else {
                product[key] = req.body[key];
            }

        }
    }
    await product.save();
    return res.status(200).json({ message: 'Product updated', data: product });

}

const deleteProduct = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            Message: "invalid product id"
        })
    }

    const product = await productModel.findById({
        _id: id,
    })

    if (!product) {
        return res.status(404).json({
            Message: "Product not found"
        })
    }

    if (product.seller.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden: You can only update your own products' });
    }

    await productModel.findOneAndDelete({ _id: id })
    return res.status(200).json({ message: 'Product deleted' });

}


const getSellerProduct = async (req, res) => {
    const seller = req.user
    
    const { skip = 0, limit = 20 } = req.query

    const products = await productModel.find({ seller: seller.id }).skip(skip).limit(Math.min(limit, 20))

    return res.status(200).json({
        data: products
    })
}

module.exports = {
    createProduct,
    getProducts,
    getByID,
    updateProduct,
    deleteProduct,
    getSellerProduct
}
