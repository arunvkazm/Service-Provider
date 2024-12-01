const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, default:"client"},
        // Email verification
        verified: { type: Boolean, default: false },
        // OTP for password reset
        resetOtp: { type: String }, // OTP will be stored as a string
        otpExpires: { type: Date }, // Expiration timestamp for the OTP
    },
    { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Middleware: Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

UserSchema.statics.isEmailTaken = async function (email) {
    return !!(await this.findOne({ email }));
};
// Method: Compare password
UserSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method: Generate OTP
UserSchema.methods.generateOtp = function () {
    const otp = Math.floor(1000 + Math.random() * 9000).toString(); 
    this.resetOtp = otp;
    this.otpExpires = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes
    return otp;
};

// Method: Validate OTP
UserSchema.methods.validateOtp = function (otp) {
    if (this.resetOtp !== otp) return false; // Incorrect OTP
    if (Date.now() > this.otpExpires) return false; // Expired OTP
    return true;
};

// Method: Clear OTP (after verification)
UserSchema.methods.clearOtp = function () {
    this.resetOtp = null;
    this.otpExpires = null;
};

module.exports = mongoose.model('User', UserSchema);
