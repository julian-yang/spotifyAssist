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
import { maybeRefreshAccessToken } from '../auth/spotify';


export async function getMe(user:UserInstance) {
  const endpointUrl =  '/v1/me';
  // check if user's access token is expired
  const res = await sendApiGetRequest(user, endpointUrl) as SpotifyApi.UserObjectPrivate;
  return res;
}

export async function enableShufflePlayback(user:UserInstance) {
  const endpointUrl = '/v1/me/player/shuffle'
  const queryString = {
    state: true
  };
  console.log(`queryString: ${queryString}`);
  const res = await sendApiPutRequest(user, endpointUrl, queryString);
  console.log('from enableShufflePlayback: ' + res);
}

async function sendApiPutRequest(user:UserInstance, endpointUrl:string, queryString:object) {
  maybeRefreshAccessToken(user);
  const options: (UriOptions&RequestPromiseOptions) = {
    uri: SPOTIFY_WEB_API_BASE_URL + endpointUrl,
    method: 'PUT',
    headers: {
      Authorization: 'Bearer ' + user.spotify_access_token
    },
    qs: queryString
  };
  const res = await request(options);
  return res;
}

async function sendApiGetRequest(user:UserInstance, endpointUrl:string) {
  maybeRefreshAccessToken(user);
  const options: (UriOptions&RequestPromiseOptions) = {
    uri: SPOTIFY_WEB_API_BASE_URL + endpointUrl,
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + user.spotify_access_token
    },
    json: true
  };
  const res = await request(options);  
  return res;
}

