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
const request = require("request-promise");
const constants_1 = require("../config/constants");
const spotifyAuthentication = require("../auth/spotify");
function getMe(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpointUrl = '/v1/me';
        // check if user's access token is expired
        if (user.spotify_access_token_expiration.getTime() < Date.now()) {
            // refresh access token
            yield spotifyAuthentication.refreshAccessToken(user);
        }
        // send request
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
exports.getMe = getMe;
//# sourceMappingURL=spotifyApi.js.map