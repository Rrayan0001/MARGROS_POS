"use client";

import React, { useState, useMemo } from "react";
import AppShell from "@/components/AppShell";
import { AuthProvider } from "@/context/AuthContext";
import { MenuProvider } from "@/context/MenuContext";
import { OrderProvider, useOrders } from "@/context/OrderContext";
import { ToastProvider } from "@/components/Toast";
import { DownloadSimple, ChartLine, ChartBar, ChartPieSlice, Trophy, Clock } from "@phosphor-icons/react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

type Period = "daily" | "weekly" | "monthly" | "quarterly";

function ReportsContent() {
  const { orders, monthlyRevenue } = useOrders();
  const [period, setPeriod] = useState<Period>("weekly");

  const { labels, revenueData, orderData } = useMemo(() => {
    const today = new Date();
    if (period === "daily") {
      const hours = Array.from({ length: 12 }, (_, i) => {
        const h = new Date(today); h.setHours(h.getHours() - (11 - i));
        return h.getHours().toString().padStart(2, "0") + ":00";
      });
      return {
        labels: hours,
        revenueData: hours.map((label) => {
          const hr = parseInt(label);
          return orders.filter((o) => { const d = new Date(o.createdAt); return d.toDateString() === today.toDateString() && d.getHours() === hr; }).reduce((s, o) => s + o.total, 0);
        }),
        orderData: hours.map((label) => {
          const hr = parseInt(label);
          return orders.filter((o) => { const d = new Date(o.createdAt); return d.toDateString() === today.toDateString() && d.getHours() === hr; }).length;
        }),
      };
    }
    if (period === "weekly") {
      const days: string[] = [];
      for (let i = 6; i >= 0; i--) { const d = new Date(today); d.setDate(d.getDate() - i); days.push(d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })); }
      return {
        labels: days,
        revenueData: days.map((day) => orders.filter((o) => new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) === day).reduce((s, o) => s + o.total, 0)),
        orderData: days.map((day) => orders.filter((o) => new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) === day).length),
      };
    }
    if (period === "monthly") {
      const days: string[] = [];
      for (let i = 29; i >= 0; i--) { const d = new Date(today); d.setDate(d.getDate() - i); days.push(d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })); }
      return {
        labels: days.filter((_, i) => i % 3 === 0),
        revenueData: days.filter((_, i) => i % 3 === 0).map((day) => orders.filter((o) => new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) === day).reduce((s, o) => s + o.total, 0)),
        orderData: days.filter((_, i) => i % 3 === 0).map((day) => orders.filter((o) => new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) === day).length),
      };
    }
    const weeks = Array.from({ length: 12 }, (_, i) => { const start = new Date(today); start.setDate(start.getDate() - (11 - i) * 7); return start.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }); });
    return {
      labels: weeks.map((_, i) => `W${i + 1}`),
      revenueData: weeks.map((_, i) => { const ws = new Date(today); ws.setDate(ws.getDate() - (11 - i) * 7); const we = new Date(ws); we.setDate(we.getDate() + 7); return orders.filter((o) => { const d = new Date(o.createdAt); return d >= ws && d < we; }).reduce((s, o) => s + o.total, 0); }),
      orderData: weeks.map((_, i) => { const ws = new Date(today); ws.setDate(ws.getDate() - (11 - i) * 7); const we = new Date(ws); we.setDate(we.getDate() + 7); return orders.filter((o) => { const d = new Date(o.createdAt); return d >= ws && d < we; }).length; }),
    };
  }, [period, orders]);

  const paymentCounts = useMemo(() => { const c: Record<string, number> = {}; orders.slice(0, 500).forEach((o) => { c[o.payment] = (c[o.payment] || 0) + o.total; }); return c; }, [orders]);
  const bestSellers = useMemo(() => { const counts: Record<string, number> = {}; orders.slice(0, 300).forEach((o) => o.items.forEach((i) => { counts[i.name] = (counts[i.name] || 0) + i.qty; })); return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 8); }, [orders]);
  const peakHours = useMemo(() => { const h: Record<string, number> = {}; for (let i = 8; i <= 22; i++) h[`${i}:00`] = 0; orders.slice(0, 200).forEach((o) => { const hr = new Date(o.createdAt).getHours(); h[`${hr}:00`] = (h[`${hr}:00`] || 0) + 1; }); return h; }, [orders]);

  const totalRevenue = revenueData.reduce((a, b) => a + b, 0);
  const totalOrders = orderData.reduce((a, b) => a + b, 0);
  const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const chartOpts = {
    responsive: true, maintainAspectRatio: true,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: "#0a0a0a", titleColor: "#fafafa", bodyColor: "#8a8a8a", cornerRadius: 4, padding: 10 } },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#737373", font: { size: 10 } }, border: { display: false } },
      y: { grid: { color: "#eeeeee" }, ticks: { color: "#737373", font: { size: 10 }, callback: (v: unknown) => `₹${Number(v).toLocaleString("en-IN")}` }, border: { display: false } },
    },
  };

  const kpis = [
    { idx: "01", label: "Period Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}` },
    { idx: "02", label: "Orders", value: totalOrders.toString() },
    { idx: "03", label: "Avg Order", value: `₹${avgOrder}` },
    { idx: "04", label: "Monthly Total", value: `₹${monthlyRevenue.toLocaleString("en-IN")}` },
  ];

  const periodLabels: Record<Period, string> = { daily: "24H", weekly: "7D", monthly: "30D", quarterly: "QTR" };

  return (
    <AppShell title="Reports." subtitle="Data-driven insights for your business">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div className="seg">
          {(["daily", "weekly", "monthly", "quarterly"] as Period[]).map((p) => (
            <button key={p} className={period === p ? "active" : ""} onClick={() => setPeriod(p)}>{periodLabels[p]}</button>
          ))}
        </div>
        <button className="btn btn-outline btn-sm" style={{ gap: 6 }}><DownloadSimple size={13} /> Export</button>
      </div>

      <div className="kpi-grid stagger" style={{ marginBottom: 28 }}>
        {kpis.map((k) => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-label"><span className="idx mono">{k.idx}</span>{k.label}</div>
            <div className="kpi-value">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><ChartLine size={14} weight="fill" /><p className="chart-title">Revenue Trend</p></div>
          <p className="chart-subtitle">{period.charAt(0).toUpperCase() + period.slice(1)} breakdown</p>
          <Line data={{ labels, datasets: [{ data: revenueData, borderColor: "#0a0a0a", backgroundColor: "transparent", borderWidth: 1.5, pointRadius: labels.length <= 12 ? 3 : 0, pointBackgroundColor: "#0a0a0a", fill: false, tension: 0.3 }] }} options={chartOpts} />
        </div>
        <div className="chart-card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><ChartBar size={14} weight="fill" /><p className="chart-title">Order Volume</p></div>
          <p className="chart-subtitle">Number of orders per period</p>
          <Bar data={{ labels, datasets: [{ label: "Orders", data: orderData, backgroundColor: "#e5e5e5", borderColor: "#d5d5d5", borderWidth: 1, borderRadius: 2, borderSkipped: false }] }} options={{ ...chartOpts, scales: { x: { ...chartOpts.scales.x }, y: { ...chartOpts.scales.y, ticks: { ...chartOpts.scales.y.ticks, callback: (v: unknown) => String(v) } } } }} />
        </div>
      </div>

      <div className="chart-grid" style={{ marginTop: 20 }}>
        <div className="chart-card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><Trophy size={14} weight="fill" /><p className="chart-title">Best Sellers</p></div>
          <p className="chart-subtitle">Top items by quantity sold</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {bestSellers.map(([name, qty], i) => {
              const pct = Math.round((qty / bestSellers[0][1]) * 100);
              return (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="mono" style={{ width: 22, textAlign: "center", fontSize: 11, color: i < 3 ? "var(--ink)" : "var(--muted)", fontWeight: i < 3 ? 700 : 400 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{name}</span>
                      <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>{qty} sold</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="chart-card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><ChartPieSlice size={14} weight="fill" /><p className="chart-title">Revenue by Payment</p></div>
          <p className="chart-subtitle">Payment method breakdown</p>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div style={{ maxWidth: 140, flex: 1, minWidth: 100 }}>
              <Doughnut
                data={{ labels: Object.keys(paymentCounts), datasets: [{ data: Object.values(paymentCounts), backgroundColor: ["#0a0a0a", "#404040", "#808080", "#c0c0c0"], borderWidth: 0, hoverOffset: 4 }] }}
                options={{ plugins: { legend: { display: false }, tooltip: { backgroundColor: "#0a0a0a", titleColor: "#fafafa", bodyColor: "#8a8a8a" } }, cutout: "68%" }}
              />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              {Object.entries(paymentCounts).map(([method, rev], i) => {
                const total = Object.values(paymentCounts).reduce((a, b) => a + b, 0);
                const grays = ["#0a0a0a", "#404040", "#808080", "#c0c0c0"];
                return (
                  <div key={method}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: grays[i] }} />
                      <span style={{ fontSize: 12, flex: 1, color: "var(--muted)" }}>{method}</span>
                      <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>₹{Math.round(rev).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.round((rev / total) * 100)}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="card card-padded" style={{ animation: "fadeUp 0.5s ease both", animationDelay: "400ms", marginTop: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><Clock size={14} weight="fill" /><p className="chart-title">Peak Order Hours</p></div>
        <p className="chart-subtitle" style={{ marginBottom: 24 }}>When your restaurant is busiest</p>
        <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 80 }}>
          {Object.entries(peakHours).map(([hour, count]) => {
            const max = Math.max(...Object.values(peakHours));
            const pct = max > 0 ? (count / max) * 100 : 0;
            return (
              <div key={hour} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: "100%", height: `${pct}%`, minHeight: 2, background: pct > 70 ? "var(--ink)" : "var(--line)", borderRadius: "2px 2px 0 0", transition: "height 0.5s ease" }} />
                <span style={{ fontSize: 8, color: "var(--muted)", whiteSpace: "nowrap", transform: "rotate(-45deg)", transformOrigin: "center", marginTop: 2 }}>{hour}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ marginTop: 24, animation: "fadeUp 0.5s ease both", animationDelay: "500ms" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600 }}>Transaction Log</p>
            <p className="eyebrow" style={{ marginTop: 2 }}>Recent {Math.min(15, orders.length)} orders</p>
          </div>
          <button className="btn btn-outline btn-sm" style={{ gap: 5 }}><DownloadSimple size={13} /> Export CSV</button>
        </div>
        <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
          <table className="tbl">
            <thead><tr><th>Order ID</th><th>Date</th><th>Time</th><th>Items</th><th>Subtotal</th><th>Tax</th><th>Total</th><th>Payment</th><th>Cashier</th></tr></thead>
            <tbody>
              {orders.slice(0, 15).map((o) => (
                <tr key={o.id}>
                  <td className="mono" style={{ fontWeight: 600 }}>{o.orderNumber}</td>
                  <td style={{ fontSize: 12, color: "var(--muted)" }}>{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={11} color="var(--muted)" />
                    <span className="mono" style={{ fontSize: 11 }}>{new Date(o.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                  </td>
                  <td className="mono">{o.items.length}</td>
                  <td className="mono">₹{o.subtotal.toLocaleString("en-IN")}</td>
                  <td className="mono" style={{ color: "var(--muted)" }}>₹{o.tax.toLocaleString("en-IN")}</td>
                  <td className="mono" style={{ fontWeight: 600 }}>₹{o.total.toLocaleString("en-IN")}</td>
                  <td><span className="badge">{o.payment}</span></td>
                  <td style={{ fontSize: 11, color: "var(--muted)" }}>{o.cashierName}</td>
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
    <AuthProvider><MenuProvider><OrderProvider><ToastProvider><ReportsContent /></ToastProvider></OrderProvider></MenuProvider></AuthProvider>
  );
}
