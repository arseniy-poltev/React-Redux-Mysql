const Sequelize = require('sequelize');
const mailUserName = "angelhosts771@gmail.com";
const mailPassword = "angel890!@";
const mailHost = "angelhosts771@gmail.com";
const sequelize = new Sequelize('react_dash', 'root', null, {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 2500,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Paypal Configuration
let client_id = 'Ae6tn2Xzm8n1v_zYvkFkEKTJWbOPmvbM-iCOKbgb673YcpWKg9GlsesR_N6tTXAdu5WKEMEsR0lXeYav';
let client_secret = 'EEe3yHBwub-NpzGf9M5uH7avLuIN4oycxqBhM9QldbzYWsLwagfkdXAY0z8duvtA4yUBt6YBNtS6X6iB';

// FCM
let secretFCM = 'AAAAaaMxfDA:APA91bGJ3zlGJYCEbesos0bYwqixXa90aIH_vP3L1kQKIF3yFB0r5p5OdInvaKOhk2xtzZyJjSlMJDm7fXUtij860cFox-jSMse7GKbA8o5EbTzJ9fdtf3gHEqX6YTetCHq24_bsoy7U';

module.exports = {
    "connection": sequelize,
    "secret": "templeSinai",
    "userName": mailUserName,
    "userPassword": mailPassword,
    "hostName": mailHost,
    "client_id": client_id,
    "client_secret": client_secret,
    "serverKey": secretFCM,
    "tokenExpires": 43200, // 12 hours
    "updatedTokenExpires": 3600 // 1 hour
};
