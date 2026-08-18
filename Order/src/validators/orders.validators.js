const { body, validationResult } = require("express-validator");

const responseWithValidationError = (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }

    next()
}


const addUserAddressValidation = [
    body("shippingAddress.street")
        .trim()
        .notEmpty()
        .withMessage("Street is required")
        .isString()
        .withMessage("Street must be a string"),

    body("shippingAddress.city")
        .trim()
        .notEmpty()
        .withMessage("City is required")
        .isString()
        .withMessage("City must be a string"),

    body("shippingAddress.state")
        .trim()
        .notEmpty()
        .withMessage("State is required")
        .isString()
        .withMessage("State must be a string"),

    body("shippingAddress.pincode")
        .trim()
        .notEmpty()
        .withMessage("Pincode is required")
        .isPostalCode('any')
        .withMessage("Please enter a valid pincode"),

    body("shippingAddress.country")
        .trim()
        .notEmpty()
        .withMessage("Country is required")
        .isString()
        .withMessage("Country must be a string"),

    responseWithValidationError
]


const updateAddressValidation = [
    body("shippingAddress.street")
        .trim()
        .notEmpty()
        .withMessage("Street is required")
        .isString()
        .withMessage("Street must be a string"),

    body("shippingAddress.city")
        .trim()
        .notEmpty()
        .withMessage("City is required")
        .isString()
        .withMessage("City must be a string"),

    body("shippingAddress.state")
        .trim()
        .notEmpty()
        .withMessage("State is required")
        .isString()
        .withMessage("State must be a string"),

    body("shippingAddress.zip")
        .trim()
        .notEmpty()
        .withMessage("Zip is required")
        .isPostalCode('any')
        .withMessage("Please enter a valid zip"),

    body("shippingAddress.country")
        .trim()
        .notEmpty()
        .withMessage("Country is required")
        .isString()
        .withMessage("Country must be a string"),

    responseWithValidationError
]

module.exports = {
    addUserAddressValidation,
    updateAddressValidation
}