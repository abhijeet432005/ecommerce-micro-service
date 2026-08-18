const { body, validationResult } = require("express-validator");

function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation error', errors: errors.array() });
    }
    next();
}

const createProductValidator = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isString()
        .withMessage("Title must be a string"),

    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required")
        .isString()
        .withMessage("Description must be a string"),

    body("priceAmount")
        .notEmpty()
        .withMessage("Price amount is required")
        .isFloat({ gt: 0 })
        .withMessage("Price amount must be a positive number"),

    body("priceCurrency")
        .optional()
        .isString()
        .withMessage("Price currency must be a string")
        .isLength({ min: 3, max: 3 })
        .withMessage("Price currency must be a 3-letter currency code")
        .isUppercase()
        .withMessage("Price currency must be uppercase"),
    
    handleValidationErrors

    
];



module.exports = {
    createProductValidator
};