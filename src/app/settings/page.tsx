"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import Modal from "@/components/Modal";
import { AuthProvider } from "@/context/AuthContext";
import { MenuProvider } from "@/context/MenuContext";
import { OrderProvider } from "@/context/OrderContext";
import { ToastProvider, useToast } from "@/components/Toast";
import { useAuth } from "@/context/AuthContext";
import {
  BuildingOffice, Receipt, Users, PaintBrush, FloppyDisk, Plus, Trash,
  Sun, Moon, ShieldCheck, UserCircle, CheckCircle, XCircle, UploadSimple,
} from "@phosphor-icons/react";

interface StaffMember {
  id: string; name: string; email: string;
  role: "admin" | "manager" | "cashier"; status: "active" | "inactive"; joined: string;
}

type SettingsTab = "profile" | "billing" | "staff" | "theme";

function SettingsContent() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [tab, setTab] = useState<SettingsTab>("profile");
  const [darkMode, setDarkMode] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profile, setProfile] = useState({ restaurantName: "", ownerName: "", email: "", phone: "", address: "", gstin: "" });
  const [billing, setBilling] = useState({ taxRate: 5, currency: "INR", receiptStyle: "detailed", autoDiscount: false });
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: "", email: "", role: "cashier" });

  useEffect(() => {
    fetch("/api/settings/profile").then((r) => r.json()).then(({ restaurant }) => {
      if (restaurant) {
        setProfile({ restaurantName: restaurant.name ?? "", ownerName: restaurant.owner_name ?? "", email: restaurant.email ?? "", phone: restaurant.phone ?? "", address: restaurant.address ?? "", gstin: restaurant.gst_number ?? "" });
      }
    }).catch(() => toast("Failed to load profile", "error")).finally(() => setProfileLoading(false));
  }, [toast]);

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      const res = await fetch("/api/settings/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: profile.restaurantName, owner_name: profile.ownerName, phone: profile.phone, address: profile.address, gst_number: profile.gstin }) });
      if (!res.ok) throw new Error();
      toast("Restaurant profile saved!", "success");
    } catch { toast("Failed to save profile", "error"); }
    finally { setProfileSaving(false); }
  };

  const handleAddStaff = () => {
    if (!newStaff.name || !newStaff.email) { toast("Fill in name and email", "error"); return; }
    setStaff((prev) => [...prev, { id: `s_${Date.now()}`, name: newStaff.name, email: newStaff.email, role: newStaff.role as "admin" | "cashier" | "manager", status: "active", joined: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) }]);
    setAddStaffOpen(false); setNewStaff({ name: "", email: "", role: "cashier" });
    toast("Staff member added!", "success");
  };

  const removeStaff = (id: string) => { setStaff((prev) => prev.filter((s) => s.id !== id)); toast("Staff member removed", "info"); };

  const toggleTheme = (isDark: boolean) => {
    setDarkMode(isDark);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    document.documentElement.setAttribute("data-mode", isDark ? "dark" : "light");
    toast(isDark ? "Dark mode enabled" : "Light mode enabled", "success");
  };

  const tabs = [
    { id: "profile" as SettingsTab, label: "Restaurant Profile", Icon: BuildingOffice },
    { id: "billing" as SettingsTab, label: "Billing Settings", Icon: Receipt },
    { id: "staff" as SettingsTab, label: "Staff Management", Icon: Users },
    { id: "theme" as SettingsTab, label: "Appearance", Icon: PaintBrush },
  ];

  return (
    <AppShell title="Settings." subtitle="Manage your restaurant preferences">
      <div className="settings-layout">
        {/* Sidebar tabs */}
        <div className="card" style={{ overflow: "hidden", position: "sticky", top: 80 }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "13px 16px", background: tab === t.id ? "var(--chip)" : "transparent",
                border: "none", borderLeft: `3px solid ${tab === t.id ? "var(--ink)" : "transparent"}`,
                cursor: "pointer", fontFamily: "var(--sans)", fontSize: 13.5,
                fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? "var(--ink)" : "var(--muted)",
                textAlign: "left", transition: "all 120ms ease",
              }}
            >
              <t.Icon size={15} weight={tab === t.id ? "fill" : "regular"} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {tab === "profile" && (
            <div className="card card-padded" style={{ animation: "fadeIn 0.3s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink)" }}>
                  <BuildingOffice size={20} weight="fill" />
                </div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}>Restaurant Profile</h2>
                  <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>Update your restaurant information</p>
                </div>
              </div>
              {profileLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "40px 0", color: "var(--muted)", fontSize: 14 }}>Loading profile…</div>
              ) : (
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
                    <input className="form-input" type="email" value={profile.email} readOnly style={{ background: "var(--chip)", cursor: "not-allowed" }} title="Email cannot be changed" />
                    <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Cannot be changed after signup</p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" placeholder="+91 98765 43210" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GSTIN <span style={{ fontFamily: "var(--sans)", fontSize: 10, color: "var(--muted)" }}>Optional</span></label>
                    <input className="form-input" placeholder="27AAPFU0939F1ZV" value={profile.gstin} onChange={(e) => setProfile({ ...profile, gstin: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">Address <span style={{ fontFamily: "var(--sans)", fontSize: 10, color: "var(--muted)" }}>Optional</span></label>
                    <textarea className="form-input" rows={2} placeholder="Restaurant address" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} style={{ resize: "none" }} />
                  </div>
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">Restaurant Logo</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 72, height: 72, border: "1px dashed var(--line)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "var(--chip)" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.png" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      </div>
                      <div>
                        <button className="btn btn-outline btn-sm" onClick={() => toast("Logo upload coming soon!", "info")} style={{ gap: 6 }}>
                          <UploadSimple size={13} /> Change Logo
                        </button>
                        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>PNG, JPG · Max 2MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "flex-end" }}>
                <button id="settings-save-profile" className="btn btn-primary" onClick={handleSaveProfile} disabled={profileLoading || profileSaving} style={{ gap: 7 }}>
                  <FloppyDisk size={14} weight="fill" /> {profileSaving ? "Saving…" : "Save Profile"}
                </button>
              </div>
            </div>
          )}

          {tab === "billing" && (
            <div className="card card-padded" style={{ animation: "fadeIn 0.3s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center" }}><Receipt size={20} weight="fill" /></div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}>Billing Settings</h2>
                  <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>Configure tax, currency, and receipt preferences</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Default Tax Rate (%)</label>
                    <input className="form-input" type="number" min={0} max={28} value={billing.taxRate} onChange={(e) => setBilling({ ...billing, taxRate: Number(e.target.value) })} />
                    <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Applied to items with no custom tax</p>
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
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                    {[{ id: "detailed", label: "Detailed", desc: "Full itemized" }, { id: "compact", label: "Compact", desc: "Minimal" }, { id: "thermal", label: "Thermal", desc: "Printer ready" }].map((s) => (
                      <button key={s.id} type="button" onClick={() => setBilling({ ...billing, receiptStyle: s.id })}
                        style={{ padding: "14px 12px", border: `1.5px solid ${billing.receiptStyle === s.id ? "var(--ink)" : "var(--line)"}`, borderRadius: "var(--radius)", background: billing.receiptStyle === s.id ? "var(--chip)" : "var(--bg)", cursor: "pointer", textAlign: "center", transition: "all 120ms ease" }}>
                        <p style={{ fontWeight: 600, fontSize: 13, color: billing.receiptStyle === s.id ? "var(--ink)" : "var(--muted)" }}>{s.label}</p>
                        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderTop: "1px solid var(--line)" }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>Auto Apply Discount</p>
                    <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Suggest discounts for large orders automatically</p>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" checked={billing.autoDiscount} onChange={(e) => setBilling({ ...billing, autoDiscount: e.target.checked })} />
                    <span className="toggle-track" />
                    <span className="toggle-thumb" />
                  </label>
                </div>
              </div>
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "flex-end" }}>
                <button id="settings-save-billing" className="btn btn-primary" onClick={() => toast("Billing settings updated!", "success")} style={{ gap: 7 }}>
                  <FloppyDisk size={14} weight="fill" /> Save Billing Settings
                </button>
              </div>
            </div>
          )}

          {tab === "staff" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeIn 0.3s ease" }}>
              <div className="card card-padded">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center" }}><Users size={20} weight="fill" /></div>
                    <div>
                      <h2 style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}>Staff Management</h2>
                      <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>{staff.length} members · {staff.filter(s => s.status === "active").length} active</p>
                    </div>
                  </div>
                  <button id="settings-add-staff" className="btn btn-primary" onClick={() => setAddStaffOpen(true)} style={{ gap: 6 }}>
                    <Plus size={13} weight="bold" /> Add Staff
                  </button>
                </div>
                <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
                  <table className="tbl">
                    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th></th></tr></thead>
                    <tbody>
                      {staff.map((s) => (
                        <tr key={s.id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>{s.name.charAt(0)}</div>
                              <strong style={{ fontSize: 13 }}>{s.name}</strong>
                            </div>
                          </td>
                          <td style={{ fontSize: 13, color: "var(--muted)" }}>{s.email}</td>
                          <td><span className="badge" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><ShieldCheck size={10} weight="fill" />{s.role}</span></td>
                          <td><span className="badge" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{s.status === "active" ? <CheckCircle size={10} weight="fill" /> : <XCircle size={10} weight="fill" />}{s.status}</span></td>
                          <td style={{ fontSize: 11, color: "var(--muted)" }}>{s.joined}</td>
                          <td>
                            <button className="btn btn-ghost btn-icon-sm" onClick={() => removeStaff(s.id)} disabled={s.role === "admin"} title={s.role === "admin" ? "Cannot remove admin" : "Remove"} style={{ color: s.role === "admin" ? "var(--muted)" : "#ef4444" }}>
                              <Trash size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card card-padded">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <ShieldCheck size={16} weight="fill" />
                  <h3 style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>Role Permissions</h3>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                  {[
                    { role: "Admin", Icon: ShieldCheck, perms: ["Full access", "All reports", "Settings", "Staff mgmt", "Menu CRUD", "Billing"] },
                    { role: "Manager", Icon: UserCircle, perms: ["Reports", "Menu view", "Billing", "Order history", "Staff view", "—Settings"] },
                    { role: "Cashier", Icon: Receipt, perms: ["Billing only", "Print receipts", "New orders", "Payment", "—Reports", "—Settings"] },
                  ].map((r) => (
                    <div key={r.role} style={{ border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <r.Icon size={14} weight="fill" />
                        <span style={{ fontWeight: 700, fontSize: 13 }}>{r.role}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                        {r.perms.map((p) => (
                          <div key={p} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}>
                            {p.startsWith("—") ? <XCircle size={12} weight="fill" color="var(--muted)" /> : <CheckCircle size={12} weight="fill" color="var(--ink)" />}
                            <span style={{ color: p.startsWith("—") ? "var(--muted)" : "var(--ink)" }}>{p.startsWith("—") ? p.slice(1) : p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "theme" && (
            <div className="card card-padded" style={{ animation: "fadeIn 0.3s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                <div style={{ width: 40, height: 40, border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center" }}><PaintBrush size={20} weight="fill" /></div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}>Appearance</h2>
                  <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>Choose how MARGROS POS looks for you</p>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { id: false, label: "Light Mode", Icon: Sun, desc: "Clean, bright interface for daytime use" },
                  { id: true, label: "Dark Mode", Icon: Moon, desc: "Easy on the eyes for night shifts" },
                ].map((theme) => (
                  <button
                    key={String(theme.id)}
                    onClick={() => toggleTheme(theme.id as boolean)}
                    style={{
                      display: "flex", flexDirection: "column", gap: 16, padding: 24,
                      border: `1.5px solid ${darkMode === theme.id ? "var(--ink)" : "var(--line)"}`,
                      borderRadius: "var(--radius-lg)", background: darkMode === theme.id ? "var(--chip)" : "var(--bg)",
                      cursor: "pointer", textAlign: "center", transition: "all 200ms ease", alignItems: "center",
                    }}
                  >
                    <div style={{ width: "100%", height: 60, borderRadius: "var(--radius)", background: theme.id ? "#0a0a0a" : "#fafafa", border: "1px solid var(--line)" }} />
                    <theme.Icon size={32} weight={darkMode === theme.id ? "fill" : "regular"} color="var(--ink)" />
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{theme.label}</p>
                      <p style={{ fontSize: 12, color: "var(--muted)" }}>{theme.desc}</p>
                    </div>
                    {darkMode === theme.id && <span className="badge solid">Active</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Staff Modal */}
      <Modal open={addStaffOpen} onClose={() => setAddStaffOpen(false)} title="Add Staff Member" maxWidth={440}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setAddStaffOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddStaff} style={{ gap: 6 }}><Plus size={13} weight="bold" /> Add Member</button>
          </>
        }>
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

      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </AppShell>
  );
}

export default function SettingsPage() {
  return (
    <AuthProvider><MenuProvider><OrderProvider><ToastProvider><SettingsContent /></ToastProvider></OrderProvider></MenuProvider></AuthProvider>
  );
}
