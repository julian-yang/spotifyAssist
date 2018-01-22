import {NextFunction, Request, Response} from 'express';
import * as jwt from 'jsonwebtoken';
import * as querystring from 'query-string';
import {UriOptions} from 'request';
import * as request from 'request-promise';
import {RequestPromiseOptions} from 'request-promise';

import * as constants from '../config/constants';
import {SPOTIFY_BASE_AUTHORIZATION_URL, SPOTIFY_TOKEN_EXCHANGE} from '../config/constants';
import * as db from '../models/db';
import {UserInstance} from '../models/user';

import * as authentication from './authentication';
import {AuthFlowInfo, AuthFlowInfoWrapper} from './authentication';

interface SpotifyState {
  user_google_id: string;
}

interface SpotifyTokens {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
}

const spotifyScopes = [
  'playlist-read-private', 'playlist-modify-private', 'user-library-read',
  'user-library-modify', 'user-read-playback-state',
  'user-modify-playback-state', 'user-read-currently-playing',
  'user-read-recently-played'
];

const spotifyRedirectUri = constants.generateUrl('/auth/spotifyCallback');

export function loginSpotify(authFlowInfo: AuthFlowInfo, res: Response) {
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
  const spotifyAuthUrl = `${SPOTIFY_BASE_AUTHORIZATION_URL}/?${queryString}`;
  console.log(`Redirecting to Spotify Auth url: ${spotifyAuthUrl}`);
  res.redirect(spotifyAuthUrl);
}

// TODO: handle error state.
export async function processSpotifyLogin(req: Request, res: Response) {
  const code = req.query.code;
  const token = req.query.state;
  const authFlowInfo =
      jwt.verify(token, process.env.JWT_TOKEN_SECRET) as AuthFlowInfo;
  const userId = authFlowInfo.userId;
  const spotifyTokens = await retrieveTokens(code);
  // update user
  const expiration = getTimeSecondsFromNow(spotifyTokens.expires_in);
  const user = await db.models.User.findById(userId);
  user.spotify_access_token = spotifyTokens.access_token;
  user.spotify_access_token_expiration = expiration;
  user.spotify_refresh_token = spotifyTokens.refresh_token;
  await user.save();
  authentication.returnAuthCode(authFlowInfo, res);
}

function getTimeSecondsFromNow(seconds:number) { 
  const now = new Date(Date.now());
  now.setSeconds(now.getSeconds() + seconds);
  return now;
}

async function retrieveTokens(authCode: string): Promise<SpotifyTokens> {
  console.log(authCode);
  const options: (UriOptions&RequestPromiseOptions) = {
    uri: SPOTIFY_TOKEN_EXCHANGE,
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
  const res = await request(options);
  // const res = await request.post(SPOTIFY_TOKEN_EXCHANGE, {form: })
  console.log(res);
  return res as SpotifyTokens;
}

export async function maybeRefreshAccessToken(user:UserInstance) {
  //await user.reload();
  console.log('trying to check for user: ' + JSON.stringify(user.get({plain: true})));
  // No need to refresh if at least 5 seconds left on access token.
  if (user.spotify_access_token_expiration.getTime() > getTimeSecondsFromNow(5).getTime()) {
    return;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const options: (UriOptions&RequestPromiseOptions) = {
    uri: SPOTIFY_TOKEN_EXCHANGE,
    method: 'POST',
    form: {
      grant_type: 'refresh_token',
      refresh_token: user.spotify_refresh_token
    },
    json: true,
    headers: {
      Authorization: 'Basic ' + new Buffer(clientId + ':' + clientSecret).toString('base64')
    }
  }
  const spotifyTokens = await request(options) as SpotifyTokens;
  console.log(spotifyTokens);
  user.spotify_access_token = spotifyTokens.access_token;
  user.spotify_access_token_expiration = getTimeSecondsFromNow(spotifyTokens.expires_in);
  console.log('attempting to save user: ' + JSON.stringify(user.get({plain: true})));
  await user.save();
  //await user.reload();
}