const Course = require("../models/courses");

exports.getAllCourse = async (req, res, next) => {
  try {
    const queryString = req.query;
    const queryObj = { ...queryString };

    // Exclude fields not meant for filtering
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);

    // Handle advanced filtering (gte, gt, lte, lt)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    let query = JSON.parse(queryStr);

    // Filter by title (if provided)
    if (queryObj.title) {
      query.title = { $regex: queryObj.title, $options: "i" }; // Case-insensitive search
    }

    // Find products based on the final query
    const course = await Course.find(query);

    res.status(200).json({
      status: "success",
      length: course.length,
      data: course,
    });
  } catch (err) {
    next(err); // Pass error to the error handling middleware
  }
};

exports.getCourse = async (req, res, next) => {
  try {
    // if(req.params.title)
    if (!req.params.id) {
      return res.status(400).json({
        status: "fail",
        message: "No ID found",
      });
    }
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        status: "fail",
        message: "course not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: course,
    });
  } catch (error) {
    next(error); // Pass error to the error handling middleware
  }
};

exports.updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!course) {
      return res.status(404).json({
        status: "fail",
        message: "course not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: course,
      message: "course successfully updated",
    });
  } catch (error) {
    next(error); // Pass error to the error handling middleware
  }
};
exports.deleteCourse = async (req, res, next) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: "success",
      message: "You deleted course successfully",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

// Get number of students registered for a course
exports.getCourseStudentCount = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: "fail",
        message: "Course ID is required",
      });
    }

    // Find the course and populate the students field
    const course = await Course.findById(id).populate("students", "name email");

    if (!course) {
      return res.status(404).json({
        status: "fail",
        message: "Course not found",
      });
    }

    // Count the number of students
    const studentCount = course.students.length;

    res.status(200).json({
      status: "success",
      data: {
        courseTitle: course.title,
        studentCount: studentCount,
        students: course.students, // Optional: include student details
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.addCourse = async (req, res) => {
  // Check if image file is uploaded
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No thumbnail image file uploaded.",
    });
  }

  // Destructure required fields from request body
  const { title, instructor, description, price, category, content, rating } =
    req.body;

  // Validate required fields
  if (!title || !instructor || !description || !price || !category) {
    return res.status(400).json({
      success: false,
      message:
        "Title, instructor, description, price, and category are required.",
    });
  }

  try {
    // Parse content if it comes as a string (from form-data)
    let parsedContent = content;
    if (typeof content === "string") {
      parsedContent = JSON.parse(content);
    }

    // Validate content array structure if provided
    if (parsedContent && Array.isArray(parsedContent)) {
      for (const module of parsedContent) {
        if (!module.moduleTitle || !module.videoUrl || !module.duration) {
          return res.status(400).json({
            success: false,
            message:
              "Each content module must have moduleTitle, videoUrl, and duration.",
          });
        }
      }
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    // Create new course object
    const course = new Course({
      title,
      instructor,
      description,
      price,
      category,
      content: parsedContent || [], // Default to empty array if not provided
      image: req.file.filename, // Store filename from uploaded file
      rating: rating || undefined, // Only set if provided
    });

    // Save to database
    await course.save();

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: {
        courseId: course._id,
        title: course.title,
        image: course.image,
      },
    });
  } catch (err) {
    console.error("Error saving course:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: err.message,
    });
  }
};
