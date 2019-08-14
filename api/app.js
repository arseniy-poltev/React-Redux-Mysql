var createError = require('http-errors');
const http = require('http');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
const debug = require('debug')('backend:server');
var cors = require('cors');
const apiTestRoutes = require('./routes/test.route');
const apiAuthRoutes = require('./routes/auth.route');
const apiUserRoutes = require('./routes/apiUserRoutes');
const apiAdminRoutes = require('./routes/apiAdminRoutes');
const apiSuperAdminRoutes = require('./routes/apiSuperAdminRoutes');
const verifyUser = require('./middleware/verifyUser');
var port = process.env.PORT || 1367;
var app = express();

// app.use(express.cookieParser('familydesire'));
// app.use(express.session());
app.use(cors());
app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(fileUpload());
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

var enableCORS = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,FETCH');
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Content-Length, X-Requested-With, Accept');
    if ('OPTIONS' === req.method) {
        res.sendStatus(200);
    } else {
        next();
    }
};
app.all("/*", (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,FETCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, X-Requested-With, Accept');
    next();
});

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('port', port);
app.use(logger('dev'));
// app.use(enableCORS);
//app.use(cookieParser('familydesire'));
app.use(cookieParser());

// Routes
app.use('/api/file', express.static(path.join(__dirname, 'files')));
app.use('/api/super', verifyUser, apiSuperAdminRoutes);
app.use('/api/admin', verifyUser, apiAdminRoutes);
app.use('/api/auth', apiAuthRoutes);
app.use('/api/test', apiTestRoutes);
app.use('/api', verifyUser, apiUserRoutes);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});
const server = http.createServer(app);
server.listen(port);
server.on('error', (error) => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
});
server.on('listening', () => {
    let addr = server.address();
    console.log(`---------Server Listening------------`);
    console.log(`Port: ${addr.port}`);
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    debug('Listening on ' + bind);
});