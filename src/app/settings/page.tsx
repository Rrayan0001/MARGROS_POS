"use client";

import React, { useState } from "react";
import AppShell from "@/components/AppShell";
import Modal from "@/components/Modal";
import { AuthProvider } from "@/context/AuthContext";
import { MenuProvider } from "@/context/MenuContext";
import { OrderProvider } from "@/context/OrderContext";
import { ToastProvider, useToast } from "@/components/Toast";
import { useAuth } from "@/context/AuthContext";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "cashier";
  status: "active" | "inactive";
  joined: string;
}
import {
  BuildingOffice,
  Receipt,
  Users,
  PaintBrush,
  FloppyDisk,
  Plus,
  Trash,
  Sun,
  Moon,
  ShieldCheck,
  UserCircle,
  CheckCircle,
  XCircle,
  UploadSimple,
  Palette,
} from "@phosphor-icons/react";

type SettingsTab = "profile" | "billing" | "staff" | "theme";

function SettingsContent() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [tab, setTab] = useState<SettingsTab>("profile");
  const [darkMode, setDarkMode] = useState(false);

  const [profile, setProfile] = useState({
    restaurantName: user?.restaurantName ?? "",
    ownerName: user?.name ?? "",
    email: user?.email ?? "",
    phone: "",
    address: "",
    gstin: "",
  });

  const [billing, setBilling] = useState({
    taxRate: 5,
    currency: "INR",
    receiptStyle: "detailed",
    autoDiscount: false,
  });

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: "", email: "", role: "cashier" });

  const handleSaveProfile = () => toast("Restaurant profile saved!", "success");
  const handleSaveBilling = () => toast("Billing settings updated!", "success");

  const handleAddStaff = () => {
    if (!newStaff.name || !newStaff.email) { toast("Fill in name and email", "error"); return; }
    setStaff((prev) => [...prev, {
      id: `s_${Date.now()}`,
      name: newStaff.name,
      email: newStaff.email,
      role: newStaff.role as "admin" | "cashier" | "manager",
      status: "active",
      joined: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    }]);
    setAddStaffOpen(false);
    setNewStaff({ name: "", email: "", role: "cashier" });
    toast("Staff member added!", "success");
  };

  const removeStaff = (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    toast("Staff member removed", "info");
  };

  const toggleTheme = (isDark: boolean) => {
    setDarkMode(isDark);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    toast(isDark ? "Dark mode enabled" : "Light mode enabled", "success");
  };

  const tabs = [
    { id: "profile" as SettingsTab, label: "Restaurant Profile", icon: <BuildingOffice size={16} weight="fill" /> },
    { id: "billing" as SettingsTab, label: "Billing Settings", icon: <Receipt size={16} weight="fill" /> },
    { id: "staff" as SettingsTab, label: "Staff Management", icon: <Users size={16} weight="fill" /> },
    { id: "theme" as SettingsTab, label: "Appearance", icon: <PaintBrush size={16} weight="fill" /> },
  ];

  const roleColors: Record<string, string> = {
    admin: "badge-orange",
    cashier: "badge-green",
    manager: "badge-gray",
  };

  return (
    <AppShell title="Settings" subtitle="Manage your restaurant preferences">
      <div className="settings-layout" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24, alignItems: "start" }}>
        {/* Sidebar tabs */}
        <div className="card" style={{ overflow: "hidden", position: "sticky", top: 88 }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 18px",
                background: tab === t.id ? "var(--primary-10)" : "transparent",
                border: "none",
                borderLeft: `3px solid ${tab === t.id ? "var(--primary)" : "transparent"}`,
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontSize: 13.5,
                fontWeight: tab === t.id ? 700 : 500,
                color: tab === t.id ? "var(--primary)" : "var(--gray)",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              <span style={{ opacity: tab === t.id ? 1 : 0.6 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {/* Profile Tab */}
          {tab === "profile" && (
            <div className="card card-padded" style={{ animation: "fadeIn 0.3s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: "var(--primary-10)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                  <BuildingOffice size={22} weight="fill" />
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700 }}>Restaurant Profile</h2>
                  <p style={{ fontSize: 13, color: "var(--gray)" }}>Update your restaurant information</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Restaurant Name</label>
                  <input className="form-input" value={profile.restaurantName} onChange={(e) => setProfile({ ...profile, restaurantName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Owner Name</label>
                  <input className="form-input" value={profile.ownerName} onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">GSTIN</label>
                  <input className="form-input" value={profile.gstin} onChange={(e) => setProfile({ ...profile, gstin: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Address</label>
                  <textarea className="form-input" rows={2} value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} style={{ resize: "none" }} />
                </div>

                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Restaurant Logo</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 80, height: 80, borderRadius: 14, border: "2px dashed var(--border)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "var(--gray-lighter)" }}>
                      <img src="/logo.png" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                    <div>
                      <button className="btn btn-outline btn-sm" onClick={() => toast("Logo upload coming soon!", "info")} style={{ gap: 6 }}>
                        <UploadSimple size={14} weight="regular" /> Change Logo
                      </button>
                      <p style={{ fontSize: 11, color: "var(--gray)", marginTop: 6 }}>PNG, JPG · Max 2MB</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
                <button id="settings-save-profile" className="btn btn-primary" onClick={handleSaveProfile} style={{ gap: 7 }}>
                  <FloppyDisk size={16} weight="fill" /> Save Profile
                </button>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {tab === "billing" && (
            <div className="card card-padded" style={{ animation: "fadeIn 0.3s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(76,175,80,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--secondary)" }}>
                  <Receipt size={22} weight="fill" />
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700 }}>Billing Settings</h2>
                  <p style={{ fontSize: 13, color: "var(--gray)" }}>Configure tax, currency, and receipt preferences</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Default Tax Rate (%)</label>
                    <input className="form-input" type="number" min={0} max={28} value={billing.taxRate} onChange={(e) => setBilling({ ...billing, taxRate: Number(e.target.value) })} />
                    <p style={{ fontSize: 11, color: "var(--gray)", marginTop: 4 }}>Applied to items with no custom tax</p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Currency</label>
                    <select className="form-input" value={billing.currency} onChange={(e) => setBilling({ ...billing, currency: e.target.value })}>
                      <option value="INR">INR (₹) — Indian Rupee</option>
                      <option value="USD">USD ($) — US Dollar</option>
                      <option value="EUR">EUR (€) — Euro</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Receipt Style</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                    {[
                      { id: "detailed", label: "Detailed", desc: "Full itemized receipt", icon: "📄" },
                      { id: "compact", label: "Compact", desc: "Minimal receipt", icon: "📋" },
                      { id: "thermal", label: "Thermal", desc: "Thermal printer", icon: "🖨️" },
                    ].map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setBilling({ ...billing, receiptStyle: style.id })}
                        style={{
                          padding: "14px 12px",
                          border: `2px solid ${billing.receiptStyle === style.id ? "var(--primary)" : "var(--border)"}`,
                          borderRadius: "var(--radius-md)",
                          background: billing.receiptStyle === style.id ? "var(--primary-10)" : "var(--white)",
                          cursor: "pointer",
                          textAlign: "center",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ fontSize: 22, marginBottom: 6 }}>{style.icon}</div>
                        <p style={{ fontWeight: 700, fontSize: 13, color: billing.receiptStyle === style.id ? "var(--primary)" : "var(--charcoal)" }}>{style.label}</p>
                        <p style={{ fontSize: 11, color: "var(--gray)", marginTop: 2 }}>{style.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderTop: "1px solid var(--border)" }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>Auto Apply Discount</p>
                    <p style={{ fontSize: 12, color: "var(--gray)", marginTop: 2 }}>Suggest discounts for large orders automatically</p>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" checked={billing.autoDiscount} onChange={(e) => setBilling({ ...billing, autoDiscount: e.target.checked })} />
                    <span className="toggle-track" />
                    <span className="toggle-thumb" style={{ position: "static", transform: billing.autoDiscount ? "translateX(20px)" : "none", transition: "transform 0.2s ease" }} />
                  </label>
                </div>
              </div>

              <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
                <button id="settings-save-billing" className="btn btn-primary" onClick={handleSaveBilling} style={{ gap: 7 }}>
                  <FloppyDisk size={16} weight="fill" /> Save Billing Settings
                </button>
              </div>
            </div>
          )}

          {/* Staff Tab */}
          {tab === "staff" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeIn 0.3s ease" }}>
              <div className="card card-padded">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7C3AED" }}>
                      <Users size={22} weight="fill" />
                    </div>
                    <div>
                      <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700 }}>Staff Management</h2>
                      <p style={{ fontSize: 13, color: "var(--gray)", marginTop: 2 }}>{staff.length} members · {staff.filter(s => s.status === "active").length} active</p>
                    </div>
                  </div>
                  <button id="settings-add-staff" className="btn btn-primary" onClick={() => setAddStaffOpen(true)} style={{ gap: 6 }}>
                    <Plus size={15} weight="bold" /> Add Staff
                  </button>
                </div>

                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {staff.map((s) => (
                        <tr key={s.id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div className="avatar" style={{ width: 34, height: 34, fontSize: 13, background: "linear-gradient(135deg, var(--primary), #FF8C4A)" }}>
                                {s.name.charAt(0)}
                              </div>
                              <strong style={{ fontSize: 13 }}>{s.name}</strong>
                            </div>
                          </td>
                          <td style={{ fontSize: 13, color: "var(--gray)" }}>{s.email}</td>
                          <td>
                            <span className={`badge ${roleColors[s.role]}`} style={{ display: "flex", alignItems: "center", gap: 4, width: "fit-content" }}>
                              <ShieldCheck size={11} weight="fill" />
                              {s.role}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${s.status === "active" ? "badge-green" : "badge-gray"}`} style={{ display: "flex", alignItems: "center", gap: 4, width: "fit-content" }}>
                              {s.status === "active" ? <CheckCircle size={11} weight="fill" /> : <XCircle size={11} weight="fill" />}
                              {s.status}
                            </span>
                          </td>
                          <td style={{ fontSize: 12, color: "var(--gray)" }}>{s.joined}</td>
                          <td>
                            <button
                              className="btn btn-ghost btn-icon-sm"
                              onClick={() => removeStaff(s.id)}
                              disabled={s.role === "admin"}
                              title={s.role === "admin" ? "Cannot remove admin" : "Remove"}
                              style={{ color: s.role === "admin" ? "var(--gray-light)" : "#EF4444" }}
                            >
                              <Trash size={14} weight="regular" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Role permissions */}
              <div className="card card-padded">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <ShieldCheck size={18} weight="fill" color="var(--primary)" />
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 700 }}>Role Permissions</h3>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {[
                    { role: "Admin", color: "var(--primary)", icon: <ShieldCheck size={16} weight="fill" />, perms: ["Full access", "All reports", "Settings", "Staff mgmt", "Menu CRUD", "Billing"] },
                    { role: "Manager", color: "var(--secondary)", icon: <UserCircle size={16} weight="fill" />, perms: ["Reports", "Menu view", "Billing", "Order history", "Staff view", "—Settings"] },
                    { role: "Cashier", color: "var(--gray)", icon: <Receipt size={16} weight="fill" />, perms: ["Billing only", "Print receipts", "New orders", "Payment", "—Reports", "—Settings"] },
                  ].map((r) => (
                    <div key={r.role} style={{ border: "1.5px solid var(--border)", borderRadius: "var(--radius-md)", padding: 16, transition: "box-shadow 0.15s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <span style={{ color: r.color }}>{r.icon}</span>
                        <span style={{ fontWeight: 700, fontSize: 14, color: r.color }}>{r.role}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                        {r.perms.map((p) => (
                          <div key={p} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}>
                            {p.startsWith("—") ? (
                              <XCircle size={13} weight="fill" color="var(--gray)" />
                            ) : (
                              <CheckCircle size={13} weight="fill" color={r.color} />
                            )}
                            <span style={{ color: p.startsWith("—") ? "var(--gray)" : "var(--charcoal)" }}>
                              {p.startsWith("—") ? p.slice(1) : p}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Theme Tab */}
          {tab === "theme" && (
            <div className="card card-padded" style={{ animation: "fadeIn 0.3s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(217,119,6,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#D97706" }}>
                  <PaintBrush size={22} weight="fill" />
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700 }}>Appearance</h2>
                  <p style={{ fontSize: 13, color: "var(--gray)" }}>Choose how MARGROS POS looks for you</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  {
                    id: false,
                    label: "Light Mode",
                    icon: <Sun size={36} weight="fill" color="#F59E0B" />,
                    desc: "Clean, bright interface for daytime use",
                    preview: "linear-gradient(135deg, #FFF8F2, #FFFFFF)",
                  },
                  {
                    id: true,
                    label: "Dark Mode",
                    icon: <Moon size={36} weight="fill" color="#818CF8" />,
                    desc: "Easy on the eyes for night shifts",
                    preview: "linear-gradient(135deg, #1A1A1A, #0D1117)",
                  },
                ].map((theme) => (
                  <button
                    key={String(theme.id)}
                    onClick={() => toggleTheme(theme.id as boolean)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                      padding: 24,
                      border: `2.5px solid ${darkMode === theme.id ? "var(--primary)" : "var(--border)"}`,
                      borderRadius: "var(--radius-lg)",
                      background: darkMode === theme.id ? "var(--primary-10)" : "var(--white)",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.2s ease",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ width: "100%", height: 70, borderRadius: "var(--radius-md)", background: theme.preview, border: "1px solid var(--border)" }} />
                    {theme.icon}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
                      <p style={{ fontWeight: 700, fontSize: 15, color: darkMode === theme.id ? "var(--primary)" : "var(--charcoal)" }}>{theme.label}</p>
                      <p style={{ fontSize: 12, color: "var(--gray)" }}>{theme.desc}</p>
                    </div>
                    {darkMode === theme.id && (
                      <span className="badge badge-orange" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <CheckCircle size={11} weight="fill" /> Active
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Brand Colors */}
              <div style={{ marginTop: 28, padding: 20, background: "var(--gray-lighter)", borderRadius: "var(--radius-md)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <Palette size={16} weight="fill" color="var(--primary)" />
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 700 }}>Brand Color Palette</h3>
                </div>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  {[
                    { name: "Primary Orange", color: "#F26A21" },
                    { name: "Secondary Green", color: "#4CAF50" },
                    { name: "Dark Green", color: "#1F6B3A" },
                    { name: "Rust Accent", color: "#A63A1E" },
                  ].map((c) => (
                    <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: c.color, boxShadow: `0 4px 12px ${c.color}40` }} />
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--charcoal)" }}>{c.name}</p>
                        <p style={{ fontSize: 10, color: "var(--gray)", fontFamily: "monospace" }}>{c.color}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Staff Modal */}
      <Modal
        open={addStaffOpen}
        onClose={() => setAddStaffOpen(false)}
        title="Add Staff Member"
        maxWidth={440}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setAddStaffOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddStaff} style={{ gap: 6 }}>
              <Plus size={14} weight="bold" /> Add Member
            </button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingBottom: 8 }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="e.g. Arun Kumar" value={newStaff.name} onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="arun@margros.com" value={newStaff.email} onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-input" value={newStaff.role} onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}>
              <option value="cashier">Cashier</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </Modal>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @media (max-width: 768px) {
          :global(.settings-layout) { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AppShell>
  );
}

export default function SettingsPage() {
  return (
    <AuthProvider>
      <MenuProvider>
        <OrderProvider>
          <ToastProvider>
            <SettingsContent />
          </ToastProvider>
        </OrderProvider>
      </MenuProvider>
    </AuthProvider>
  );
}
