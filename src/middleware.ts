import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth (
  function middleware(req) {
    const requestRole = req.nextauth.token?.role;
    const AUTH_ROLES = process.env.NEXTAUTH_ROLES || ["ADMIN", "CLIENT", "RESELLER", "SUPERUSER"]
    if(req.nextUrl.pathname.startsWith("/dashboard") && !AUTH_ROLES.includes(requestRole as string))
    {
      return NextResponse.rewrite(new URL("/login?message=No estas autorizado para ver esta pagina", req.url));
    }
    if(req.nextUrl.pathname.startsWith("/dashboard/users") && !["ADMIN", "RESELLER"].includes(requestRole as string))
      {
        return NextResponse.rewrite(new URL("/dashboard?message=No estas autorizado para ver esta pagina", req.url));
      }
  },
  {
    callbacks: {
      authorized: ({token}) => !!token,
    }
  },
);

export const config = {
  matcher:["/dashboard/:path*"]
}