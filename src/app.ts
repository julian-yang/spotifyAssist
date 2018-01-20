import * as bluebird from 'bluebird';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';  // compresses requests
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as flash from 'express-flash';
import * as session from 'express-session';
import * as expressValidator from 'express-validator';
import * as lusca from 'lusca';
import * as logger from 'morgan';
import * as path from 'path';


// Load environment variables from .env file, where API keys and passwords are
// configured
dotenv.config({path: '.env'});

// Controllers (route handlers)
import * as homeController from './controllers/home';
import * as apiController from './controllers/api';
import * as contactController from './controllers/contact';

// Load db
import {sequelize} from './models/db';
sequelize.sync();
console.log('test');
sequelize.models.User
    .findOrCreate({where: {google_id: '1234'}, defaults: {google_id: '562'}})
    .then(([user, created]) => {
      console.log(user.get({plain: true}).google_id);
    });

// API keys and Passport configuration

// Create Express server
const app = express();

// Express configuration
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET
}));
app.use(flash());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user && req.path !== '/login' && req.path !== '/signup' &&
      !req.path.match(/^\/auth/) && !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  } else if (req.user && req.path === '/account') {
    req.session.returnTo = req.path;
  }
  next();
});
app.use(express.static(path.join(__dirname, 'public'), {maxAge: 31557600000}));

/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);

/**
 * API examples routes.
 */
app.get('/api', apiController.getApi);

/**
 * OAuth authentication routes. (Sign in)
 */

module.exports = app;