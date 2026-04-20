import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const restaurantId = req.headers.get("x-restaurant-id");
    if (!restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("restaurants")
      .select("id, name, owner_name, email, phone, address, gst_number, logo_url")
      .eq("id", restaurantId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    return NextResponse.json({ restaurant: data });
  } catch (err) {
    console.error("GET /api/settings/profile error:", err);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const restaurantId = req.headers.get("x-restaurant-id");
    if (!restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, owner_name, phone, address, gst_number } = body;

    const updates: Record<string, string> = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (owner_name !== undefined) updates.owner_name = String(owner_name).trim();
    if (phone !== undefined) updates.phone = String(phone).trim();
    if (address !== undefined) updates.address = String(address).trim();
    if (gst_number !== undefined) updates.gst_number = String(gst_number).trim();

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("restaurants")
      .update(updates)
      .eq("id", restaurantId)
      .select("id, name, owner_name, email, phone, address, gst_number, logo_url")
      .single();

    if (error) throw error;
    return NextResponse.json({ restaurant: data });
  } catch (err) {
    console.error("PATCH /api/settings/profile error:", err);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
