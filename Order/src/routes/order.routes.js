const express = require("express");
const createAuthMiddleware = require("../middleware/auth.middleware");
const orderController = require("../controllers/order.controller");
const validation = require("../validators/orders.validators");
const routes = express.Router();

routes.post(
  "/",
  createAuthMiddleware(["user"]),
  validation.addUserAddressValidation,
  orderController.createOrder,
);

routes.get("/me", createAuthMiddleware(["user"]), orderController.getMyOrders);

routes.post(
  "/:id/cancel",
  createAuthMiddleware(["user"]),
  orderController.cancelOrderById,
);

routes.patch(
  "/:id/address",
  createAuthMiddleware(["user"]),
  validation.updateAddressValidation,
  orderController.UpdateOrderAddressById,
);

routes.get(
  "/:id",
  createAuthMiddleware(["user", "admin"]),
  orderController.getOrderById,
);

module.exports = routes;
