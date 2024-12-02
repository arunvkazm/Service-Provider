const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const ServiceProviderSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
   // serviceProviderImage: { type: String, required: true },
    regNumber: { type: String, required: true },
    industry: { type: String, required: true },
    industryType: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    resetOtp: { type: String },
    otpExpires: { type: Date },
    location: {
        latitude: { type: String,default:"" },
        longitude: { type: String,default:"" }
    }
}, { timestamps: true });

// Hash password before saving
ServiceProviderSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password
ServiceProviderSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

ServiceProviderSchema.methods.generateOtp = function () {
    const otp = Math.floor(1000 + Math.random() * 9000).toString(); 
    this.resetOtp = otp;
    this.otpExpires = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes
    return otp;
};

ServiceProviderSchema.statics.isEmailTaken = async function (email) {
    return !!(await this.findOne({ email }));
};

ServiceProviderSchema.methods.validateOtp = function (otp) {
    if (this.resetOtp !== otp) return false; // Incorrect OTP
    if (Date.now() > this.otpExpires) return false; // Expired OTP
    return true;
};

// Method: Clear OTP (after verification)
ServiceProviderSchema.methods.clearOtp = function () {
    this.resetOtp = null;
    this.otpExpires = null;
};

module.exports = mongoose.model('ServiceProvider', ServiceProviderSchema);
