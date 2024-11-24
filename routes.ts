/**
 * These routes are public and don't need authentication
 * @type {string[]}
 * */
export const publicRoutes = ['/new-verification'];

/**
 * These routes are used for authentication,
 * redirect logged-in users to /settings
 * @type {string[]}
 * */
export const authRoutes = [
  '/',
  '/login',
  '/register',
  '/loginerror',
  '/reset-password',
  '/new-password',
  '/login/magic-link',
];

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for api
 * authentication purposes
 * @type {string}
 * */
export const apiAuthPrefix = '/api/auth';

/**
 * Default redirect path for logged-in users
 * @type {string}
 * */
export const DEFAULT_LOGIN_REDIRECT = '/settings';

/**
 * Default Allowed Redirects from callbackUrl searchParams
 * @type {string}
 * */
export const ALLOWED_REDIRECTS = ['/server', '/admin', '/client', '/settings'];
