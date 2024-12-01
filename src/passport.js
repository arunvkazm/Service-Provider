const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const Admin = require('../models/Admin');


passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
        },
        async (payload, done) => {
            try {
                const user = await User.findById(payload.id) || await Admin.findById(payload.id);
                if (!user) return done(null, false);
                return done(null, user);
            } catch (error) {
                done(error, false);
            }
        }
    )
);

// Local Strategy for login (Admin)
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
            done(error, false);
        }
    })
);

module.exports = passport;
