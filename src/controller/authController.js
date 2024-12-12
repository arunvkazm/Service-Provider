const jwt = require("jsonwebtoken");
const passport = require("passport");
const userModel = require("../model/userModel");
const serviceProviderModel = require("../model/serviceProviderModel");
const nodemailer = require("nodemailer");
const { sendResponse } = require("../utils/responseHelper");
const loggers = require("../config/logger");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

// Registration API
exports.register = async (req, res) => {
  const {
    role,
    fullName,
    businessName,
    contactName,
    email,
    phoneNumber,
    address,
    abnNo,
    businessType,
    serviceType,
    password,
    isTermAccepted
  } = req.body;

  // Validate Role
  if (!["user", "service_provider"].includes(role)) {
    return sendResponse(
      res,
      400,
      false,
      'Invalid role. Accepted roles are "user" or "service_provider".'
    );
  }

  try {
    // Check if the email is already registered under any role
    const existingUser = await userModel.findOne({ email });
    const existingProvider = await serviceProviderModel.findOne({ email });

    if (existingUser || existingProvider) {
      const registeredRole = existingUser ? "user" : "service_provider";
      return sendResponse(
        res,
        400,
        false,
        `This email is already registered as a ${registeredRole}.`
      );
    }

    let user;

    if (role === "user") {
      user = new userModel({ fullName, email, phoneNumber, address, password,isTermAccepted });
    } else if (role === "service_provider") {
      if (!businessType || !serviceType) {
        return sendResponse(
          res,
          400,
          false,
          "Missing required fields for service_provider registration."
        );
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "Image file is required" });
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "service_providers/profile",
      });

      user = new serviceProviderModel({
        businessName,
        contactName,
        address,
        email,
        phoneNumber,
        abnNo,
        password,
        businessType,
        serviceType,
        isTermAccepted,
        image: result.secure_url,
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
    console.error("EERROR: " + error);
    sendResponse(res, 500, false, "An error occurred during registration.");
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const { email } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findOne({ email });
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
  const { email, password, role } = req.body;

  // Validate Role
  if (!["user", "service_provider"].includes(role)) {
    return sendResponse(
      res,
      400,
      false,
      'Invalid role. Accepted roles are "user" or "service_provider".'
    );
  }

  try {
    let user;

    if (role === "user") {
      user = await userModel.findOne({ email });
    } else if (role === "service_provider") {
      user = await serviceProviderModel.findOne({ email });
    }

    if (!user || !(await user.comparePassword(password))) {
      return sendResponse(res, 401, false, "Invalid credentials");
    }

    const token = generateToken(user);

    if (role === "user") {
      return sendResponse(res, 200, true, "User login successful", {
        token,
        userId: user._id,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        address:user.address,
        phoneNumber: user.phoneNumber,
        isTermAccepted: user.isTermAccepted,
        verified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } else if (role === "service_provider") {
      return sendResponse(res, 200, true, "Service provider login successful", {
        token,
        userId: user._id,
        role: user.role,
        businessName: user.businessName,
        contactName: user.contactName,
        address: user.address,
        email: user.email,
        phoneNumber: user.phoneNumber,
        abnNo: user.abnNo,
        businessType: user.businessType,
        serviceType: user.serviceType,
        isTermAccepted: user.isTermAccepted,
        isVerified: user.isVerified,
        image: user.image,
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
  const { email, role } = req.body;

  if (!["user", "service_provider"].includes(role)) {
    return sendResponse(
      res,
      400,
      false,
      'Invalid role. Accepted roles are "user" or "service_provider".'
    );
  }

  let user;

  if (role === "user") {
    user = await userModel.findOne({ email });
  } else if (role === "service_provider") {
    user = await serviceProviderModel.findOne({ email });
  }

  //const user = await userModel.findOne({ email });
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
  const { email, otp, role } = req.body;

  if (!["user", "service_provider"].includes(role)) {
    return sendResponse(
      res,
      400,
      false,
      'Invalid role. Accepted roles are "user" or "service_provider".'
    );
  }

  let user;

  if (role === "user") {
    user = await userModel.findOne({ email });
  } else if (role === "service_provider") {
    user = await serviceProviderModel.findOne({ email });
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

  if (!["user", "service_provider"].includes(role)) {
    return sendResponse(
      res,
      400,
      false,
      'Invalid role. Accepted roles are "user" or "service_provider".'
    );
  }

  let user;

  if (role === "user") {
    user = await userModel.findOne({ email });
  } else if (role === "service_provider") {
    user = await serviceProviderModel.findOne({ email });
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
