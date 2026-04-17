import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase";
import { createSession, setSessionCookie } from "@/lib/session";
import { generateUniqueSlug } from "@/lib/slug";

export async function POST(req: NextRequest) {
  try {
    const { email, token, restaurantName, ownerName, password } = await req.json();
    if (!email || !token) {
      return NextResponse.json({ error: "Email and OTP required" }, { status: 400 });
    }

    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error: verifyError } = await anonClient.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (verifyError) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
    }

    const supabase = createServiceClient();
    const bcrypt = await import("bcryptjs");

    // Generate a unique slug from the restaurant name at signup — never changes after this
    const slug = await generateUniqueSlug(supabase, restaurantName.trim());

    const { data: restaurant, error: restError } = await supabase
      .from("restaurants")
      .insert({
        name: restaurantName.trim(),
        owner_name: ownerName.trim(),
        email: email.toLowerCase().trim(),
        slug,
      })
      .select()
      .single();

    if (restError || !restaurant) {
      return NextResponse.json({ error: "Failed to create restaurant" }, { status: 500 });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        restaurant_id: restaurant.id,
        name: ownerName.trim(),
        email: email.toLowerCase().trim(),
        password_hash,
        role: "admin",
      })
      .select()
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    const sessionToken = await createSession({
      userId: user.id,
      restaurantId: restaurant.id,
      role: "admin",
      name: user.name,
      email: user.email,
      restaurantName: restaurant.name,
    });

    await setSessionCookie(sessionToken);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        slug: restaurant.slug,
      },
    });
  } catch (err) {
    console.error("OTP verify error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
