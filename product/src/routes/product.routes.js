const express = require('express')
const routes = express.Router()
const multer = require('multer')
const productController = require('../controller/product.controller')
const productValidator = require('../validators/product.validators')
const authMidlleware = require('../middleware/auth.middleware')

const upload = multer({ storage: multer.memoryStorage() })


// create product 
routes.post(
  "/",
  authMidlleware.createAuthMeiddleware(["admin", "seller"]),
  upload.array("image", 5),
  productValidator.createProductValidator,
  productController.createProduct,
);

// get product

routes.get("/", productController.getProducts)



// PATCH product

routes.patch(
  "/:id",
  authMidlleware.createAuthMeiddleware(["seller"]),
  productController.updateProduct,
);


// DELETE product

routes.delete("/:id", authMidlleware.createAuthMeiddleware(["seller"]), productController.deleteProduct)

// get sellers product list

routes.get('/seller', authMidlleware.createAuthMeiddleware(["seller"]), productController.getSellerProduct)

// get product by id
routes.get('/:id', productController.getByID)

module.exports = routes