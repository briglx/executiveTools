
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var swig = require('swig');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.disable('x-powered-by');
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

// Routes

// Authentication
var authentication = require('./routes/authentication');
app.post('/login', authentication.login);

// Recommends
app.get('/', setDefaultUser, routes.index);
app.get('/template', setDefaultUser, routes.template);
app.get('/refresh', routes.refresh);

// Activities
var activity = require('./routes/activity');
app.post('/activity', activity.addActivity);
app.get('/activity/:id', activity.getActivities);

// Mocks
var mocks = require('./routes/mock');
app.get('/mock/recommends', mocks.mockRecommends);
app.post('/mock/login', mocks.mockLogin);
app.get('/mock/userDetails', mocks.mockUserDetails);
app.get('/mock/userUnit', mocks.mockCurrentUserUnitNo);



/* Middleware */
function requiresLogin(req, res, next) {
    //if user is authenticated, then let the user go through with next()
    if(req.session.user.permissions.loggedIn) {
        next();
    } else {
        res.redirect('/login');
    }
}

/* Middleware */
function setDefaultUser(req, res, next) {

    if(!req.session.user) {
        req.session.user = {
            individualId: 'Unknown',
            permissions: {
                loggedIn: false
            }
        } ;
    }
    next();
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
