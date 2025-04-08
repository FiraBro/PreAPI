const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "jemalfiragos@gmail.com",
        pass: "giesvnlouvsnquib", // Use the generated App Password
      },
    });
    const mailOptions = {
      from: "Firagos Jemal <jemalfiragos@gmail.com>",
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email. Please try again later.");
  }
};

module.exports = { sendEmail }; // Export as an object
