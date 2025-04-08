const express = require("express");
const userRouter = express.Router();
const userController = require("../controller/userController");
const authController = require("../controller/authController");
userRouter.post("/register", authController.register);
userRouter.post("/login", authController.login);
userRouter.post("/forgotpassword", authController.forgotPassword);
userRouter.post("/resetPassword:/token", authController.resetPassword);

userRouter
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    userController.getAllUser
  );
userRouter
  .route("/:id")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    userController.getUser
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    userController.deleteUser
  );
module.exports = userRouter;
