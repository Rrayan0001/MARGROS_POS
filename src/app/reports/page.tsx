"use client";

import React, { useState, useMemo } from "react";
import AppShell from "@/components/AppShell";
import { AuthProvider } from "@/context/AuthContext";
import { MenuProvider } from "@/context/MenuContext";
import { OrderProvider, useOrders } from "@/context/OrderContext";
import { ToastProvider } from "@/components/Toast";
import {
  TrendUp,
  TrendDown,
  DownloadSimple,
  ChartLine,
  ChartBar,
  ChartPieSlice,
  Trophy,
  Clock,
  CurrencyInr,
  ShoppingCart,
  Calculator,
  CalendarBlank,
} from "@phosphor-icons/react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

type Period = "daily" | "weekly" | "monthly" | "quarterly";

function ReportsContent() {
  const { orders, monthlyRevenue } = useOrders();
  const [period, setPeriod] = useState<Period>("weekly");

  const periodIcons: Record<Period, React.ReactNode> = {
    daily: <Clock size={14} weight="fill" />,
    weekly: <ChartLine size={14} weight="fill" />,
    monthly: <CalendarBlank size={14} weight="fill" />,
    quarterly: <ChartBar size={14} weight="fill" />,
  };

  const { labels, revenueData, orderData } = useMemo(() => {
    const today = new Date();
    if (period === "daily") {
      const hours = Array.from({ length: 12 }, (_, i) => {
        const h = new Date(today);
        h.setHours(h.getHours() - (11 - i));
        return h.getHours().toString().padStart(2, "0") + ":00";
      });
      return {
        labels: hours,
        revenueData: hours.map(() => Math.floor(Math.random() * 4000 + 500)),
        orderData: hours.map(() => Math.floor(Math.random() * 8 + 1)),
      };
    }
    if (period === "weekly") {
      const days: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        days.push(d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }));
      }
      return {
        labels: days,
        revenueData: days.map((day) => orders.filter((o) => new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) === day).reduce((s, o) => s + o.total, 0)),
        orderData: days.map((day) => orders.filter((o) => new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) === day).length),
      };
    }
    if (period === "monthly") {
      const days: string[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        days.push(d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }));
      }
      return {
        labels: days.filter((_, i) => i % 3 === 0),
        revenueData: days.filter((_, i) => i % 3 === 0).map((day) => orders.filter((o) => new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) === day).reduce((s, o) => s + o.total, 0)),
        orderData: days.filter((_, i) => i % 3 === 0).map((day) => orders.filter((o) => new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) === day).length),
      };
    }
    const weeks = Array.from({ length: 12 }, (_, i) => `W${12 - i}`).reverse();
    return {
      labels: weeks,
      revenueData: weeks.map(() => Math.floor(Math.random() * 80000 + 30000)),
      orderData: weeks.map(() => Math.floor(Math.random() * 150 + 50)),
    };
  }, [period, orders]);

  const paymentCounts = useMemo(() => {
    const c: Record<string, number> = {};
    orders.slice(0, 500).forEach((o) => { c[o.payment] = (c[o.payment] || 0) + o.total; });
    return c;
  }, [orders]);

  const bestSellers = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.slice(0, 300).forEach((o) => o.items.forEach((i) => { counts[i.name] = (counts[i.name] || 0) + i.qty; }));
    return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 8);
  }, [orders]);

  const peakHours = useMemo(() => {
    const h: Record<string, number> = {};
    for (let i = 8; i <= 22; i++) h[`${i}:00`] = 0;
    orders.slice(0, 200).forEach((o) => {
      const hr = new Date(o.createdAt).getHours();
      h[`${hr}:00`] = (h[`${hr}:00`] || 0) + 1;
    });
    return h;
  }, [orders]);

  const totalRevenue = revenueData.reduce((a, b) => a + b, 0);
  const totalOrders = orderData.reduce((a, b) => a + b, 0);
  const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const isDark = typeof document !== "undefined" && document.documentElement.getAttribute("data-theme") === "dark";
  const tickColor = isDark ? "#666" : "#999";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  const chartBaseOpts = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: "#0D1117", titleColor: "#fff", bodyColor: "#aaa", borderColor: "rgba(255,255,255,0.1)", borderWidth: 1, cornerRadius: 10, padding: 12 },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: tickColor, font: { size: 10 } }, border: { display: false } },
      y: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 10 }, callback: (v: unknown) => `₹${Number(v).toLocaleString("en-IN")}` }, border: { display: false } },
    },
  };

  const summaryKPIs = [
    { label: "Period Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: <CurrencyInr size={24} weight="fill" />, color: "#F26A21", bg: "linear-gradient(135deg, rgba(242,106,33,0.15), rgba(242,106,33,0.05))", border: "rgba(242,106,33,0.2)", trend: "+8.2%" },
    { label: "Orders", value: totalOrders.toString(), icon: <ShoppingCart size={24} weight="fill" />, color: "#4CAF50", bg: "linear-gradient(135deg, rgba(76,175,80,0.15), rgba(76,175,80,0.05))", border: "rgba(76,175,80,0.2)", trend: "+5.1%" },
    { label: "Avg Order", value: `₹${avgOrder}`, icon: <Calculator size={24} weight="fill" />, color: "#7C3AED", bg: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(124,58,237,0.05))", border: "rgba(124,58,237,0.2)", trend: "+2.3%" },
    { label: "Monthly Total", value: `₹${monthlyRevenue.toLocaleString("en-IN")}`, icon: <CalendarBlank size={24} weight="fill" />, color: "#0891B2", bg: "linear-gradient(135deg, rgba(8,145,178,0.15), rgba(8,145,178,0.05))", border: "rgba(8,145,178,0.2)", trend: "+11%" },
  ];

  return (
    <AppShell title="Reports & Analytics" subtitle="Data-driven insights for your business">
      {/* Period Tabs */}
      <div className="tab-list">
        {(["daily", "weekly", "monthly", "quarterly"] as Period[]).map((p) => (
          <button
            key={p}
            className={`tab-btn ${period === p ? "active" : ""}`}
            onClick={() => setPeriod(p)}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            {periodIcons[p]}
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary KPIs */}
      <div className="kpi-grid stagger" style={{ marginBottom: 24 }}>
        {summaryKPIs.map((k, i) => (
          <div
            key={k.label}
            className="kpi-card"
            style={{ animationDelay: `${i * 60}ms`, background: k.bg, border: `1.5px solid ${k.border}`, boxShadow: "none" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--white)", display: "flex", alignItems: "center", justifyContent: "center", color: k.color, boxShadow: `0 4px 12px ${k.color}25`, border: `1px solid ${k.border}` }}>
                {k.icon}
              </div>
              <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700, color: "var(--secondary)", background: "rgba(76,175,80,0.1)", padding: "3px 8px", borderRadius: 100 }}>
                <TrendUp size={12} weight="bold" /> {k.trend}
              </span>
            </div>
            <div>
              <p className="kpi-label">{k.label}</p>
              <p className="kpi-value" style={{ marginTop: 4, color: k.color }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue & Orders Charts */}
      <div className="chart-grid">
        <div className="chart-card" style={{ animationDelay: "100ms" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--primary-10)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                  <ChartLine size={16} weight="fill" />
                </div>
                <p className="chart-title">Revenue Trend</p>
              </div>
              <p className="chart-subtitle">{period.charAt(0).toUpperCase() + period.slice(1)} breakdown</p>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ fontSize: 12, gap: 5 }}>
              <DownloadSimple size={14} weight="regular" /> Export
            </button>
          </div>
          <Line
            data={{
              labels,
              datasets: [{
                data: revenueData,
                borderColor: "#F26A21",
                backgroundColor: "rgba(242,106,33,0.06)",
                borderWidth: 2.5,
                pointRadius: labels.length <= 12 ? 5 : 2,
                pointBackgroundColor: "#F26A21",
                pointBorderColor: isDark ? "#1C1C1C" : "#ffffff",
                pointBorderWidth: 2,
                fill: true,
                tension: 0.4,
              }],
            }}
            options={chartBaseOpts}
          />
        </div>

        <div className="chart-card" style={{ animationDelay: "200ms" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(76,175,80,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--secondary)" }}>
              <ChartBar size={16} weight="fill" />
            </div>
            <p className="chart-title">Order Volume</p>
          </div>
          <p className="chart-subtitle" style={{ marginBottom: 20 }}>Number of orders per period</p>
          <Bar
            data={{
              labels,
              datasets: [{
                label: "Orders",
                data: orderData,
                backgroundColor: "rgba(76,175,80,0.65)",
                borderRadius: 8,
                borderSkipped: false,
              }],
            }}
            options={{ ...chartBaseOpts, scales: { x: { ...chartBaseOpts.scales.x }, y: { ...chartBaseOpts.scales.y, ticks: { ...chartBaseOpts.scales.y.ticks, callback: (v: unknown) => String(v) } } } }}
          />
        </div>
      </div>

      {/* Best Sellers + Payment */}
      <div className="chart-grid" style={{ marginTop: 20 }}>
        <div className="chart-card" style={{ animationDelay: "300ms" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(217,119,6,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#D97706" }}>
              <Trophy size={16} weight="fill" />
            </div>
            <p className="chart-title">Best Sellers</p>
          </div>
          <p className="chart-subtitle" style={{ marginBottom: 16 }}>Top items by quantity</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {bestSellers.map(([name, qty], i) => {
              const max = bestSellers[0][1];
              const pct = Math.round((qty / max) * 100);
              const colors = ["#F26A21", "#4CAF50", "#7C3AED", "#0891B2", "#D97706", "#1F6B3A", "#A63A1E", "#64748B"];
              return (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 22, textAlign: "center", fontWeight: 800, fontSize: 12, color: i < 3 ? colors[i] : "var(--gray)" }}>#{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{name}</span>
                      <span style={{ fontSize: 12, color: "var(--gray)" }}>{qty} sold</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: colors[i] || "var(--gray-light)" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="chart-card" style={{ animationDelay: "400ms" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7C3AED" }}>
              <ChartPieSlice size={16} weight="fill" />
            </div>
            <p className="chart-title">Revenue by Payment</p>
          </div>
          <p className="chart-subtitle" style={{ marginBottom: 16 }}>Payment method breakdown</p>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div style={{ maxWidth: 160, flex: 1, minWidth: 120 }}>
              <Doughnut
                data={{
                  labels: Object.keys(paymentCounts),
                  datasets: [{
                    data: Object.values(paymentCounts),
                    backgroundColor: ["#F26A21", "#4CAF50", "#7C3AED", "#0891B2"],
                    borderWidth: 0,
                    hoverOffset: 6,
                  }],
                }}
                options={{ plugins: { legend: { display: false }, tooltip: { backgroundColor: "#0D1117", titleColor: "#fff", bodyColor: "#aaa" } }, cutout: "68%" }}
              />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              {Object.entries(paymentCounts).map(([method, rev], i) => {
                const total = Object.values(paymentCounts).reduce((a, b) => a + b, 0);
                const colors = ["#F26A21", "#4CAF50", "#7C3AED", "#0891B2"];
                return (
                  <div key={method}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors[i], boxShadow: `0 0 6px ${colors[i]}60` }} />
                      <span style={{ fontSize: 12, flex: 1, color: "var(--gray)" }}>{method}</span>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>₹{Math.round(rev).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${Math.round((rev / total) * 100)}%`, background: colors[i] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Peak Hours */}
      <div className="card card-padded" style={{ animation: "fadeUp 0.5s ease both", animationDelay: "500ms", marginTop: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(242,106,33,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
            <Clock size={16} weight="fill" />
          </div>
          <p className="chart-title">Peak Order Hours</p>
        </div>
        <p className="chart-subtitle" style={{ marginBottom: 24 }}>When your restaurant is busiest</p>
        <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 80 }}>
          {Object.entries(peakHours).map(([hour, count]) => {
            const max = Math.max(...Object.values(peakHours));
            const pct = max > 0 ? (count / max) * 100 : 0;
            const isHigh = pct > 70;
            const isMed = pct > 40 && !isHigh;
            return (
              <div key={hour} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: "100%", height: `${pct}%`, minHeight: 4, background: isHigh ? "var(--primary)" : isMed ? "rgba(242,106,33,0.4)" : "var(--gray-light)", borderRadius: "3px 3px 0 0", transition: "height 0.5s ease" }} />
                <span style={{ fontSize: 9, color: "var(--gray)", whiteSpace: "nowrap", transform: "rotate(-45deg)", transformOrigin: "center", marginTop: 2 }}>{hour}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 24, justifyContent: "flex-end" }}>
          {[{ label: "Peak", color: "var(--primary)" }, { label: "Medium", color: "rgba(242,106,33,0.4)" }, { label: "Low", color: "var(--gray-light)" }].map((l) => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--gray)" }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} /> {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Transaction Log */}
      <div className="card" style={{ marginTop: 24, animation: "fadeUp 0.5s ease both", animationDelay: "600ms" }}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--gray-lighter)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray)" }}>
              <ChartBar size={16} weight="fill" />
            </div>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700 }}>Transaction Log</h3>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ fontSize: 12, gap: 5 }}>
            <DownloadSimple size={14} weight="regular" /> Export CSV
          </button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order ID</th><th>Date</th><th>Time</th><th>Items</th>
                <th>Subtotal</th><th>Tax</th><th>Total</th><th>Payment</th><th>Cashier</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 15).map((o) => (
                <tr key={o.id}>
                  <td><strong style={{ fontSize: 13, fontFamily: "var(--font-heading)" }}>{o.orderNumber}</strong></td>
                  <td style={{ fontSize: 13, color: "var(--gray)" }}>{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td style={{ fontSize: 13, color: "var(--gray)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={12} weight="regular" /> {new Date(o.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td style={{ fontSize: 13 }}>{o.items.length}</td>
                  <td style={{ fontSize: 13 }}>₹{o.subtotal.toLocaleString("en-IN")}</td>
                  <td style={{ fontSize: 13, color: "var(--gray)" }}>₹{o.tax.toLocaleString("en-IN")}</td>
                  <td><strong style={{ color: "var(--primary)" }}>₹{o.total.toLocaleString("en-IN")}</strong></td>
                  <td><span className="badge badge-gray">{o.payment}</span></td>
                  <td style={{ fontSize: 12, color: "var(--gray)" }}>{o.cashierName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

export default function ReportsPage() {
  return (
    <AuthProvider>
      <MenuProvider>
        <OrderProvider>
          <ToastProvider>
            <ReportsContent />
          </ToastProvider>
        </OrderProvider>
      </MenuProvider>
    </AuthProvider>
  );
}
