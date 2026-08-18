const jwt = require('jsonwebtoken')

function createAuthMeiddleware(roles = [ "user" ]){

    return function authMiddleware(req, res, next){
        const token = req.cookies?.token || req.headers?.authorization?.split(' ')[ 1 ];

        if(!token) {
            return res.status(401).json({
                Message: 'Unauthrozied, Please login or registrer'
            })
        }

        try {
            const decode = jwt.verify(token, process.env.SECRETE_KEY)

            if(!roles.includes(decode.role)) {
                return res.status(403).json({
                    message: 'Forbidden: Insufficient permissions',
                });
            }
            
            req.user = decode
            next()
        } catch (error) {
            res.status(401).json({
                Message: "Unauthorized: Invalid token"
            })
        }
    }
}


module.exports = {
    createAuthMeiddleware
}