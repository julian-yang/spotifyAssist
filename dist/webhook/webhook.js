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
const WELCOME_INTENT = 'input.welcome'; // the action name from the Dialogflow intent
const TURN_ON_SHUFFLE = 'playback.shuffle.on';
function welcomeIntent(app) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = app.getUser();
        console.log(`Access Token: ${user.accessToken}`);
        const verifiedToken = token_1.decryptTokenCode(user.accessToken);
        const dbUser = yield db.models.User.findById(verifiedToken.userId);
        console.log('googleid: ' + dbUser.google_id + ' spotify access token: ' + dbUser.spotify_access_token);
        const spotifyUserObject = yield spotifyApi.getMe(dbUser);
        //await token.decryptTokenCode(accessToken);
        app.tell(`Welcome to Spotify Assist, ${spotifyUserObject.display_name}!`);
    });
}
const actionMap = new Map();
actionMap.set(WELCOME_INTENT, welcomeIntent);
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
//# sourceMappingURL=webhook.js.map