const User = require("../model/user");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail } = require("../util/email");
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirm, role } = req.body;

    if (!name || !email || !password || !passwordConfirm || !role) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide all required fields",
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({
        status: "fail",
        message: "Passwords do not match",
      });
    }

    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role,
    });

    if (!user) {
      return res.status(500).json({
        status: "fail",
        message: "Failed to create user",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(404).json({
        status: "fail",
        message: "please provide email and password",
      });
    }
    const user = await User.findOne({ email }).select("+password");

    const corrected = await user.comparePassword(password, user.password);
    if (!user || !corrected) {
      return res.status(404).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).json({
      status: "success",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        cart: user.cart || [],
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "You are not logged in. Please log in to get access.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token no longer exists.",
      });
    }

    req.user = currentUser;

    next();
  } catch (error) {
    res.status(401).json({
      status: "fail",
      message: "Invalid token. Please log in again.",
    });
  }
};
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};
exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  try {
    // 1) Check if the user exists
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with this email address.",
      });
    }

    // 2) Generate and save the password reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Construct the reset URL
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/user/resetPassword/${resetToken}`;

    // 4) Prepare the email message
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    // 5) Send the email
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (error) {
    // 7) Handle errors
    if (user) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
    }

    console.error("Error in forgotPassword:", error); // Log the error

    res.status(500).json({
      status: "fail",
      message: "Something went wrong. Please try again later.",
    });
  }
};
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedpassword = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({
      password: hashedpassword,
      passwordResetExpires: { $gt: Date.now },
    });
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "Invalid token or expired token",
      });
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).json({
      status: "success",
      token,
    });
  } catch (error) {
    console.log({ resetError: error });
    res.status(404).json({
      status: "fail",
      message: "Failed to reset password",
    });
  }
};
