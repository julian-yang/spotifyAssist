"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const actions_on_google_1 = require("actions-on-google");
const WELCOME_INTENT = 'input.welcome'; // the action name from the Dialogflow intent
const TURN_ON_SHUFFLE = 'playback.shuffle.on';
function welcomeIntent(app) {
    const accessToken = app.getArgument('accessToken');
    console.log(`Access Token: ${accessToken}`);
    //await token.decryptTokenCode(accessToken);
    app.tell('Welcome to Spotify Assist TS, hooray!');
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