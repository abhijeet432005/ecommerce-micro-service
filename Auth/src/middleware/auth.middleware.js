const userModel = require('../model/user.model')
const jwt = require('jsonwebtoken')

const authMiddleware = async (req, res, next) => {
    const { token } = req.cookies

    if(!token) {
        return res.status(401).json({
            Message: "Unauthorized"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRETE_KEY)

        const user = decoded

        req.user = user

        next()
    } catch (error) {
        res.status(401).json({
            Message: "Unauthorized",
            error: error.message
        })
    }
}

module.exports = {
    authMiddleware
}