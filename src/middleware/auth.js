const passport = require('passport');

// JWT Middleware
exports.authenticateJWT = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: 'Authentication error', error: err.message });
        }
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized access', info: info?.message || 'Invalid token' });
        }
        req.user = user; // Attach authenticated user to the request
        next();
    })(req, res, next);
};

// Role-Based Access Middleware
exports.authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };
};
