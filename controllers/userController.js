const User = require("../model/user");

exports.getAllUser = async (req, res, next) => {
  try {
    const users = await User.find();
    if (!users || users.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No users found",
      });
    }
    res.status(200).json({
      status: "success",
      data: { users },
    });
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(500).json({
      status: "fail",
      message: "Failed to retrieve users",
    });
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(500).json({
      status: "fail",
      message: "Failed to retrieve user",
    });
    next(error); // Pass error to next middleware
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }
    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(500).json({
      status: "fail",
      message: "Failed to delete user",
    });
    next(error);
  }
};
