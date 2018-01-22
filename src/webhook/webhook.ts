import {DialogflowApp} from "actions-on-google";
import {NextFunction, Request, Response, Router} from 'express';
import * as db from '../models/db';
import {UserInstance} from '../models/user';
import * as token from '../auth/token';
import { decryptTokenCode } from '../auth/token';
import * as spotifyApi from './spotifyApi';
import { isValidToken } from "../auth/authentication";
import {TOKEN_TYPE} from '../config/constants';
import { enableShufflePlayback } from "./spotifyApi";

const INVALID_TOKEN_MESSAGE = 'sorry try again.';

const WELCOME_INTENT = 'input.welcome';  // the action name from the Dialogflow intent
const TURN_ON_SHUFFLE = 'playback.shuffle.on';

const actionMap = new Map();
actionMap.set(WELCOME_INTENT, welcomeIntent);
actionMap.set(TURN_ON_SHUFFLE, enableShufflePlayback);

export function test(req:Request, res:Response) {
  // let authorization = req.header('Authorization');
  // console.log(authorization);
  // console.log(`req header: ${req.header()}`);
  console.log(`headers: ${JSON.stringify(req.headers)}`);
  console.log(`body: ${JSON.stringify(req.body)}`);
  const app = new DialogflowApp({request: req, response: res});
  app.handleRequest(actionMap);
  // let token = authorization.split(' ')[1];
  // if (authCode.verifyValidAccessToken(token)) {
  //   res.status(200).send('hi!');
  // } else {
  //   res.status(400).send('bad auth!');
  // }
}

async function verifyWebhookRequest(accessToken:string) {
  const verifiedToken = decryptTokenCode(accessToken);
  const valid = isValidToken(verifiedToken, 'google', TOKEN_TYPE.ACCESS_TOKEN);
  if (valid) {
    return db.models.User.findById(verifiedToken.userId);
  } else {
    return null;
  }
}

async function welcomeIntent (app:DialogflowApp) {
  const user = app.getUser();
  console.log(`Access Token: ${user.accessToken}`);
  try {
    const dbUser = await verifyWebhookRequest(user.accessToken);
    console.log('googleid: ' + dbUser.google_id + ' spotify access token: ' + dbUser.spotify_access_token);
    const spotifyUserObject = await spotifyApi.getMe(dbUser);
    app.ask(`Welcome to Spotify Assist, ${spotifyUserObject.display_name}! Speak a command.`);
  } catch (err) {
    console.log(err);
    app.tell(INVALID_TOKEN_MESSAGE);
  }
  
}

async function enableShufflePlaybackIntent(app:DialogflowApp) {
  const user = app.getUser();
  try {
    const dbUser = await verifyWebhookRequest(user.accessToken);
    await enableShufflePlayback(dbUser);
    app.tell('ok');
  } catch (err) {
    console.log(err);
    app.tell(INVALID_TOKEN_MESSAGE + ' ' + err);
  }
}

