import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// GET /api/menu?restaurantId=xxx
export async function GET(req: NextRequest) {
  try {
    const restaurantId = req.nextUrl.searchParams.get("restaurantId");
    if (!restaurantId) {
      return NextResponse.json({ error: "restaurantId required" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("category")
      .order("name");

    if (error) throw error;
    return NextResponse.json({ items: data ?? [] });
  } catch (err) {
    console.error("GET /api/menu error:", err);
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
}

// POST /api/menu — create item
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { restaurantId, name, category, price, tax, description, image, available, variants } = body;
    if (!restaurantId || !name || !category || price == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        restaurant_id: restaurantId,
        name: name.trim(),
        category: category.trim(),
        price: Number(price),
        tax: Number(tax ?? 0),
        description: description?.trim() ?? "",
        image: image ?? "🍽️",
        available: available ?? true,
        variants: variants ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ item: data });
  } catch (err) {
    console.error("POST /api/menu error:", err);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}

// PUT /api/menu — update item
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("menu_items")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ item: data });
  } catch (err) {
    console.error("PUT /api/menu error:", err);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

// DELETE /api/menu?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const supabase = createServiceClient();
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/menu error:", err);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
