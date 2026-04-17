import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// GET /api/orders?restaurantId=xxx&from=2024-01-01&to=2024-01-31&limit=50
export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const restaurantId = params.get("restaurantId");
    const from = params.get("from");
    const to = params.get("to");
    const limit = parseInt(params.get("limit") ?? "100");

    if (!restaurantId) {
      return NextResponse.json({ error: "restaurantId required" }, { status: 400 });
    }

    const supabase = createServiceClient();
    let query = supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (from) query = query.gte("created_at", from);
    if (to)   query = query.lte("created_at", to + "T23:59:59");

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ orders: data ?? [] });
  } catch (err) {
    console.error("GET /api/orders error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// POST /api/orders — create order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { restaurantId, items, subtotal, tax, discount, total, paymentMethod, cashierName } = body;

    if (!restaurantId || !items?.length || total == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Generate order number: ORD-YYYYMMDD-XXXX
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
    const { count } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId);
    const orderNumber = `ORD-${datePart}-${String((count ?? 0) + 1).padStart(4, "0")}`;

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        restaurant_id: restaurantId,
        order_number: orderNumber,
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        total: Math.round(total * 100) / 100,
        payment_method: paymentMethod ?? "Cash",
        status: "completed",
        cashier_name: cashierName ?? "Cashier",
      })
      .select()
      .single();

    if (orderError || !order) throw orderError ?? new Error("Order insert returned no data");

    // Insert order items
    // Validate UUID format — local mock items have non-UUID ids, store as null if invalid
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const orderItems = items.map((item: {
      id: string; name: string; category: string;
      price: number; tax: number; qty: number; image: string;
    }) => ({
      order_id: order.id,
      menu_item_id: uuidRegex.test(item.id) ? item.id : null,
      name: item.name,
      category: item.category,
      price: item.price,
      tax: item.tax,
      qty: item.qty,
      image: item.image,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) throw itemsError;

    return NextResponse.json({ order: { ...order, order_items: orderItems } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("POST /api/orders error:", msg, err);
    return NextResponse.json({ error: "Failed to create order", detail: msg }, { status: 500 });
  }
}
