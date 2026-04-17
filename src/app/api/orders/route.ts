import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const restaurantId = req.headers.get("x-restaurant-id");
    if (!restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = req.nextUrl.searchParams;
    const from = params.get("from");
    const to = params.get("to");
    const limit = Math.min(parseInt(params.get("limit") ?? "50"), 200);
    const cursor = params.get("cursor"); // created_at timestamp for cursor pagination

    const supabase = createServiceClient();
    let query = supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (from) query = query.gte("created_at", from);
    if (to) query = query.lte("created_at", to + "T23:59:59");
    if (cursor) query = query.lt("created_at", cursor);

    const { data, error } = await query;
    if (error) throw error;

    const orders = data ?? [];
    const nextCursor = orders.length === limit ? orders[orders.length - 1].created_at : null;

    return NextResponse.json({ orders, nextCursor });
  } catch (err) {
    console.error("GET /api/orders error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const restaurantId = req.headers.get("x-restaurant-id");
    const cashierName = req.headers.get("x-user-name") ?? "Cashier";
    if (!restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { items, subtotal, tax, discount, total, paymentMethod } = body;

    if (!items?.length || total == null) {
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
        cashier_name: cashierName,
      })
      .select()
      .single();

    if (orderError || !order) throw orderError ?? new Error("Order insert returned no data");

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
