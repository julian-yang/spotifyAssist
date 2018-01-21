import {DialogflowApp} from "actions-on-google";
import {NextFunction, Request, Response, Router} from 'express';

const WELCOME_INTENT = 'input.welcome';  // the action name from the Dialogflow intent

function welcomeIntent (app:DialogflowApp) {
  app.tell('Welcome to Spotify Assist TS, hooray!');
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

