const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const authController = require("../controllers/authController");

// Protect all routes (user must be logged in)
router.use(authController.protect);

// Cart Routes
router.post("/add", cartController.addToCart);
router.post("/remove", cartController.removeFromCart);
router.put("/update", cartController.updateCart);
// router.get("/", cartController.getCart);33

module.exports = router;
