import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  // Allow the login page through — it must not be behind the auth check
  if (req.nextUrl.pathname === "/admin/login") return;

  if (!req.auth) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
