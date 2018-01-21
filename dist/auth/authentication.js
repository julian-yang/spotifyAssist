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
const express_1 = require("express");
const google_auth_library_1 = require("google-auth-library");
const jwt = require("jsonwebtoken");
const url_1 = require("url");
const constants_1 = require("../config/constants");
const db = require("../models/db");
const spotify = require("./spotify");
const token = require("./token");
const googleOauth2 = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, 
// Don't need this right now I think.
constants_1.GOOGLE_CALLBACK_URL);
// Doesn't work right now.
const redirectToGoogleSignin = (req, res) => {
    const assistantRedirectUrl = req.query.redirect_uri;
    const stateToken = jwt.sign(assistantRedirectUrl, process.env.JWT_TOKEN_SECRET);
    const authUrl = googleOauth2.generateAuthUrl({
        access_type: 'offline',
        client_id: process.env.GOOGLE_CLIENT_ID,
        include_granted_scopes: true,
        prompt: 'select_account',
        redirect_uri: constants_1.GOOGLE_CALLBACK_URL,
        scope: ['profile'],
        state: stateToken
    });
    res.redirect(authUrl);
};
// for testing
function testSignin(req, res) {
    const hostName = req.hostname;
    const protocol = req.protocol;
    const port = constants_1.IS_DEV ? ':5000' : '';
    const redirectUrl = `${protocol}://${hostName}${port}/auth/signinResult`;
    const hrefUrl = `signin?client_id=google&redirect_uri=${redirectUrl}`;
    res.render('signin', { redirectUrl });
}
function signinPost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const idtoken = req.body.idtoken;
        const state = req.body.state;
        const redirectUrl = req.body.redirectUrl;
        const clientId = req.body.clientId;
        // Verify the id_token, and access the claims.
        try {
            const ticket = yield googleOauth2.verifyIdToken({
                idToken: idtoken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const googleId = ticket.getUserId();
            console.log('googleId: ' + googleId);
            // fetch/create user.
            const user = (yield db.models.User.findOrCreate({ where: { google_id: googleId } }))[0];
            const authFlowInfo = { userId: user.id, clientId: 'google', state, redirectUrl };
            // if user does not have spotify credentials, redirect to spotify auth.
            // else return auth codes
            if (!user.spotify_access_token) {
                req.user = user;
                spotify.loginSpotify(authFlowInfo, res);
            }
            else {
                // get ten minutes from now.
                // create new authorization
                returnAuthCode(authFlowInfo, res);
            }
        }
        catch (err) {
            console.log('Something went wrong!: ' + err);
        }
    });
}
function signinResult(req, res) {
    const code = req.query.code;
    const state = req.query.state;
    res.render('signin_result', { authCodeToken: code, state });
}
function returnAuthCode(authCodeInfo, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // build redirect url
        const authCode = token.generateTokenCode(authCodeInfo.userId, authCodeInfo.clientId, constants_1.TOKEN_TYPE.AUTH_CODE);
        const completeRedirectUrl = new url_1.URL(authCodeInfo.redirectUrl);
        completeRedirectUrl.searchParams.append('code', authCode);
        completeRedirectUrl.searchParams.append('state', authCodeInfo.state);
        const redirect = completeRedirectUrl.href;
        console.log(redirect);
        res.redirect(redirect);
    });
}
exports.returnAuthCode = returnAuthCode;
function exchangeToken(req, res) {
    const clientId = req.body.client_id;
    const clientSecret = req.body.client_secret;
    const grantType = req.body.grant_type;
    // TODO: validate clientId && clientSecret pairing.
    const inputToken = req.body.code ? req.body.code : req.body.refresh_token;
    console.log(`token: ${inputToken}`);
    const verifiedToken = token.decryptTokenCode(inputToken);
    const userId = verifiedToken.userId;
    if (grantType === 'authorization_code' &&
        isValidToken(verifiedToken, clientId, constants_1.TOKEN_TYPE.AUTH_CODE)) {
        const response = buildTokenExchangeResponse(userId, clientId, true /*includeRefreshToken*/);
        res.json(response);
    }
    else if (grantType === 'refresh_token' &&
        isValidToken(verifiedToken, clientId, constants_1.TOKEN_TYPE.REFRESH_TOKEN)) {
        const response = buildTokenExchangeResponse(userId, clientId, false /*includeRefreshToken*/);
        res.json(response);
    }
    else {
        res.status(400).json({ error: 'invalid_grant' });
    }
}
function isValidToken(token, clientId, expectedTokenType) {
    const validClientId = token.clientId === clientId;
    const validTokenType = token.type === expectedTokenType;
    const notExpired = expectedTokenType === constants_1.TOKEN_TYPE.AUTH_CODE ?
        token.expiresAt.getTime() > Date.now() :
        true;
    return validClientId && validTokenType && notExpired;
}
function buildTokenExchangeResponse(userId, clientId, includeRefreshToken) {
    const response = {
        token_type: 'bearer',
        access_token: token.generateTokenCode(userId, clientId, constants_1.TOKEN_TYPE.ACCESS_TOKEN),
        expires_in: 60 * 60
    };
    if (includeRefreshToken) {
        response.refresh_token =
            token.generateTokenCode(userId, clientId, constants_1.TOKEN_TYPE.REFRESH_TOKEN);
    }
    return response;
}
exports.router = express_1.Router();
exports.router.get('/signin', testSignin);
exports.router.post('/signin', signinPost);
exports.router.get('/signinResult', signinResult);
exports.router.post('/exchangeToken', exchangeToken);
exports.router.get('/spotifyCallback', spotify.processSpotifyLogin);
//# sourceMappingURL=authentication.js.map