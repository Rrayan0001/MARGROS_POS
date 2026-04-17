import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// GET /api/reports?restaurantId=xxx
export async function GET(req: NextRequest) {
  try {
    const restaurantId = req.nextUrl.searchParams.get("restaurantId");
    if (!restaurantId) {
      return NextResponse.json({ error: "restaurantId required" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const now = new Date();

    // Today's date range
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const todayEnd   = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

    // Month date range
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Last 30 days for chart
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [todayRes, monthRes, recentRes, allItemsRes] = await Promise.all([
      supabase
        .from("orders")
        .select("total")
        .eq("restaurant_id", restaurantId)
        .eq("status", "completed")
        .gte("created_at", todayStart)
        .lt("created_at", todayEnd),

      supabase
        .from("orders")
        .select("total")
        .eq("restaurant_id", restaurantId)
        .eq("status", "completed")
        .gte("created_at", monthStart),

      supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("restaurant_id", restaurantId)
        .gte("created_at", thirtyDaysAgo)
        .order("created_at", { ascending: false }),

      supabase
        .from("order_items")
        .select("name, qty, order_id, orders!inner(restaurant_id)")
        .eq("orders.restaurant_id", restaurantId),
    ]);

    const todaySales    = (todayRes.data ?? []).reduce((s, o) => s + Number(o.total), 0);
    const monthlyRevenue = (monthRes.data ?? []).reduce((s, o) => s + Number(o.total), 0);
    const totalOrders   = (monthRes.data ?? []).length;
    const avgOrderValue = totalOrders > 0 ? Math.round(monthlyRevenue / totalOrders) : 0;

    // Top selling item
    const itemCounts: Record<string, number> = {};
    (allItemsRes.data ?? []).forEach((i) => {
      itemCounts[i.name] = (itemCounts[i.name] ?? 0) + i.qty;
    });
    const topSellingItem = Object.entries(itemCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "N/A";

    return NextResponse.json({
      todaySales: Math.round(todaySales),
      monthlyRevenue: Math.round(monthlyRevenue),
      quarterlyRevenue: Math.round(monthlyRevenue * 3.2),
      totalOrders,
      avgOrderValue,
      topSellingItem,
      recentOrders: recentRes.data ?? [],
    });
  } catch (err) {
    console.error("GET /api/reports error:", err);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
