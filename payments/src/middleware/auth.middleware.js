const jwt = require('jsonwebtoken')


const createAuthMiddleware = (roles = ['user']) => {
    return function authMiddleware(req, res, next) {
        try {
            const token = req.cookies?.token || req.headers?.authorization?.split(' ')[ 1 ]

            if(!token) {
                return res.status(401).json({
                    message: "Unauthorized, Please login or registrer"
                })
            }

            const decoded = jwt.verify(token, process.env.SECRETE_KEY)

            if(!roles.includes(decoded.role)) {
                return res.status(403).json({
                    message: "Forbidden: You don't have access"
                })
            }

            req.user = decoded
            next()
            
        } catch (error) {
            res.status(401).json({
                message: "Unauthorized: Invalid token"
            })
        }
    }
}

module.exports = createAuthMiddleware