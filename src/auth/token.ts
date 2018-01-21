import * as jwt from 'jsonwebtoken';
const timestamp = require('unix-timestamp');
import * as crypto from 'crypto';
import {TOKEN_TYPE} from '../config/constants';
const constants = require('../constants.js');

const TEN_MINUTES_IN_SECONDS = 10 * 60;
const ONE_HOUR_IN_SECONDS = 60 * 60;

export function generateRandomToken() {
  const buffer = crypto.randomBytes(256);
  return crypto.createHash('sha1').update(buffer).digest('hex');
}

export interface Token {
  type: TOKEN_TYPE;
  userId: number;
  clientId: string;
  expiresAt: Date;
}

export function generateTokenCode(
    userId: number, clientId: string, type: TOKEN_TYPE) {
  let expiresAt = null;
  if (type === TOKEN_TYPE.AUTH_CODE) {
    expiresAt = timestamp.toDate(timestamp.now(ONE_HOUR_IN_SECONDS));
  } else if (type === TOKEN_TYPE.ACCESS_TOKEN) {
    expiresAt = timestamp.toDate(timestamp.now(ONE_HOUR_IN_SECONDS));
  }
  const token: Token = {
    type,
    userId,
    clientId,
    expiresAt,

  };
  const tokenCode = jwt.sign(token, process.env.JWT_TOKEN_SECRET);
  return tokenCode;
}

export function decryptTokenCode(tokenCode: string): Token {
  try {
    const verifiedToken =
        jwt.verify(tokenCode, process.env.JWT_TOKEN_SECRET) as Token;
    return verifiedToken;
  } catch (err) {
    console.log(`err decrypting token: ${err}`);
    return err;
  }
}

function verifyValidAccessToken(tokenCode: string) {
  const token = decryptTokenCode(tokenCode);
  const notExpired = token.expiresAt.getTime() > Date.now();
  const isAccessToken = token.type === constants.ACCESS_TOKEN;
  return notExpired && isAccessToken;
}
