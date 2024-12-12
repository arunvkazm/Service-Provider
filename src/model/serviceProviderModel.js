const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const ServiceProviderSchema = new mongoose.Schema({
    businessName: { type: String, required: true },
    contactName: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    abnNo: { type: String, required: true },
    businessType: { type: String, required: true },
    serviceType: { type: String, required: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    role: { type: String, default: "service_provider" },
    isVerified: { type: Boolean, default: false },
    resetOtp: { type: String },
    otpExpires: { type: Date },
    isTermAccepted: { type: Boolean, default: false  },
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
