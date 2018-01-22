"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const actions_on_google_1 = require("actions-on-google");
const db = require("../models/db");
const token_1 = require("../auth/token");
const spotifyApi = require("./spotifyApi");
const authentication_1 = require("../auth/authentication");
const constants_1 = require("../config/constants");
const spotifyApi_1 = require("./spotifyApi");
const INVALID_TOKEN_MESSAGE = 'sorry try again.';
const WELCOME_INTENT = 'input.welcome'; // the action name from the Dialogflow intent
const TURN_ON_SHUFFLE = 'playback.shuffle.on';
const actionMap = new Map();
actionMap.set(WELCOME_INTENT, welcomeIntent);
actionMap.set(TURN_ON_SHUFFLE, spotifyApi_1.enableShufflePlayback);
function test(req, res) {
    // let authorization = req.header('Authorization');
    // console.log(authorization);
    // console.log(`req header: ${req.header()}`);
    console.log(`headers: ${JSON.stringify(req.headers)}`);
    console.log(`body: ${JSON.stringify(req.body)}`);
    const app = new actions_on_google_1.DialogflowApp({ request: req, response: res });
    app.handleRequest(actionMap);
    // let token = authorization.split(' ')[1];
    // if (authCode.verifyValidAccessToken(token)) {
    //   res.status(200).send('hi!');
    // } else {
    //   res.status(400).send('bad auth!');
    // }
}
exports.test = test;
function verifyWebhookRequest(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const verifiedToken = token_1.decryptTokenCode(accessToken);
        const valid = authentication_1.isValidToken(verifiedToken, 'google', constants_1.TOKEN_TYPE.ACCESS_TOKEN);
        if (valid) {
            return db.models.User.findById(verifiedToken.userId);
        }
        else {
            console.log(`verifyWebhookRequest for accessToken ${accessToken} failed! ${JSON.stringify(verifiedToken)}`);
            return null;
        }
    });
}
function welcomeIntent(app) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = app.getUser();
        console.log(`Access Token: ${user.accessToken}`);
        try {
            const dbUser = yield verifyWebhookRequest(user.accessToken);
            console.log('googleid: ' + dbUser.google_id + ' spotify access token: ' + dbUser.spotify_access_token);
            const spotifyUserObject = yield spotifyApi.getMe(dbUser);
            app.ask(`Welcome to Spotify Assist, ${spotifyUserObject.display_name}! Speak a command.`);
        }
        catch (err) {
            console.log(err);
            app.tell(INVALID_TOKEN_MESSAGE);
        }
    });
}
function enableShufflePlaybackIntent(app) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = app.getUser();
        try {
            const dbUser = yield verifyWebhookRequest(user.accessToken);
            console.log('user from enableShufflePlayback ' + JSON.stringify(dbUser));
            yield spotifyApi_1.enableShufflePlayback(dbUser);
            app.tell('ok');
        }
        catch (err) {
            console.log(err);
            app.tell(INVALID_TOKEN_MESSAGE + ' ' + err);
        }
    });
}
//# sourceMappingURL=webhook.js.map