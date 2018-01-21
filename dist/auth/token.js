"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const constants_1 = require("../config/constants");
const TEN_MINUTES_IN_SECONDS = 10 * 60;
const ONE_HOUR_IN_SECONDS = 60 * 60;
function generateRandomToken() {
    const buffer = crypto.randomBytes(256);
    return crypto.createHash('sha1').update(buffer).digest('hex');
}
exports.generateRandomToken = generateRandomToken;
function getSecondsFromNow(seconds) {
    const date = new Date(Date.now());
    date.setSeconds(date.getSeconds() + seconds);
    return date;
}
exports.getSecondsFromNow = getSecondsFromNow;
function generateTokenCode(userId, clientId, type) {
    let expiresAt = null;
    if (type === constants_1.TOKEN_TYPE.AUTH_CODE) {
        expiresAt = getSecondsFromNow(ONE_HOUR_IN_SECONDS);
    }
    else if (type === constants_1.TOKEN_TYPE.ACCESS_TOKEN) {
        expiresAt = getSecondsFromNow(ONE_HOUR_IN_SECONDS);
    }
    const token = {
        type,
        userId,
        clientId,
        expiresAt,
    };
    const tokenCode = jwt.sign(token, process.env.JWT_TOKEN_SECRET);
    return tokenCode;
}
exports.generateTokenCode = generateTokenCode;
function decryptTokenCode(tokenCode) {
    try {
        const verifiedToken = jwt.verify(tokenCode, process.env.JWT_TOKEN_SECRET);
        return verifiedToken;
    }
    catch (err) {
        console.log(`err decrypting token: ${err}`);
        return err;
    }
}
exports.decryptTokenCode = decryptTokenCode;
function verifyValidAccessToken(tokenCode) {
    const token = decryptTokenCode(tokenCode);
    const notExpired = token.expiresAt.getTime() > Date.now();
    const isAccessToken = token.type === constants_1.TOKEN_TYPE.ACCESS_TOKEN;
    return notExpired && isAccessToken;
}
//# sourceMappingURL=token.js.map