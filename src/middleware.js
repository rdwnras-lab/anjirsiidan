import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => token?.role === 'admin',
    },
    pages: {
      signIn: '/admin/login',
    },
  }
);

// Protect ALL /admin/* EXCEPT /admin/login
export const config = {
  matcher: ['/admin/((?!login$).*)'],
};
