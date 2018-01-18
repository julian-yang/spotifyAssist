"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const compression = require("compression"); // compresses requests
const session = require("express-session");
const bodyParser = require("body-parser");
const logger = require("morgan");
const lusca = require("lusca");
const dotenv = require("dotenv");
const flash = require("express-flash");
const path = require("path");
const expressValidator = require("express-validator");
// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: ".env.example" });
// Controllers (route handlers)
const homeController = require("./controllers/home");
const apiController = require("./controllers/api");
const contactController = require("./controllers/contact");
// API keys and Passport configuration
// Create Express server
const app = express();
// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(compression());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET
}));
app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});
app.use((req, res, next) => {
    // After successful login, redirect back to the intended page
    if (!req.user &&
        req.path !== "/login" &&
        req.path !== "/signup" &&
        !req.path.match(/^\/auth/) &&
        !req.path.match(/\./)) {
        req.session.returnTo = req.path;
    }
    else if (req.user &&
        req.path == "/account") {
        req.session.returnTo = req.path;
    }
    next();
});
app.use(express.static(path.join(__dirname, "public"), { maxAge: 31557600000 }));
/**
 * Primary app routes.
 */
app.get("/", homeController.index);
app.get("/contact", contactController.getContact);
app.post("/contact", contactController.postContact);
/**
 * API examples routes.
 */
app.get("/api", apiController.getApi);
/**
 * OAuth authentication routes. (Sign in)
 */
module.exports = app;
//# sourceMappingURL=app.js.map