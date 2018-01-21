"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const compression = require("compression"); // compresses requests
const dotenv = require("dotenv");
const express = require("express");
const expressValidator = require("express-validator");
const lusca = require("lusca");
const logger = require("morgan");
const path = require("path");
// Load environment variables from .env file, where API keys and passwords are
// configured
dotenv.config({ path: '.env' });
// Controllers (route handlers)
const homeController = require("./controllers/home");
const apiController = require("./controllers/api");
const contactController = require("./controllers/contact");
const authenticationController = require("./auth/authentication");
const webhookController = require("./webhook/webhook");
// Load db
const db_1 = require("./models/db");
db_1.sequelize.sync();
// console.log('test');
// sequelize.models.User.findOrCreate({where: {google_id: '1235'}})
//    .spread((user: User.UserInstance, created: boolean) => {
//      console.log(user.google_id);
//    });
// API keys and Passport configuration
// Create Express server
const app = express();
// Express configuration
app.set('port', process.env.PORT || 5000);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.use('/auth', authenticationController.router);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/webhook', webhookController.test);
/**
 * API examples routes.
 */
app.get('/api', apiController.getApi);
/**
 * OAuth authentication routes. (Sign in)
 */
module.exports = app;
//# sourceMappingURL=app.js.map