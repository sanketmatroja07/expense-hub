import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const publicPaths = ["/auth"];

export default withAuth(
  function middleware(request) {
    const pathname = request.nextUrl.pathname;
    const isPublicPath = publicPaths.some(
      (publicPath) => pathname === publicPath || pathname.startsWith(`${publicPath}/`)
    );

    if (isPublicPath && request.nextauth.token) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/auth",
    },
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        return publicPaths.some(
          (publicPath) =>
            pathname === publicPath || pathname.startsWith(`${publicPath}/`)
        )
          ? true
          : Boolean(token);
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
