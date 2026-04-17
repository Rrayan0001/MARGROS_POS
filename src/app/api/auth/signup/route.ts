import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { restaurantName, ownerName, email, password } = await req.json();
    if (!restaurantName || !ownerName || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const bcrypt = await import("bcryptjs");

    // Check if email already exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Create restaurant
    const { data: restaurant, error: restError } = await supabase
      .from("restaurants")
      .insert({ name: restaurantName.trim(), owner_name: ownerName.trim(), email: email.toLowerCase().trim() })
      .select()
      .single();

    if (restError || !restaurant) {
      return NextResponse.json({ error: "Failed to create restaurant" }, { status: 500 });
    }

    // Hash password and create admin user
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

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
