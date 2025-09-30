import { routing } from '@/i18n/routing';
import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  // Clone the URL from NextRequest
  const url = request.nextUrl;

  response.headers.set('x-pathname', url.pathname);
  response.headers.set('x-search-params', url.search);

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
