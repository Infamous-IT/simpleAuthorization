const jwt = require('jsonwebtoken');
const { secret } = require('../config.js');

module.exports = function(roles) {
    return function(request, response, next) {
        if (request.method === "OPTIONS") {
            next();
        }

        try {
            const token = request.headers.authorization.split(' ')[1];
            if (!token) {
                return response.status(403).json({ message: `User is unregistered` });
            }

            const { roles: userRoles } = jwt.verify(token, secret);
            let hasRole = false;
            userRoles.forEach(role => {
                if (roles.includes(role)) {
                    hasRole = true;
                }
            });

            if (!hasRole) {
                return response.status(403).json({ message: `You don't have a permission` });
            }
            next();
        } catch (error) {
            console.log(error);
            return response.status(403).json({ message: `User is unregistered` });
        }
    }
};