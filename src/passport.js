const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../src/model/userModel');
const Admin = require('../src/model/adminModel');

// JWT Strategy configuration
passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
        },
        async (payload, done) => {
            try {
                // Check if the payload ID belongs to a User or Admin
                const user = await User.findById(payload.id);
                
                if (user) {
                    return done(null, user);
                }

                const admin = await Admin.findById(payload.id);
                if (admin) {
                    return done(null, admin);
                }

                return done(null, false, { message: 'User not found' });
            } catch (error) {
                console.error('Error during JWT authentication:', error);
                return done(error, false);
            }
        }
    )
);

// Local Strategy for Admin login
passport.use(
    'admin-local',
    new LocalStrategy(async (username, password, done) => {
        try {
            const admin = await Admin.findOne({ username });
            if (!admin || !(await admin.comparePassword(password))) {
                return done(null, false, { message: 'Invalid credentials' });
            }
            return done(null, admin);
        } catch (error) {
           console.error('Error during local strategy authentication:', error);
            done(error, false);
        }
    })
);

module.exports = passport;
