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
const querystring = require("query-string");
const request = require("request-promise");
const constants_1 = require("../config/constants");
const spotify_1 = require("../auth/spotify");
function getMe(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpointUrl = '/v1/me';
        // check if user's access token is expired
        const res = yield sendApiGetRequest(user, endpointUrl);
        return res;
    });
}
exports.getMe = getMe;
function enableShufflePlayback(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpointUrl = '/v1/me/player/shuffle';
        const queryString = querystring.stringify({
            state: 'true'
        });
        console.log(`queryString: ${queryString}`);
        const res = yield sendApiPutRequest(user, endpointUrl, queryString);
        console.log('from enableShufflePlayback: ' + res);
    });
}
exports.enableShufflePlayback = enableShufflePlayback;
function sendApiPutRequest(user, endpointUrl, queryString) {
    return __awaiter(this, void 0, void 0, function* () {
        spotify_1.maybeRefreshAccessToken(user);
        const options = {
            uri: constants_1.SPOTIFY_WEB_API_BASE_URL + endpointUrl,
            method: 'PUT',
            headers: {
                Authorization: 'Bearer ' + user.spotify_access_token
            },
            qs: queryString
        };
        const res = yield request(options);
        return res;
    });
}
function sendApiGetRequest(user, endpointUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        spotify_1.maybeRefreshAccessToken(user);
        const options = {
            uri: constants_1.SPOTIFY_WEB_API_BASE_URL + endpointUrl,
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + user.spotify_access_token
            },
            json: true
        };
        const res = yield request(options);
        return res;
    });
}
//# sourceMappingURL=spotifyApi.js.map