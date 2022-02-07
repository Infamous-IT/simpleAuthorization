const jwt = require('jsonwebtoken');
const { secret } = require('../config.js');

module.exports = function(request, response, next) {
    if (request.method === "OPTIONS") {
        next();
    }

    try {
        const token = request.headers.authorization.split(' ')[1];
        if (!token) {
            return response.status(403).json({ message: `User is unregistered` });
        }

        const decodedData = jwt.verify(token, secret);
        request.user = decodedData;
        next();
    } catch (error) {
        console.log(error);
        return response.status(403).json({ message: `User is unregistered` });
    }
}