import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/security";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next") ?? "/grilla");

  if (!code) {
    return NextResponse.redirect(new URL("/auth/error", origin));
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/auth/error", origin));
  }

  // Check if the user already has a profile row
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    // No profile yet → onboarding to pick username
    if (!profile) {
      return NextResponse.redirect(new URL("/onboarding", origin));
    }
  }

  return NextResponse.redirect(new URL(next, origin));
}
