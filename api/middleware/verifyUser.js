const jwt = require('jsonwebtoken');
const config = require('../config/database.js');
module.exports = (req, res, next) => {
    let token = req.body.token || req.query.token || req.headers.token;
    if (token) {
        if (token.indexOf('"') > -1) {
            token = token.substring(1, token.length - 1);
        }
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                console.log("error", err);
                return res.status(403).send({
                    status: "Error",
                    message: 'Failed to authenticate token.',
                });
            }
            if (decoded._doc) {
                decoded = decoded._doc;
            }
            if (decoded.exp - decoded.iat === config.tokenExpires) {
                return res.status(403).send({
                    status: "Error",
                    message: 'Failed to authenticate token.',
                });
            }
            req.user = decoded;
            console.log("Login--User", JSON.stringify(decoded));
            delete decoded['iat'];
            delete decoded['exp'];
            req.token = jwt.sign(decoded, config.secret, {expiresIn: config.updatedTokenExpires});
            next();
        });
    } else {
        return res.status(403).send({
            status: "Error",
            message: 'Failed to authenticate token.',
        });
    }
};