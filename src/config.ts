/*
 *  Collect all constants that access import.meta.env so it's easier to mock them
 */

export const IS_PROD = import.meta.env.NODE_ENV === "production";
export const PUBLIC_URL = IS_PROD ? "/static/react" : import.meta.env.PUBLIC_URL;
export const SERVER_URL = IS_PROD ? "" : import.meta.env.VITE_API_SERVER;
export const TIME_ZONE = import.meta.env.TIME_ZONE;
export const MIN_ACCOUNT_AGE_TO_TRUST = import.meta.env.MIN_ACCOUNT_AGE_TO_TRUST;

export const VITE_API_SERVER = import.meta.env.VITE_API_SERVER;
export const VITE_API_KEY = import.meta.env.VITE_API_KEY;