import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { createSession, setSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: user, error } = await supabase
      .from("users")
      .select("*, restaurants(id, name)")
      .eq("email", email.toLowerCase().trim())
      .eq("status", "active")
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const bcrypt = await import("bcryptjs");
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const restaurantName = (user.restaurants as { name: string } | null)?.name ?? "";

    const token = await createSession({
      userId: user.id,
      restaurantId: user.restaurant_id,
      role: user.role,
      name: user.name,
      email: user.email,
      restaurantName,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurant_id,
        restaurantName,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
