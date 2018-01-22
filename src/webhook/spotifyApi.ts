import {NextFunction, Request, Response} from 'express';
import * as jwt from 'jsonwebtoken';
import * as querystring from 'query-string';
import {UriOptions} from 'request';
import * as request from 'request-promise';
import {RequestPromiseOptions} from 'request-promise';

import * as constants from '../config/constants';
import {SPOTIFY_WEB_API_BASE_URL, SPOTIFY_TOKEN_EXCHANGE} from '../config/constants';
import * as db from '../models/db';
import {UserInstance} from '../models/user';

import * as authentication from '../auth/authentication';
import * as spotifyAuthentication from '../auth/spotify';


export async function getMe(user:UserInstance) {
  const endpointUrl = '/v1/me';
  // check if user's access token is expired
  if (user.spotify_access_token_expiration.getTime() < Date.now()) {
    // refresh access token
    await spotifyAuthentication.refreshAccessToken(user);
  }
  // send request
  const options: (UriOptions&RequestPromiseOptions) = {
    uri: SPOTIFY_WEB_API_BASE_URL + endpointUrl,
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + user.spotify_access_token
    },
    json: true
  };
  const res = await request(options);
  return res as SpotifyApi.UserObjectPrivate;
}

