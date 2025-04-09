const User = require("../models/users");

// Add Product to Cart
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id; // Get user ID from the authenticated request

    if (!productId || !quantity) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide productId and quantity",
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Initialize cartData if it doesn't exist
    if (!user.cartData) {
      user.cartData = {};
    }

    // Add or update the product in the cart
    if (user.cartData[productId]) {
      user.cartData[productId] += quantity; // Increase quantity if product already exists
    } else {
      user.cartData[productId] = quantity; // Add new product to cart
    }

    // Save the updated cart without validating
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: "success",
      message: "Product added to cart",
      cart: user.cartData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "fail",
      message: "Failed to add product to cart",
    });
  }
};

// Remove Product from Cart

exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId, quantityToRemove = 1 } = req.body;
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide productId",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    if (!user.cartData || !user.cartData[productId]) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found in cart",
      });
    }

    user.cartData[productId] -= quantityToRemove;

    if (user.cartData[productId] <= 0) {
      delete user.cartData[productId];
    }

    // Mark cartData as modified to ensure changes are saved
    user.markModified("cartData");

    try {
      await user.save({ validateBeforeSave: false });
    } catch (error) {
      console.error("Error saving user:", error);
      return res.status(500).json({
        status: "fail",
        message: "Failed to update cart",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Product quantity updated in cart",
      cart: user.cartData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "fail",
      message: "Failed to update product quantity in cart",
    });
  }
};

// Update Cart (Change Product Quantity)
exports.updateCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id; // Get user ID from the authenticated request

    if (!productId || !quantity) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide productId and quantity",
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Check if the product exists in the cart
    if (!user.cartData || !user.cartData[productId]) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found in cart",
      });
    }

    // Update the product quantity
    user.cartData[productId] = quantity;

    // Save the updated cart without validating
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: "success",
      message: "Cart updated",
      cart: user.cartData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "fail",
      message: "Failed to update cart",
    });
  }
};
