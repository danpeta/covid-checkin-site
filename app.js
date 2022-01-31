var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql');
var session = require('express-session');
const createDOMPurify = require('dompurify');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var homeRouter = require('./routes/home');
var manageBusinessRouter = require('./routes/manage-business');
var healthOfficialRouter = require('./routes/health-official');

var dbConnectionPool = mysql.createPool({
    host: 'localhost',
    database: 'covid_website'
});

var app = express();

app.use(function(req, res, next) {
    req.pool = dbConnectionPool;
    next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
    secret: 'nKb+2gq9jTSZ+^M?$=S7dvR?z7t&eg',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/home', homeRouter);
app.use('/home/manage-business', manageBusinessRouter);
app.use('/home/health-official', healthOfficialRouter);

module.exports = app;
