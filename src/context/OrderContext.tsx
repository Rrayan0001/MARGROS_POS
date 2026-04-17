"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";

export interface OrderItem {
  id: string;
  name: string;
  category: string;
  price: number;
  tax: number;
  qty: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment: string;
  status: "completed" | "pending" | "cancelled";
  cashierName: string;
  createdAt: string;
}

interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  todaySales: number;
  monthlyRevenue: number;
  quarterlyRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  topSellingItem: string;
  addOrder: (order: {
    items: OrderItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    paymentMethod: string;
  }) => Promise<Order>;
  refresh: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    todaySales: 0,
    monthlyRevenue: 0,
    quarterlyRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    topSellingItem: "N/A",
  });

  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      // No restaurantId in URL — middleware injects it from the session cookie
      const res = await fetch("/api/reports");
      if (!res.ok) return;
      const data = await res.json();
      setStats({
        todaySales:       data.todaySales       ?? 0,
        monthlyRevenue:   data.monthlyRevenue   ?? 0,
        quarterlyRevenue: data.quarterlyRevenue ?? 0,
        totalOrders:      data.totalOrders      ?? 0,
        avgOrderValue:    data.avgOrderValue    ?? 0,
        topSellingItem:   data.topSellingItem   ?? "N/A",
      });
    } catch (err) {
      console.error("OrderContext stats error:", err);
    }
  }, [user]);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/orders?limit=50");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const { orders: data } = await res.json();
      setOrders(data.map((o: Record<string, unknown>) => ({
        id:          String(o.id),
        orderNumber: String(o.order_number),
        items:       (o.order_items as OrderItem[]) ?? [],
        subtotal:    Number(o.subtotal),
        tax:         Number(o.tax),
        discount:    Number(o.discount),
        total:       Number(o.total),
        payment:     String(o.payment_method),
        status:      (o.status as Order["status"]) ?? "completed",
        cashierName: String(o.cashier_name ?? ""),
        createdAt:   String(o.created_at),
      })));
    } catch (err) {
      console.error("OrderContext fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [fetchOrders, fetchStats]);

  const addOrder = useCallback(async (orderData: {
    items: OrderItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    paymentMethod: string;
  }): Promise<Order> => {
    if (!user) throw new Error("Not authenticated");

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // cashierName and restaurantId come from the server-side session now
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error("Failed to create order");
    const { order: raw } = await res.json();

    const order: Order = {
      id:          raw.id,
      orderNumber: raw.order_number,
      items:       orderData.items,
      subtotal:    orderData.subtotal,
      tax:         orderData.tax,
      discount:    orderData.discount,
      total:       orderData.total,
      payment:     orderData.paymentMethod,
      status:      "completed",
      cashierName: user.name,
      createdAt:   raw.created_at,
    };

    setOrders((prev) => [order, ...prev]);
    fetchStats();
    return order;
  }, [user, fetchStats]);

  return (
    <OrderContext.Provider value={{
      orders,
      isLoading,
      ...stats,
      addOrder,
      refresh: async () => { await fetchOrders(); await fetchStats(); },
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
}
