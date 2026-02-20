import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public routes that don't require a session
  const isPublic =
    pathname === "/login" ||
    pathname.startsWith("/auth");

  // Onboarding is accessible only WITH a session (but without profile)
  const isOnboarding = pathname === "/onboarding";

  // ── No session → login (except public routes) ──
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ── Has session → prevent going back to login or root ──
  if (user && (pathname === "/login" || pathname === "/")) {
    return NextResponse.redirect(new URL("/grilla", request.url));
  }

  // ── Has session + app route → check if profile exists ──
  // Skip this check for onboarding and public routes to avoid infinite redirects
  if (user && !isPublic && !isOnboarding) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
