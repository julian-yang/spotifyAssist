import {DialogflowApp} from "actions-on-google";
import {NextFunction, Request, Response, Router} from 'express';
import * as db from '../models/db';
import {UserInstance} from '../models/user';
import * as token from '../auth/token';
import { decryptTokenCode } from '../auth/token';
import * as spotifyApi from './spotifyApi';

const WELCOME_INTENT = 'input.welcome';  // the action name from the Dialogflow intent
const TURN_ON_SHUFFLE = 'playback.shuffle.on';
async function welcomeIntent (app:DialogflowApp) {
  const user = app.getUser();
  console.log(`Access Token: ${user.accessToken}`);
  const verifiedToken = decryptTokenCode(user.accessToken);
  const dbUser = await db.models.User.findById(verifiedToken.userId);
  console.log('googleid: ' + dbUser.google_id + ' spotify access token: ' + dbUser.spotify_access_token);
  const spotifyUserObject = await spotifyApi.getMe(dbUser);
  //await token.decryptTokenCode(accessToken);
  app.tell(`Welcome to Spotify Assist, ${spotifyUserObject.display_name}!`);
}

const actionMap = new Map();
actionMap.set(WELCOME_INTENT, welcomeIntent);

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

