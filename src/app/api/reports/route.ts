import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

type Period = "daily" | "weekly" | "monthly" | "quarterly";

type OrderItemRow = {
  name: string;
  qty: number;
};

type OrderRow = {
  id: string;
  order_number: string;
  subtotal: number | string;
  tax: number | string;
  discount: number | string;
  total: number | string;
  payment_method: string;
  status: "completed" | "pending" | "cancelled";
  cashier_name: string | null;
  created_at: string;
  order_items: OrderItemRow[] | null;
};

type Bucket = {
  label: string;
  start: Date;
  end: Date;
};

function getPeriod(req: NextRequest): Period {
  const period = req.nextUrl.searchParams.get("period");
  return period === "daily" || period === "weekly" || period === "monthly" || period === "quarterly"
    ? period
    : "weekly";
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function addDays(value: Date, days: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
}

function addHours(value: Date, hours: number) {
  const next = new Date(value);
  next.setHours(next.getHours() + hours);
  return next;
}

function formatDayLabel(value: Date) {
  return value.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function formatHourLabel(value: Date) {
  return value.toLocaleTimeString("en-IN", { hour: "2-digit", hour12: true });
}

function buildBuckets(period: Period, now: Date): Bucket[] {
  if (period === "daily") {
    const currentHour = new Date(now);
    currentHour.setMinutes(0, 0, 0);

    return Array.from({ length: 24 }, (_, index) => {
      const start = addHours(currentHour, index - 23);
      return {
        label: formatHourLabel(start),
        start,
        end: addHours(start, 1),
      };
    });
  }

  if (period === "weekly") {
    const today = startOfDay(now);
    return Array.from({ length: 7 }, (_, index) => {
      const start = addDays(today, index - 6);
      return {
        label: formatDayLabel(start),
        start,
        end: addDays(start, 1),
      };
    });
  }

  if (period === "monthly") {
    const today = startOfDay(now);
    return Array.from({ length: 10 }, (_, index) => {
      const start = addDays(today, index * 3 - 29);
      const end = addDays(start, 3);
      return {
        label: `${formatDayLabel(start)} - ${formatDayLabel(addDays(end, -1))}`,
        start,
        end,
      };
    });
  }

  const currentWeekStart = startOfDay(addDays(now, -now.getDay()));
  return Array.from({ length: 12 }, (_, index) => {
    const start = addDays(currentWeekStart, (index - 11) * 7);
    return {
      label: `W${index + 1}`,
      start,
      end: addDays(start, 7),
    };
  });
}

async function fetchOrdersForRange(restaurantId: string, from: Date, to: Date) {
  const supabase = createServiceClient();
  const pageSize = 1000;
  let fromIndex = 0;
  const orders: OrderRow[] = [];

  while (true) {
    const toIndex = fromIndex + pageSize - 1;
    const { data, error } = await supabase
      .from("orders")
      .select("id, order_number, subtotal, tax, discount, total, payment_method, status, cashier_name, created_at, order_items(name, qty)")
      .eq("restaurant_id", restaurantId)
      .eq("status", "completed")
      .gte("created_at", from.toISOString())
      .lt("created_at", to.toISOString())
      .order("created_at", { ascending: false })
      .range(fromIndex, toIndex);

    if (error) {
      throw error;
    }

    const batch = (data ?? []) as OrderRow[];
    orders.push(...batch);

    if (batch.length < pageSize) {
      break;
    }

    fromIndex += pageSize;
  }

  return orders;
}

function sumOrderTotal(orders: OrderRow[]) {
  return orders.reduce((sum, order) => sum + Number(order.total), 0);
}

function countItems(order: OrderRow) {
  return (order.order_items ?? []).reduce((sum, item) => sum + Number(item.qty ?? 0), 0);
}

export async function GET(req: NextRequest) {
  try {
    const restaurantId = req.headers.get("x-restaurant-id");
    if (!restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const period = getPeriod(req);
    const now = new Date();
    const buckets = buildBuckets(period, now);
    const rangeStart = buckets[0]?.start ?? startOfDay(now);
    const rangeEnd = buckets[buckets.length - 1]?.end ?? addDays(startOfDay(now), 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [periodOrders, monthOrders, todayOrders] = await Promise.all([
      fetchOrdersForRange(restaurantId, rangeStart, rangeEnd),
      fetchOrdersForRange(restaurantId, monthStart, monthEnd),
      fetchOrdersForRange(restaurantId, startOfDay(now), addDays(startOfDay(now), 1)),
    ]);

    const revenueData = buckets.map((bucket) =>
      periodOrders
        .filter((order) => {
          const createdAt = new Date(order.created_at);
          return createdAt >= bucket.start && createdAt < bucket.end;
        })
        .reduce((sum, order) => sum + Number(order.total), 0)
    );

    const orderData = buckets.map((bucket) =>
      periodOrders.filter((order) => {
        const createdAt = new Date(order.created_at);
        return createdAt >= bucket.start && createdAt < bucket.end;
      }).length
    );

    const paymentBreakdown = periodOrders.reduce<Record<string, number>>((acc, order) => {
      const paymentMethod = order.payment_method || "Unknown";
      acc[paymentMethod] = (acc[paymentMethod] ?? 0) + Number(order.total);
      return acc;
    }, {});

    const bestSellerCounts = periodOrders.reduce<Record<string, number>>((acc, order) => {
      for (const item of order.order_items ?? []) {
        acc[item.name] = (acc[item.name] ?? 0) + Number(item.qty ?? 0);
      }
      return acc;
    }, {});

    const peakHours = Array.from({ length: 24 }, (_, hour) => `${hour}:00`).reduce<
      Record<string, number>
    >((acc, hour) => {
      acc[hour] = 0;
      return acc;
    }, {});

    for (const order of periodOrders) {
      const hour = new Date(order.created_at).getHours();
      const key = `${hour}:00`;
      if (key in peakHours) {
        peakHours[key] += 1;
      }
    }

    const totalRevenue = sumOrderTotal(periodOrders);
    const totalOrders = periodOrders.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const monthlyRevenue = sumOrderTotal(monthOrders);
    const todaySales = sumOrderTotal(todayOrders);
    const topSellingItem =
      Object.entries(bestSellerCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "N/A";

    return NextResponse.json({
      period,
      labels: buckets.map((bucket) => bucket.label),
      revenueData: revenueData.map((value) => Math.round(value)),
      orderData,
      totalRevenue: Math.round(totalRevenue),
      totalOrders,
      avgOrderValue,
      todaySales: Math.round(todaySales),
      monthlyRevenue: Math.round(monthlyRevenue),
      quarterlyRevenue:
        period === "quarterly" ? Math.round(totalRevenue) : 0,
      topSellingItem,
      bestSellers: Object.entries(bestSellerCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([name, qty]) => ({ name, qty })),
      paymentBreakdown: Object.entries(paymentBreakdown).map(([method, revenue]) => ({
        method,
        revenue: Math.round(revenue),
      })),
      peakHours,
      transactions: periodOrders.slice(0, 15).map((order) => ({
        id: order.id,
        orderNumber: order.order_number,
        createdAt: order.created_at,
        itemCount: countItems(order),
        subtotal: Number(order.subtotal),
        tax: Number(order.tax),
        total: Number(order.total),
        payment: order.payment_method,
        cashierName: order.cashier_name ?? "",
      })),
    });
  } catch (err) {
    console.error("GET /api/reports error:", err);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
