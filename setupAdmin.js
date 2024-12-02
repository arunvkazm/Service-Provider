require("dotenv").config(); // Load environment variables from .env
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const AdminModel = require('./src/model/adminModel');



const setupAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
    
    });
    console.log("Connected to MongoDB");

    // Check if the admin already exists
    const existingAdmin = await AdminModel.findOne({ email: "admin@tradehunter.com" });
    if (existingAdmin) {
      console.log("Admin already exists. Skipping creation.");
    } else {
      // Hash the password
      const hashedPassword = await bcrypt.hash("admin@321", 10);

      // Create the admin user
      const admin = new AdminModel({
        name: "Super Admin",
        email: "admin@tradehunter.com",
        password: hashedPassword,
      });

      await admin.save();
      console.log("Admin created successfully.");
    }

    // Disconnect from the database
    mongoose.connection.close();
  } catch (err) {
    console.error("Error setting up admin:", err);
    mongoose.connection.close();
  }
};

setupAdmin();
