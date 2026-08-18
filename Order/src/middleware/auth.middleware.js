const jwt = require('jsonwebtoken')

const createAuthMiddleware = (role = ["user"]) => {
    return function authMiddleware(req, res, next) {
        try {

            const token = req.cookies.token || req.headers?.authorization?.split(' ')[1]

            if (!token) {
                return res.status(401).json({
                    message: "Unauthorized: token is missing"
                })
            }

            const decode = jwt.verify(token, process.env.SECRETE_KEY)

            if (!role.includes(decode.role)) {
                return res.status(403).json({
                    message: "Forbidden: Insufficient access"
                })
            }

            req.user = decode
            next()

        } catch (error) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }
    }
}

module.exports = createAuthMiddleware