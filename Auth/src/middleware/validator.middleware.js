const { body, validationResult } = require('express-validator')

const responseWithValidationError = (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }

    next()
}

const registerUserValidation = [
    body("userName")
        .trim()
        .notEmpty()
        .withMessage("Username is required")
        .isString()
        .withMessage("Username must be a string")
        .isLength({ min: 3, max: 30 })
        .withMessage("Username must be between 3 and 30 characters")
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage("Username can contain only letters, numbers and underscore"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please enter a valid email address")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8, max: 128 })
        .withMessage("Password must be between 8 and 128 characters")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lowercase letter")
        .matches(/[0-9]/)
        .withMessage("Password must contain at least one number")
        .matches(/[^A-Za-z0-9]/)
        .withMessage("Password must contain at least one special character"),

    body("fullName.firstName")
        .trim()
        .notEmpty()
        .withMessage("First name is required")
        .isString()
        .withMessage("First name must be a string")
        .isLength({ min: 2, max: 30 })
        .withMessage("First name must be between 2 and 30 characters")
        .matches(/^[a-zA-Z]+$/)
        .withMessage("First name can contain only letters"),

    body("fullName.lastName")
        .trim()
        .notEmpty()
        .withMessage("Last name is required")
        .isString()
        .withMessage("Last name must be a string")
        .isLength({ min: 2, max: 30 })
        .withMessage("Last name must be between 2 and 30 characters")
        .matches(/^[a-zA-Z]+$/)
        .withMessage("Last name can contain only letters"),

    body("role")
        .optional()
        .isIn(["user", "seller"])
        .withMessage("Role must be either 'user' or 'seller'"),

    responseWithValidationError
]

const loginUserValidation = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please enter a valid email address")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required"),

    responseWithValidationError
]

const addUserAddressValidation = [
    body("street")
        .trim()
        .notEmpty()
        .withMessage("Street is required")
        .isString()
        .withMessage("Street must be a string"),
        
    body("city")
        .trim()
        .notEmpty()
        .withMessage("City is required")
        .isString()
        .withMessage("City must be a string"),
        
    body("state") 
        .trim()
        .notEmpty()
        .withMessage("State is required")
        .isString()
        .withMessage("State must be a string"),
    
    body("pincode")
        .trim()
        .notEmpty()
        .withMessage("Pincode is required")
        .isPostalCode('any')
        .withMessage("Please enter a valid pincode"),
    
    body("country")
        .trim()
        .notEmpty()
        .withMessage("Country is required")
        .isString()
        .withMessage("Country must be a string"),
    
    body("isDefault")
        .optional()
        .isBoolean()
        .withMessage("isDefault must be a boolean"),

    responseWithValidationError
]

module.exports = {
    registerUserValidation,
    loginUserValidation,
    addUserAddressValidation
}
