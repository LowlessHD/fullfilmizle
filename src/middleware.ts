import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;
  const userRole = req.auth?.user?.role;

  const isProfileRoute = nextUrl.pathname.startsWith("/profil");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");

  // Profil sayfasına giriş yapmadan girmeye çalışanları giriş sayfasına yönlendir
  if (isProfileRoute && !isLoggedIn) {
    const redirectUrl = new URL("/giris", nextUrl.origin);
    redirectUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Admin sayfasına yetkisiz erişimi engelle
  if (isAdminRoute) {
    if (!isLoggedIn) {
      const redirectUrl = new URL("/giris", nextUrl.origin);
      redirectUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (userRole !== "ADMIN") {
      // Yetkisiz kullanıcıları ana sayfaya yönlendir
      return NextResponse.redirect(new URL("/", nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/profil/:path*", "/admin/:path*"],
};
