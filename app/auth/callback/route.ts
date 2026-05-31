import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Supabase forwards provider-level errors as query params
  if (error) {
    console.error("Auth provider error:", error, errorDescription);
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(errorDescription ?? error)}`, origin)
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL("/auth?error=missing_code", origin));
  }

  const supabase = await createClient();
  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error("Code exchange failed:", exchangeError.message);
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(exchangeError.message)}`, origin)
    );
  }

  // First-time sign-in: redirect to onboarding instead of dashboard
  const isNewUser =
    data.user?.created_at &&
    new Date(data.user.created_at).getTime() > Date.now() - 10_000;

  if (isNewUser) {
    return NextResponse.redirect(new URL("/onboarding", origin));
  }

  return NextResponse.redirect(new URL(next, origin));
}
