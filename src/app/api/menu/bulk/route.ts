import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const restaurantId = req.headers.get("x-restaurant-id");
    if (!restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items array required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    const rows = items.map((item: {
      name: string; category: string; price: number; tax?: number;
      description?: string; image?: string; available?: boolean; variants?: unknown;
    }) => ({
      restaurant_id: restaurantId,
      name: String(item.name).trim(),
      category: String(item.category).trim(),
      price: Number(item.price),
      tax: Number(item.tax ?? 0),
      description: item.description?.trim() ?? "",
      image: item.image ?? "🍽️",
      available: item.available ?? true,
      variants: item.variants ?? null,
    }));

    const { data, error } = await supabase
      .from("menu_items")
      .insert(rows)
      .select();

    if (error) throw error;
    return NextResponse.json({ items: data ?? [] });
  } catch (err) {
    console.error("POST /api/menu/bulk error:", err);
    return NextResponse.json({ error: "Failed to bulk insert items" }, { status: 500 });
  }
}
