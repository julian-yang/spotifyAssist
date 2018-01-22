"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IS_DEV = process.env.ENV === 'LOCAL';
exports.GOOGLE_CALLBACK_URL = '';
exports.SPOTIFY_BASE_AUTHORIZATION_URL = 'https://accounts.spotify.com/authorize';
exports.SPOTIFY_TOKEN_EXCHANGE = 'https://accounts.spotify.com/api/token';
exports.SPOTIFY_WEB_API_BASE_URL = 'https://api.spotify.com';
var TOKEN_TYPE;
(function (TOKEN_TYPE) {
    TOKEN_TYPE[TOKEN_TYPE["AUTH_CODE"] = 0] = "AUTH_CODE";
    TOKEN_TYPE[TOKEN_TYPE["ACCESS_TOKEN"] = 1] = "ACCESS_TOKEN";
    TOKEN_TYPE[TOKEN_TYPE["REFRESH_TOKEN"] = 2] = "REFRESH_TOKEN";
})(TOKEN_TYPE = exports.TOKEN_TYPE || (exports.TOKEN_TYPE = {}));
const domain = exports.IS_DEV ? 'http://localhost:5000' : 'https://spotify-assist.herokuapp.com';
function generateUrl(route) {
    return `${domain}${route}`;
}
exports.generateUrl = generateUrl;
//# sourceMappingURL=constants.js.map