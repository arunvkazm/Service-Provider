const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phoneNumber: { type: String, required: true },
        address: { type: String, required: false },
        password: { type: String, required: true },
        role: { type: String, default: "user" },
        isTermAccepted:{type: Boolean, default:false},
        isVerified: { type: Boolean, default: false },
        resetOtp: { type: String },
        verifyOtp:{ type: String},
        otpExpires: { type: Date },
        location: {
            latitude: { type: String,default:"" },
            longitude: { type: String,default:"" }
        }
    },
    { timestamps: true } 
);


// Middleware: Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.statics.isEmailTaken = async function (email) {
    return !!(await this.findOne({ email }));
};
// Method: Compare password
userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method: Generate OTP
userSchema.methods.generateOtp = function () {
    const otp = Math.floor(1000 + Math.random() * 9000).toString(); 
    this.resetOtp = otp;
    this.otpExpires = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes
    return otp;
};

// Method: Validate OTP
userSchema.methods.validateOtp = function (otp) {
    if (this.resetOtp !== otp) return false; // Incorrect OTP
    if (Date.now() > this.otpExpires) return false; // Expired OTP
    return true;
};

// Method: Clear OTP (after verification)
userSchema.methods.clearOtp = function () {
    this.resetOtp = null;
    this.otpExpires = null;
};

module.exports = mongoose.model('User', userSchema);
