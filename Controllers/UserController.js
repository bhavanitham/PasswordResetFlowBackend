const userModel = require("../Models/UserModel");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const mailer = require("../Configs/Mailer");
const crypto = require("crypto");
const { text } = require("body-parser");

//Generating StringToken
const generateToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  return token;
};

//User Registration controller
const userRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (user) {
      //if we have user already in DB if works
      return res.status(409).json({
        message: "It Seems you already have account Please try login",
      });
    }
    //Storing user in db
    const newUser = await userModel.create({
      name: name,
      email: email,
      password: password,
    });
    res
      .status(201)
      .json({
        message: "Registration Successfully : Redirecting to login screen",
        newUser,
      });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

//User Login controller
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "User not found Create an Account" });
    } else {
      const isMatched = await bcrypt.compare(password, user.password);
      if (isMatched) {
        res.status(200).json({ message: "Successfully Logged in" });
      } else {
        res.status(401).json({ message: "Password incorrect" });
      }
    }
  } catch (error) {
    console.log(error.message, "error");
    res.status(500).json({ message: "Internal server error" });
  }
};

//forgot password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    res.status(401).json({
      message: "User not found provide correct email address",
      email: email,
    });
    return;
  }
  const token = generateToken();
  //send mail
  await mailer.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "Password Reset Link",
    html: `<h1>${user.name} Please Click on the link to Verify your email</h1>
    <hr>
    <p>Reset Link Expires in 10minutes</p>
    <a href="${process.env.BACKEND_APP_URL}/mailVerfication?token=${token}&email=${user.email}">Verify</a>`, //this link  is routed to mailVerification function
  });
  res.status(200).json({ message: "Password reset link sent to your email" });
  //save token in db
  user.stringToken = token;
  await user.save();
  // Clear token after 10 minutes
  setTimeout(async () => {
    try {
      await user.updateOne({ stringToken: "" });
      console.log("Token cleared after 10 minutes for email:", email);  
    } catch (error) {
      console.error("Error clearing token:", error.message);
    }
  }, 600000); // 10 minutes in milliseconds
};

//Reset Password from email link verification
const mailVerification = async (req, res) => {
  const { token, email } = req.query;

  const user = await userModel.findOne({ email });

  //check if token is valid
  if (user.stringToken !== token) {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
  //send mail to reset password page
  res.send(`
    <html>
      <body>
        <h1>Email is Verified Reset Your Password</h1>
        <a href="${process.env.FRONTEND_APP_URL}/resetpassword/${email}">Click here to reset your password</a>
      </body>
    </html>
  `);
};

const resetPassword = async (req, res) => {
  const { password, email } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    res.status(401).json({ message: "User not found" });
    return;
  }
  if (user.email !== email) {
    res.status(401).json({ message: "Invalid User" });
    return;
  }
  user.password = password;
  await user.save();
  res.status(200).json({
    message: "Password reset successfully Redirecting to login page",
  });
  //clear stringToken
  user.stringToken = "";
  await user.save();
  status = "";
};

module.exports = {
  userRegister,
  userLogin,
  forgotPassword,
  mailVerification,
  resetPassword,
};
