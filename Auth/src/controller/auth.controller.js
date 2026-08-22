const userModel = require('../model/user.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const redis = require('../db/redis')
const { publ1ishToQueue } = require('../broker/broker')

const registerUser = async (req, res) => {
    try {
        const { userName, email, password, fullName: { firstName, lastName }, role } = req.body

        const isUser = await userModel.findOne({ email })

        if (isUser) {
            return res.status(409).json({
                Message: "User already exist"
            })
        }

        const hashPassword = await bcrypt.hash(password, 10)

        const user = await userModel.create({
            userName,
            email,
            fullName: {
                firstName,
                lastName
            },
            password: hashPassword,
            role: role || "user"
        })
         
        await publ1ishToQueue('AUTH_NOTIFICATION.USER_CREATED', {
            id: user._id,
            username: user.userName,
            email: user.email,
            fullName: user.fullName,
            created: user.createdAt
        })

        const token = jwt.sign({
            id: user._id,
            userName: user.userName,
            email: user.email,
            role: user.role
        }, process.env.SECRETE_KEY, {
            expiresIn: '1d'
        })

        res.cookie("token", token, {
            httpOnly: true,
            secure: true, // only server can access
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        })

        const userResponse = user.toObject()
        delete userResponse.password

        res.status(201).json({
            Message: "user registered successfully",
            user: userResponse
        })

    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        })
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await userModel.findOne({ email })

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                message: "Invalid credentials"
            })
        }

        const token = jwt.sign({
            id: user._id,
            userName: user.userName,
            email: user.email,
            role: user.role
        }, process.env.SECRETE_KEY, {
            expiresIn: '1d'
        })

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000
        })

        const userResponse = user.toObject()
        delete userResponse.password

        return res.status(200).json({
            Message: "user logged in successfully",
            user: userResponse
        })
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        })
    }
}

const logoutUser = async (req, res) => {
    const { token } = req.cookies

    if (token) {
        await redis.set(`blacklist:${token}`, 'true', 'EX', 24 * 60 * 60)
    }

    res.clearCookie('token', {
        httpOnly: true,
        secure: true
    })

    res.status(200).json({
        Message: "Logout Successfully"
    })
}

const getUserData = (req, res) => {

    res.status(200).json({
        Message: "User data fetched successfully",
        user: req.user
    })
}

const userAddress = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id).select('addresses')

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        return res.status(200).json({
            message: "Addresses fetched successfully",
            addresses: user.addresses
        })
    } catch (error) {
        return res.status(500).json({
            message: "Unable to fetch addresses"
        })
    }
}

const addUserAddress = async (req, res) => {
    const id = req.user.id
    const { street, city, state, pincode, country, isDefault } = req.body

    const user = await userModel.findOneAndUpdate({ _id: id }, {
        $push: {
            addresses: {
                street,
                city,
                state,
                pincode,
                country,
                isDefault
            }
        }
    }, { new: true })

    if (!user) {
        return res.status(404).json({
            Message: "User not found"
        })
    }

    res.status(201).json({
        Message: "Address added successfully",
        address: user.addresses[user.addresses.length - 1]
    })
}

const deleteUserAddress = async (req, res) => {
    const id = req.user.id
    const { addressId } = req.params

    const isAddressExists = await userModel.findOne({ _id: id, 'addresses._id': addressId })

    if (!isAddressExists) {
        return res.status(404).json({
            message: "Address not found"
        })
    }

    const user = await userModel.findOneAndUpdate({ _id: id }, {
        $pull: {
            addresses: { _id: addressId }
        }
    }, { new: true })

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        })
    }

    const addressExists = user.addresses.some(addr => addr._id.toString() === addressId);
    if (addressExists) {
        return res.status(500).json({ message: "Failed to delete address" });
    }

    return res.status(200).json({
        message: "Address deleted successfully",
        addresses: user.addresses
    })
}


module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getUserData,
    userAddress,
    addUserAddress,
    deleteUserAddress
}
