const app = require("./app");
const mongoose = require("mongoose");
// const data = require("../Backend/dev-data/data");
const port = 5000;

mongoose
  .connect("mongodb://localhost:27017/Ecommerce")
  .then((con) => {
    console.log("DB connected successfully");
    app.listen(port, () => {
      console.log(`Server is started on port ${port}`);
      // If you want to log the names
      //   data.forEach((el) => console.log(el.name));
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process if there's an error
  });
