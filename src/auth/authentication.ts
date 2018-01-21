import {NextFunction, Request, Response, Router} from 'express';
import {OAuth2Client} from 'google-auth-library';
import * as jwt from 'jsonwebtoken';

import {GOOGLE_CALLBACK_URL, IS_DEV, TOKEN_TYPE} from '../config/constants';
import * as db from '../models/db';

import * as spotify from './spotify';
import * as token from './token';

const googleOauth2 = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    // Don't need this right now I think.
    GOOGLE_CALLBACK_URL,
);

// Doesn't work right now.
const redirectToGoogleSignin = (req: Request, res: Response) => {
  const assistantRedirectUrl = req.query.redirect_uri;
  const stateToken =
      jwt.sign(assistantRedirectUrl, process.env.JWT_TOKEN_SECRET);
  const authUrl = googleOauth2.generateAuthUrl({
    access_type: 'offline',
    client_id: process.env.GOOGLE_CLIENT_ID,
    include_granted_scopes: true,
    prompt: 'select_account',
    redirect_uri: GOOGLE_CALLBACK_URL,
    scope: ['profile'],
    state: stateToken
  });
  res.redirect(authUrl);
};

// for testing
function testSignin(req: Request, res: Response): void {
  const hostName = req.hostname;
  const protocol = req.protocol;
  const port = IS_DEV ? ':3000' : '';
  const redirectUrl = `${protocol}://${hostName}${port}/auth/signinResult`;
  const hrefUrl = `signin?client_id=google&redirect_uri=${redirectUrl}`;
  res.render('signin', {redirectUrl});
}

async function signinPost(req: Request, res: Response) {
  const idtoken = req.body.idtoken;
  const state = req.body.state;
  const redirectUrl = req.body.redirectUrl;
  const clientId = req.body.clientId;
  // Verify the id_token, and access the claims.
  try {
    const ticket = await googleOauth2.verifyIdToken({
      idToken: idtoken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const googleId = ticket.getUserId();
    console.log('googleId: ' + googleId);
    // fetch/create user.
    const user =
        (await db.User.findOrCreate({where: {google_id: googleId}}))[0];
    const authFlowInfo: AuthFlowInfo =
        {userId: user.id, clientId: 'google', state, redirectUrl};

    // if user does not have spotify credentials, redirect to spotify auth.
    // else return auth codes
    if (!user.spotify_access_token) {
      req.user = user;
      spotify.loginSpotify(authFlowInfo, res);
    } else {
      // get ten minutes from now.
      // create new authorization
      returnAuthCode(authFlowInfo, res);
    }
  } catch (err) {
    console.log('Something went wrong!: ' + err);
  }
}

function signinResult(req: Request, res: Response) {
  const code = req.query.code;
  const state = req.query.state;
  res.render('signin_result', {authCodeToken: code, state});
}

export interface AuthFlowInfo {
  userId: number;
  clientId: string;
  state: string;
  redirectUrl: string;
}

export async function returnAuthCode(
    authCodeInfo: AuthFlowInfo, res: Response) {
  // build redirect url
  const authCode = token.generateTokenCode(
      authCodeInfo.userId, authCodeInfo.clientId, TOKEN_TYPE.AUTH_CODE);
  const completeRedirectUrl = new URL(authCodeInfo.redirectUrl);
  completeRedirectUrl.searchParams.append('code', authCode);
  completeRedirectUrl.searchParams.append('state', authCodeInfo.state);
  const redirect = completeRedirectUrl.href;
  console.log(redirect);
  res.redirect(redirect);
}

function exchangeToken(req: Request, res: Response) {
  const clientId = req.body.client_id;
  const clientSecret = req.body.client_secret;
  const grantType = req.body.grant_type;
  // TODO: validate clientId && clientSecret pairing.
  const inputToken = req.body.code ? req.body.code : req.body.refresh_token;
  console.log(`token: ${inputToken}`);
  const verifiedToken = token.decryptTokenCode(inputToken);

  const userId = verifiedToken.userId;
  if (grantType === 'authorization_code' &&
      isValidToken(verifiedToken, clientId, TOKEN_TYPE.AUTH_CODE)) {
    const response = buildTokenExchangeResponse(
        userId, clientId, true /*includeRefreshToken*/);
    res.json(response);
  } else if (
      grantType === 'refresh_token' &&
      isValidToken(verifiedToken, clientId, TOKEN_TYPE.REFRESH_TOKEN)) {
    const response = buildTokenExchangeResponse(
        userId, clientId, false /*includeRefreshToken*/);
    res.json(response);
  } else {
    res.status(400).json({error: 'invalid_grant'});
  }
}

function isValidToken(
    token: token.Token, clientId: string, expectedTokenType: TOKEN_TYPE) {
  const validClientId = token.clientId === clientId;
  const validTokenType = token.type === expectedTokenType;
  const notExpired = expectedTokenType === TOKEN_TYPE.AUTH_CODE ?
      token.expiresAt.getDate() > Date.now() :
      true;
  return validClientId && validTokenType && notExpired;
}

function buildTokenExchangeResponse(
    userId: number, clientId: string, includeRefreshToken: boolean) {
  const response = {} as any;
  response['token_type'] = 'bearer';
  response['access_token'] =
      token.generateTokenCode(userId, clientId, TOKEN_TYPE.ACCESS_TOKEN);
  response['expires_in'] = 60 * 60;
  if (includeRefreshToken) {
    response['refresh_token'] =
        token.generateTokenCode(userId, clientId, TOKEN_TYPE.REFRESH_TOKEN);
  }
  return response;
}

export const router = Router();
router.get('/signin', testSignin);
router.post('/signin', signinPost);
router.get('/signinResult', signinResult);
router.post('/exchangeToken', exchangeToken);
router.get('/spotifyCallback', spotify.processSpotifyLogin);
