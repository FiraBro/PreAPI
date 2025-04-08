const fs = require("fs");
const mongoose = require("mongoose");
const Course = require("./model/course");
const { ObjectId } = mongoose.Types;

console.log("Current Directory:", __dirname);

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/Ecommerce")
  .then(() => console.log("DB connection successful!"))
  .catch((err) => console.error("DB connection error:", err));

const filePath = `${__dirname}/dev-data/data.json`;

// Check if file exists
if (!fs.existsSync(filePath)) {
  console.error("File not found:", filePath);
  process.exit(1);
}

// Read and parse JSON file
let coursesData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

// Convert _id fields to ObjectId
coursesData = coursesData.map((course) => {
  if (course._id) {
    course._id = new ObjectId(course._id);
  }
  return course;
});

console.log("First Course:", coursesData[0]);

const importData = async () => {
  try {
    await Course.insertMany(coursesData); // More efficient than create for multiple documents
    console.log("Data successfully loaded!");
  } catch (err) {
    console.error("Error importing data:", err);
  } finally {
    mongoose.connection.close(); // Close connection
    process.exit();
  }
};

const deleteData = async () => {
  try {
    await Course.deleteMany();
    console.log("Data successfully deleted!");
  } catch (err) {
    console.error("Error deleting data:", err);
  } finally {
    mongoose.connection.close(); // Close connection
    process.exit();
  }
};

// Handle command-line arguments
switch (process.argv[2]) {
  case "--import":
    importData();
    break;
  case "--delete":
    deleteData();
    break;
  default:
    console.log("Usage: node importData.js --import/--delete");
    process.exit();
}
