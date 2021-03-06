export const IS_DEV = process.env.ENV === 'LOCAL';

export const GOOGLE_CALLBACK_URL = '';

export const SPOTIFY_BASE_AUTHORIZATION_URL =
    'https://accounts.spotify.com/authorize';
export const SPOTIFY_TOKEN_EXCHANGE = 'https://accounts.spotify.com/api/token';
export const SPOTIFY_WEB_API_BASE_URL = 'https://api.spotify.com';
export enum TOKEN_TYPE {
  AUTH_CODE,
  ACCESS_TOKEN,
  REFRESH_TOKEN
}

const domain =
    IS_DEV ? 'http://localhost:5000' : 'https://spotify-assist.herokuapp.com';

export function generateUrl(route: string) {
  return `${domain}${route}`;
}