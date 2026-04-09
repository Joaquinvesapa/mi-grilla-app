import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { classifyRoute } from "@/middleware-utils";

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

  // Route classification — /demo routes are public (no auth required)
  const { isPublic, isOnboarding, isAdmin } = classifyRoute(pathname);

  // ── No session + public non-demo routes → redirect to demo ──
  // /login and /auth/* are public but should also go to demo for visitors
  if (!user && isPublic && !pathname.startsWith("/demo")) {
    return NextResponse.redirect(new URL("/demo", request.url));
  }

  // ── No session + protected routes → redirect to demo ──
  if (!user && !isPublic) {
    // Routes with a demo equivalent keep their path
    const DEMO_ROUTES = ["/grilla", "/agenda", "/social", "/perfil"];
    const demoMatch = DEMO_ROUTES.find(
      (route) => pathname === route || pathname.startsWith(route + "/"),
    );
    if (demoMatch) {
      return NextResponse.redirect(new URL(`/demo${pathname}`, request.url));
    }
    // Everything else (/, /admin, /home, etc.) → demo landing
    return NextResponse.redirect(new URL("/demo", request.url));
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
      .select("id, is_public, is_admin")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    // ── Admin gate → only is_admin = true can access /admin ──
    if (isAdmin && !profile.is_admin) {
      return NextResponse.redirect(new URL("/grilla", request.url));
    }

    // ── Community opt-out → block /social routes ──
    if (!profile.is_public && pathname.startsWith("/social")) {
      return NextResponse.redirect(new URL("/grilla", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|sw\\.js\\.map|swe-worker-.*\\.js|manifest\\.webmanifest|~offline|icons/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
