"use client";

import React, { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider, useToast } from "@/components/Toast";
import {
  DownloadSimple,
  ChartLine,
  ChartBar,
  ChartPieSlice,
  Trophy,
  Clock,
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type Period = "daily" | "weekly" | "monthly" | "quarterly";

type BestSeller = {
  name: string;
  qty: number;
};

type PaymentBreakdown = {
  method: string;
  revenue: number;
};

type Transaction = {
  id: string;
  orderNumber: string;
  createdAt: string;
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
  payment: string;
  cashierName: string;
};

type ReportPayload = {
  period: Period;
  labels: string[];
  revenueData: number[];
  orderData: number[];
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  monthlyRevenue: number;
  bestSellers: BestSeller[];
  paymentBreakdown: PaymentBreakdown[];
  peakHours: Record<string, number>;
  transactions: Transaction[];
};

const EMPTY_REPORT: ReportPayload = {
  period: "weekly",
  labels: [],
  revenueData: [],
  orderData: [],
  totalRevenue: 0,
  totalOrders: 0,
  avgOrderValue: 0,
  monthlyRevenue: 0,
  bestSellers: [],
  paymentBreakdown: [],
  peakHours: {},
  transactions: [],
};

function ReportsContent() {
  const { toast } = useToast();
  const [period, setPeriod] = useState<Period>("weekly");
  const [report, setReport] = useState<ReportPayload>(EMPTY_REPORT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchReport() {
      setLoading(true);
      try {
        const res = await fetch(`/api/reports?period=${period}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to load reports");
        }

        const data = (await res.json()) as ReportPayload;
        if (!cancelled) {
          setReport(data);
        }
      } catch (error) {
        if (!cancelled) {
          toast("Failed to load report metrics", "error");
          console.error("Reports fetch error:", error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchReport();

    return () => {
      cancelled = true;
    };
  }, [period, toast]);

  const paymentTotal = useMemo(
    () => report.paymentBreakdown.reduce((sum, item) => sum + item.revenue, 0),
    [report.paymentBreakdown]
  );

  const peakHourMax = useMemo(
    () => Math.max(0, ...Object.values(report.peakHours)),
    [report.peakHours]
  );

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0a0a0a",
        titleColor: "#fafafa",
        bodyColor: "#8a8a8a",
        cornerRadius: 4,
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#737373", font: { size: 10 } },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#eeeeee" },
        ticks: {
          color: "#737373",
          font: { size: 10 },
          callback: (value: unknown) => `₹${Number(value).toLocaleString("en-IN")}`,
        },
        border: { display: false },
      },
    },
  };

  const kpis = [
    {
      idx: "01",
      label: "Period Revenue",
      value: `₹${report.totalRevenue.toLocaleString("en-IN")}`,
    },
    {
      idx: "02",
      label: "Orders",
      value: report.totalOrders.toLocaleString("en-IN"),
    },
    {
      idx: "03",
      label: "Avg Order",
      value: `₹${report.avgOrderValue.toLocaleString("en-IN")}`,
    },
    {
      idx: "04",
      label: "This Month",
      value: `₹${report.monthlyRevenue.toLocaleString("en-IN")}`,
    },
  ];

  const periodLabels: Record<Period, string> = {
    daily: "24H",
    weekly: "7D",
    monthly: "30D",
    quarterly: "QTR",
  };

  const revenueSeries =
    report.labels.length > 0 ? report.revenueData : [0];
  const orderSeries =
    report.labels.length > 0 ? report.orderData : [0];
  const labels = report.labels.length > 0 ? report.labels : ["No data"];

  return (
    <AppShell title="Reports." subtitle="Data-driven insights for your business">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div className="seg">
          {(["daily", "weekly", "monthly", "quarterly"] as Period[]).map((value) => (
            <button
              key={value}
              className={period === value ? "active" : ""}
              onClick={() => setPeriod(value)}
            >
              {periodLabels[value]}
            </button>
          ))}
        </div>
        <button className="btn btn-outline btn-sm" style={{ gap: 6 }}>
          <DownloadSimple size={13} /> Export
        </button>
      </div>

      <div className="kpi-grid stagger" style={{ marginBottom: 28 }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <div className="kpi-label">
              <span className="idx mono">{kpi.idx}</span>
              {kpi.label}
            </div>
            <div className="kpi-value">{loading ? "..." : kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <ChartLine size={14} weight="fill" />
            <p className="chart-title">Revenue Trend</p>
          </div>
          <p className="chart-subtitle">
            {period.charAt(0).toUpperCase() + period.slice(1)} breakdown
          </p>
          <Line
            data={{
              labels,
              datasets: [
                {
                  data: revenueSeries,
                  borderColor: "#0a0a0a",
                  backgroundColor: "transparent",
                  borderWidth: 1.5,
                  pointRadius: labels.length <= 12 ? 3 : 0,
                  pointBackgroundColor: "#0a0a0a",
                  fill: false,
                  tension: 0.3,
                },
              ],
            }}
            options={chartOpts}
          />
        </div>
        <div className="chart-card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <ChartBar size={14} weight="fill" />
            <p className="chart-title">Order Volume</p>
          </div>
          <p className="chart-subtitle">Number of orders per period</p>
          <Bar
            data={{
              labels,
              datasets: [
                {
                  label: "Orders",
                  data: orderSeries,
                  backgroundColor: "#e5e5e5",
                  borderColor: "#d5d5d5",
                  borderWidth: 1,
                  borderRadius: 2,
                  borderSkipped: false,
                },
              ],
            }}
            options={{
              ...chartOpts,
              scales: {
                x: { ...chartOpts.scales.x },
                y: {
                  ...chartOpts.scales.y,
                  ticks: {
                    ...chartOpts.scales.y.ticks,
                    callback: (value: unknown) => String(value),
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="chart-grid" style={{ marginTop: 20 }}>
        <div className="chart-card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Trophy size={14} weight="fill" />
            <p className="chart-title">Best Sellers</p>
          </div>
          <p className="chart-subtitle">Top items by quantity sold</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {report.bestSellers.length > 0 ? (
              report.bestSellers.map((item, index) => {
                const topQty = report.bestSellers[0]?.qty ?? 1;
                const percentage = Math.round((item.qty / topQty) * 100);

                return (
                  <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                      className="mono"
                      style={{
                        width: 22,
                        textAlign: "center",
                        fontSize: 11,
                        color: index < 3 ? "var(--ink)" : "var(--muted)",
                        fontWeight: index < 3 ? 700 : 400,
                      }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</span>
                        <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>
                          {item.qty} sold
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="muted" style={{ fontSize: 13 }}>
                No completed orders in this period yet.
              </p>
            )}
          </div>
        </div>

        <div className="chart-card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <ChartPieSlice size={14} weight="fill" />
            <p className="chart-title">Revenue by Payment</p>
          </div>
          <p className="chart-subtitle">Payment method breakdown</p>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div style={{ maxWidth: 140, flex: 1, minWidth: 100 }}>
              <Doughnut
                data={{
                  labels:
                    report.paymentBreakdown.length > 0
                      ? report.paymentBreakdown.map((item) => item.method)
                      : ["No data"],
                  datasets: [
                    {
                      data:
                        report.paymentBreakdown.length > 0
                          ? report.paymentBreakdown.map((item) => item.revenue)
                          : [1],
                      backgroundColor: ["#0a0a0a", "#404040", "#808080", "#c0c0c0"],
                      borderWidth: 0,
                      hoverOffset: 4,
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: "#0a0a0a",
                      titleColor: "#fafafa",
                      bodyColor: "#8a8a8a",
                    },
                  },
                  cutout: "68%",
                }}
              />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              {report.paymentBreakdown.length > 0 ? (
                report.paymentBreakdown.map((item, index) => {
                  const grays = ["#0a0a0a", "#404040", "#808080", "#c0c0c0"];
                  const percentage =
                    paymentTotal > 0 ? Math.round((item.revenue / paymentTotal) * 100) : 0;

                  return (
                    <div key={item.method}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: grays[index % grays.length],
                          }}
                        />
                        <span style={{ fontSize: 12, flex: 1, color: "var(--muted)" }}>
                          {item.method}
                        </span>
                        <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>
                          ₹{item.revenue.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="muted" style={{ fontSize: 13 }}>
                  No payment data in this period yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className="card card-padded"
        style={{ animation: "fadeUp 0.5s ease both", animationDelay: "400ms", marginTop: 20 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Clock size={14} weight="fill" />
          <p className="chart-title">Peak Order Hours</p>
        </div>
        <p className="chart-subtitle" style={{ marginBottom: 24 }}>
          When your restaurant is busiest
        </p>
        <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 80 }}>
          {Object.entries(report.peakHours).map(([hour, count]) => {
            const percentage = peakHourMax > 0 ? (count / peakHourMax) * 100 : 0;
            return (
              <div
                key={hour}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: `${percentage}%`,
                    minHeight: 2,
                    background: percentage > 70 ? "var(--ink)" : "var(--line)",
                    borderRadius: "2px 2px 0 0",
                    transition: "height 0.5s ease",
                  }}
                />
                <span
                  style={{
                    fontSize: 8,
                    color: "var(--muted)",
                    whiteSpace: "nowrap",
                    transform: "rotate(-45deg)",
                    transformOrigin: "center",
                    marginTop: 2,
                  }}
                >
                  {hour}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="card"
        style={{ marginTop: 24, animation: "fadeUp 0.5s ease both", animationDelay: "500ms" }}
      >
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <p style={{ fontSize: 14, fontWeight: 600 }}>Transaction Log</p>
            <p className="eyebrow" style={{ marginTop: 2 }}>
              Recent {report.transactions.length} completed orders
            </p>
          </div>
          <button className="btn btn-outline btn-sm" style={{ gap: 5 }}>
            <DownloadSimple size={13} /> Export CSV
          </button>
        </div>
        <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Time</th>
                <th>Items</th>
                <th>Subtotal</th>
                <th>Tax</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Cashier</th>
              </tr>
            </thead>
            <tbody>
              {report.transactions.length > 0 ? (
                report.transactions.map((order) => (
                  <tr key={order.id}>
                    <td className="mono" style={{ fontWeight: 600 }}>
                      {order.orderNumber}
                    </td>
                    <td style={{ fontSize: 12, color: "var(--muted)" }}>
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={11} color="var(--muted)" />
                      <span className="mono" style={{ fontSize: 11 }}>
                        {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="mono">{order.itemCount}</td>
                    <td className="mono">₹{order.subtotal.toLocaleString("en-IN")}</td>
                    <td className="mono" style={{ color: "var(--muted)" }}>
                      ₹{order.tax.toLocaleString("en-IN")}</td>
                    <td className="mono" style={{ fontWeight: 600 }}>
                      ₹{order.total.toLocaleString("en-IN")}
                    </td>
                    <td>
                      <span className="badge">{order.payment}</span>
                    </td>
                    <td style={{ fontSize: 11, color: "var(--muted)" }}>
                      {order.cashierName}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} style={{ padding: "28px 22px", color: "var(--muted)" }}>
                    No completed orders found for this period.
                  </td>
                </tr>
              )}
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
      <ToastProvider>
        <ReportsContent />
      </ToastProvider>
    </AuthProvider>
  );
}
