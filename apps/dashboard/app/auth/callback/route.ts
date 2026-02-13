import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user has an org (completed onboarding)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: memberships } = await supabase
          .from("members")
          .select("id")
          .eq("user_id", user.id)
          .limit(1);

        // New user with no org → onboarding
        if (!memberships || memberships.length === 0) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }

      // Existing user → dashboard (or wherever `next` points)
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error — redirect to login
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
