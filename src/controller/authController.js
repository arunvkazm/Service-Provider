const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../model/userModel");
const ServiceProvider = require("../model/serviceProviderModel");
const Admin = require("../model/adminModel");
const nodemailer = require("nodemailer");
const { sendResponse } = require("../utils/responseHelper");
const loggers = require("../config/logger");

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    html,
  });
};

// Generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// User Registration
// Registration API
exports.register = async (req, res) => {
  const { role, fullName, email, password, regNumber, industry, industryType } =
    req.body;

  // Validate Role
  if (!["client", "service_provider"].includes(role)) {
    return sendResponse(
      res,
      400,
      false,
      'Invalid role. Accepted roles are "client" or "service_provider".'
    );
  }

  try {
    // Check if the email is already registered under any role
    const existingClient = await User.findOne({ email });
    const existingProvider = await ServiceProvider.findOne({ email });

    if (existingClient || existingProvider) {
      const registeredRole = existingClient ? "client" : "service_provider";
      return sendResponse(
        res,
        400,
        false,
        `This email is already registered as a ${registeredRole}.`
      );
    }

    let user;

    if (role === "client") {
      user = new User({ fullName, email, password });
    } else if (role === "service_provider") {
      if (!industry || !industryType) {
        return sendResponse(
          res,
          400,
          false,
          "Missing required fields for service_provider registration."
        );
      }
      user = new ServiceProvider({
        fullName,
        email,
        password,
        regNumber,
        industry,
        industryType,
      });
    }

    await user.save();

    // Generate verification token
    const token = generateToken(user);
    const verificationLink = `${process.env.APP_URL}/api/auth/verify-email?token=${token}`;

    // Send verification email
    await sendEmail(
      user.email,
      "Email Verification",
      `<a href="${verificationLink}">Click here to verify your email</a>`
    );

    sendResponse(
      res,
      201,
      true,
      "User registered successfully. Please check your email to verify your account."
    );
  } catch (error) {
    sendResponse(res, 500, false, "An error occurred during registration.");
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const { email } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 404, false, "Invalid verification link.");
    }

    user.isVerified = true;
    await user.save();

    res.redirect(`${process.env.APP_URL}/api/auth/login`);
  } catch (error) {
    sendResponse(res, 400, false, "Verification link expired or invalid.");
  }
};

// User Login
exports.login = async (req, res) => {
  const { email, password,role } = req.body;

// Validate Role
if (!["client", "service_provider"].includes(role)) {
    return sendResponse(
      res,
      400,
      false,
      'Invalid role. Accepted roles are "client" or "service_provider".'
    );
  }

  try {

    
    // const user = await User.findOne({ email });
    // if (!user || !(await user.comparePassword(password))) {
    //   return sendResponse(res, 401, false, "Invalid credentials");
    // }

    let user;

    if (role === "client") {
      user = await User.findOne({ email });
    } else if (role === "service_provider") {
      user = await ServiceProvider.findOne({ email });
    }

    if (!user || !(await user.comparePassword(password))) {
      return sendResponse(res, 401, false, "Invalid credentials");
    }



    const token = generateToken(user);

    if (role === "client") {
        return sendResponse(res, 200, true, "User login successful", {
          token,
          userId: user._id,
          role: user.role,
          fullName: user.fullName,
          email: user.email,
        });
      } else if (role === "service_provider") {
        return sendResponse(res, 200, true, "Service provider login successful", {
          token,
          userId: user._id,
          role: user.role,
          fullName: user.fullName,
          email: user.email,
          industry: user.industry,
          industryType: user.industryType,
          regNumber:user.regNumber,
        });
      }
  } catch (error) {
    sendResponse(res, 500, false, "An error occurred during login.");
  }
};

// Admin Login
exports.adminLogin = (req, res, next) => {
  passport.authenticate("admin-local", (err, admin, info) => {
    if (err || !admin) {
      return sendResponse(
        res,
        401,
        false,
        info?.message || "Authentication failed"
      );
    }

    const token = generateToken(admin);
    sendResponse(res, 200, true, "Admin login successful", { token });
  })(req, res, next);
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email,role } = req.body;

  if (!["client", "service_provider"].includes(role)) {
    return sendResponse(
      res,
      400,
      false,
      'Invalid role. Accepted roles are "client" or "service_provider".'
    );
  }

  let user;

  if (role === "client") {
    user = await User.findOne({ email });
  } else if (role === "service_provider") {
    user = await ServiceProvider.findOne({ email });
  }

  //const user = await User.findOne({ email });
  if (!user) {
    return sendResponse(
      res,
      404,
      false,
      "User with this email does not exist."
    );
  }

  try {
    const otp = user.generateOtp(); // Assuming `generateOtp` is a static method on User model
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await sendEmail(
      user.email,
      "Password Reset OTP",
      `<p>Your OTP is: <b>${otp}</b></p>`
    );
    sendResponse(res, 200, true, "OTP sent to your email.");
  } catch (error) {
    sendResponse(res, 500, false, "An error occurred while sending OTP.");
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp,role } = req.body;

  if (!["client", "service_provider"].includes(role)) {
    return sendResponse(
      res,
      400,
      false,
      'Invalid role. Accepted roles are "client" or "service_provider".'
    );
  }

  let user;

  if (role === "client") {
    user = await User.findOne({ email });
  } else if (role === "service_provider") {
    user = await ServiceProvider.findOne({ email });
  }

  if (!user) {
    return sendResponse(res, 404, false, "User not found.");
  }

  if (user.resetOtp !== otp || Date.now() > user.otpExpires) {
    return sendResponse(res, 400, false, "Invalid or expired OTP.");
  }

  user.resetOtp = null;
  user.otpExpires = null;
  await user.save();

  sendResponse(
    res,
    200,
    true,
    "OTP verified. You can now reset your password."
  );
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { email, newPassword, role } = req.body;

  if (!["client", "service_provider"].includes(role)) {
    return sendResponse(
      res,
      400,
      false,
      'Invalid role. Accepted roles are "client" or "service_provider".'
    );
  }

  let user;

  if (role === "client") {
    user = await User.findOne({ email });
  } else if (role === "service_provider") {
    user = await ServiceProvider.findOne({ email });
  }
  if (!user) {
    return sendResponse(res, 404, false, "User not found.");
  }

  try {
    user.password = newPassword;
    user.resetOtp = null;
    user.otpExpires = null;
    await user.save();
    sendResponse(res, 200, true, "Password reset successfully.");
  } catch (error) {
    sendResponse(
      res,
      500,
      false,
      "An error occurred while resetting the password."
    );
  }
};