const express = require("express");
const cors = require("cors");
const app = express();
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path"); // Add path module
app.use(cors());
// Load environment variables
dotenv.config({ path: "config.env" });

// Middleware
app.use(express.json());
app.use(morgan("dev"));

// Serve static files (for uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const courseRoute = require("./routes/courseRouter");
const userRouter = require("./routes/userRouter");
// const cartRouter = require("./routes/cartRoutes");

app.use("/api/v1/courses", courseRoute);
app.use("/api/v1/users", userRouter);
// app.use("/api/v1/cart", cartRouter);

// Create uploads directory if it doesn't exist
const fs = require("fs");
const uploadDir = path.join(__dirname, "uploads/courses");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

module.exports = app;
