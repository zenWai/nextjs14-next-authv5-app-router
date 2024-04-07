import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

import { apiAuthPrefix, authRoutes, DEFAULT_LOGIN_REDIRECT, publicRoutes } from '@/routes';
import authConfig from '@/auth.config';

const { auth } = NextAuth(authConfig);

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.cachedFixedWindow(20, '10 s'),
});

export default auth(async (req) => {
  const { nextUrl } = req;
  const ip = req.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return new NextResponse('You are being rate limited due to too many requests. Try again later!', { status: 429 });
  }

  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = apiAuthPrefix.includes(nextUrl.pathname);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    if (isAuthRoute && isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }

    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('request-ip', ip);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;

    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
  }

  return NextResponse.next();
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)', '/api/admin'],
};
