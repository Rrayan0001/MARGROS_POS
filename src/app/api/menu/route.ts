import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

function getRestaurantId(req: NextRequest): string | null {
  return req.headers.get("x-restaurant-id");
}

export async function GET(req: NextRequest) {
  try {
    const restaurantId = getRestaurantId(req);
    if (!restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

export async function POST(req: NextRequest) {
  try {
    const restaurantId = getRestaurantId(req);
    if (!restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, category, price, tax, description, image, available, variants } = body;
    if (!name || !category || price == null) {
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

export async function PUT(req: NextRequest) {
  try {
    const restaurantId = getRestaurantId(req);
    if (!restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    // Prevent callers from overriding the tenant
    delete updates.restaurant_id;

    const supabase = createServiceClient();

    // Scoped update — only modifies if item belongs to this restaurant
    const { data, error } = await supabase
      .from("menu_items")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("restaurant_id", restaurantId)
      .select()
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    return NextResponse.json({ item: data });
  } catch (err) {
    console.error("PUT /api/menu error:", err);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const restaurantId = getRestaurantId(req);
    if (!restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const supabase = createServiceClient();

    // Scoped delete — only deletes if item belongs to this restaurant
    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", id)
      .eq("restaurant_id", restaurantId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/menu error:", err);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
