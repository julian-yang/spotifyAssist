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
const jwt = require("jsonwebtoken");
const querystring = require("query-string");
const request = require("request-promise");
const constants = require("../config/constants");
const constants_1 = require("../config/constants");
const db = require("../models/db");
const authentication = require("./authentication");
const spotifyScopes = [
    'playlist-read-private', 'playlist-modify-private', 'user-library-read',
    'user-library-modify', 'user-read-playback-state',
    'user-modify-playback-state', 'user-read-currently-playing',
    'user-read-recently-played'
];
const spotifyRedirectUri = constants.generateUrl('/auth/spotifyCallback');
function loginSpotify(authFlowInfo, res) {
    const state = jwt.sign(authFlowInfo, process.env.JWT_TOKEN_SECRET);
    console.log(`authorizing Spotify for user id ${authFlowInfo.userId}`);
    const queryString = querystring.stringify({
        client_id: process.env.SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: spotifyRedirectUri,
        state,
        scope: spotifyScopes.join(' '),
        show_dialog: true
    });
    const spotifyAuthUrl = `${constants_1.SPOTIFY_BASE_AUTHORIZATION_URL}/?${queryString}`;
    console.log(`Redirecting to Spotify Auth url: ${spotifyAuthUrl}`);
    res.redirect(spotifyAuthUrl);
}
exports.loginSpotify = loginSpotify;
// TODO: handle error state.
function processSpotifyLogin(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const code = req.query.code;
        const token = req.query.state;
        const authFlowInfo = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
        const userId = authFlowInfo.userId;
        const spotifyTokens = yield retrieveTokens(code);
        // update user
        const expiration = getTimeSecondsFromNow(spotifyTokens.expires_in);
        const user = yield db.models.User.findById(userId);
        user.spotify_access_token = spotifyTokens.access_token;
        user.spotify_access_token_expiration = expiration;
        user.spotify_refresh_token = spotifyTokens.refresh_token;
        yield user.save();
        authentication.returnAuthCode(authFlowInfo, res);
    });
}
exports.processSpotifyLogin = processSpotifyLogin;
function getTimeSecondsFromNow(seconds) {
    const now = new Date(Date.now());
    now.setSeconds(now.getSeconds() + seconds);
    return now;
}
function retrieveTokens(authCode) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(authCode);
        const options = {
            uri: constants_1.SPOTIFY_TOKEN_EXCHANGE,
            method: 'POST',
            form: {
                grant_type: 'authorization_code',
                code: authCode,
                redirect_uri: spotifyRedirectUri,
                client_id: process.env.SPOTIFY_CLIENT_ID,
                client_secret: process.env.SPOTIFY_CLIENT_SECRET
            },
            json: true
        };
        console.log(options.form);
        const res = yield request(options);
        // const res = await request.post(SPOTIFY_TOKEN_EXCHANGE, {form: })
        console.log(res);
        return res;
    });
}
function maybeRefreshAccessToken(user) {
    return __awaiter(this, void 0, void 0, function* () {
        //await user.reload();
        console.log('trying to check for user: ' + JSON.stringify(user.get({ plain: true })));
        // No need to refresh if at least 5 seconds left on access token.
        if (user.spotify_access_token_expiration.getTime() > getTimeSecondsFromNow(5).getTime()) {
            return;
        }
        const clientId = process.env.SPOTIFY_CLIENT_ID;
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
        const options = {
            uri: constants_1.SPOTIFY_TOKEN_EXCHANGE,
            method: 'POST',
            form: {
                grant_type: 'refresh_token',
                refresh_token: user.spotify_refresh_token
            },
            json: true,
            headers: {
                Authorization: 'Basic ' + new Buffer(clientId + ':' + clientSecret).toString('base64')
            }
        };
        const spotifyTokens = yield request(options);
        console.log(spotifyTokens);
        user.spotify_access_token = spotifyTokens.access_token;
        user.spotify_access_token_expiration = getTimeSecondsFromNow(spotifyTokens.expires_in);
        console.log('attempting to save user: ' + JSON.stringify(user.get({ plain: true })));
        yield user.save();
        //await user.reload();
    });
}
exports.maybeRefreshAccessToken = maybeRefreshAccessToken;
//# sourceMappingURL=spotify.js.map