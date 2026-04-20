"use client";

import React, { useState, useMemo } from "react";
import AppShell from "@/components/AppShell";
import Modal from "@/components/Modal";
import { AuthProvider } from "@/context/AuthContext";
import { MenuProvider, useMenu } from "@/context/MenuContext";
import { OrderProvider } from "@/context/OrderContext";
import { ToastProvider, useToast } from "@/components/Toast";
import { MenuItem, CATEGORIES } from "@/data/mockData";
import {
  Plus,
  MagnifyingGlass,
  PencilSimple,
  Trash,
  ForkKnife,
  CheckCircle,
  XCircle,
  ChartPieSlice,
  ListChecks,
  Warning,
} from "@phosphor-icons/react";

const EMPTY_ITEM: Omit<MenuItem, "id"> = {
  name: "",
  category: "Main Course",
  price: 0,
  tax: 0,
  description: "",
  image: "🍽️",
  available: true,
};

const EMOJIS = ["🍛", "🍜", "🍲", "🥘", "🍱", "🍣", "🥗", "🍔", "🌮", "🍕", "🍝", "🥙", "🍤", "🧆", "🥚", "🫓", "☕", "🥤", "🧃", "🍮", "🍦", "🍧", "🥣", "🥟", "🧅"];

function MenuContent() {
  const { items, addItem, updateItem, deleteItem, toggleAvailability } = useMenu();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [activeTab, setActiveTab] = useState("items");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<Omit<MenuItem, "id">>(EMPTY_ITEM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [clearAllConfirm, setClearAllConfirm] = useState(false);
  const [deleteCatConfirm, setDeleteCatConfirm] = useState<string | null>(null);
  const [clearAllCatsConfirm, setClearAllCatsConfirm] = useState(false);
  const [addCatName, setAddCatName] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);
  const [customCats, setCustomCats] = useState<string[]>([]);
  const [deletedBuiltinCats, setDeletedBuiltinCats] = useState<string[]>([]);

  const allCategories = Array.from(new Set([
    ...customCats,
    ...items.map((i) => i.category),
  ])).filter((c) => !deletedBuiltinCats.includes(c));

  const categories = ["All", ...allCategories.filter((c) => items.some((i) => i.category === c))];

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchCat = activeCat === "All" || item.category === activeCat;
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [items, search, activeCat]);

  const openAdd = () => { setEditingItem(null); setForm(EMPTY_ITEM); setModalOpen(true); };
  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setForm({ name: item.name, category: item.category, price: item.price, tax: 0, description: item.description, image: item.image, available: item.available, variants: item.variants });
    setModalOpen(true);
  };

  const handleClearAll = async () => {
    const count = items.length;
    for (const item of items) await deleteItem(item.id);
    setCustomCats([]); setDeletedBuiltinCats(allCategories); setClearAllConfirm(false);
    toast(`All ${count} items removed from menu`, "info");
  };

  const handleAddCategory = () => {
    const name = addCatName.trim();
    if (!name) return;
    if (allCategories.includes(name)) { toast("Category already exists", "error"); return; }
    setCustomCats((prev) => [...prev, name]); setAddCatName(""); setShowAddCat(false);
    toast(`Category "${name}" added`, "success");
  };

  const handleDeleteCategory = async (catName: string) => {
    const toDelete = items.filter((i) => i.category === catName);
    for (const item of toDelete) await deleteItem(item.id);
    setCustomCats((prev) => prev.filter((c) => c !== catName));
    setDeletedBuiltinCats((prev) => [...prev, catName]);
    setDeleteCatConfirm(null);
    toast(`Category "${catName}" and ${toDelete.length} items removed`, "info");
  };

  const handleClearAllCategories = async () => {
    for (const item of items) await deleteItem(item.id);
    setCustomCats([]); setDeletedBuiltinCats(allCategories); setClearAllCatsConfirm(false);
    toast("All categories and items removed", "info");
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast("Item name is required", "error"); return; }
    let saveData = { ...form };
    if (form.variants?.length) {
      const filledVariants = form.variants.filter((v) => v.price > 0);
      if (filledVariants.length === 0) { toast("At least one variant price is required", "error"); return; }
      saveData = { ...saveData, variants: filledVariants, price: filledVariants[0].price };
    } else {
      if (form.price <= 0) { toast("Price must be greater than 0", "error"); return; }
    }
    if (editingItem) { updateItem(editingItem.id, saveData); toast("Item updated!", "success"); }
    else { addItem(saveData); toast("Item added to menu!", "success"); }
    setModalOpen(false);
  };

  const cleanupEmptyCategories = (remainingItems: typeof items) => {
    const occupied = new Set(remainingItems.map((i) => i.category));
    setCustomCats((prev) => prev.filter((c) => occupied.has(c)));
    setDeletedBuiltinCats((prev) => [...prev, ...allCategories.filter((c) => !occupied.has(c) && !prev.includes(c))]);
  };

  const handleDelete = (id: string) => {
    const remaining = items.filter((i) => i.id !== id);
    deleteItem(id); cleanupEmptyCategories(remaining); setDeleteConfirm(null);
    toast("Item removed from menu", "info");
  };

  const update = (field: keyof typeof form, val: unknown) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  const catStats = allCategories
    .filter((c) => items.some((i) => i.category === c) || customCats.includes(c))
    .map((cat) => ({
      name: cat,
      count: items.filter((i) => i.category === cat).length,
      available: items.filter((i) => i.category === cat && i.available).length,
    }));

  return (
    <AppShell title="Menu." subtitle={`${items.length} items · ${items.filter(i => i.available).length} available`}>

      {/* Tabs */}
      <div className="tab-list">
        <button className={`tab-btn ${activeTab === "items" ? "active" : ""}`} onClick={() => setActiveTab("items")} style={{ gap: 6 }}>
          <ListChecks size={14} weight={activeTab === "items" ? "fill" : "regular"} />
          Menu Items
        </button>
        <button className={`tab-btn ${activeTab === "categories" ? "active" : ""}`} onClick={() => setActiveTab("categories")} style={{ gap: 6 }}>
          <ChartPieSlice size={14} weight={activeTab === "categories" ? "fill" : "regular"} />
          Categories
        </button>
      </div>

      {activeTab === "items" && (
        <>
          <div className="page-header">
            <p className="page-subtitle">Add, edit, and manage your restaurant menu</p>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <div className="search-bar">
                <MagnifyingGlass size={15} className="search-icon" />
                <input
                  id="menu-search"
                  placeholder="Search items…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: 200 }}
                />
              </div>
              {items.length > 0 && (
                <button className="btn btn-outline btn-sm" onClick={() => setClearAllConfirm(true)} style={{ gap: 6, color: "#ef4444", borderColor: "#ef4444" }}>
                  <Trash size={13} /> Clear All
                </button>
              )}
              <button id="menu-add-item" className="btn btn-primary" onClick={openAdd} style={{ gap: 6 }}>
                <Plus size={14} weight="bold" /> Add Item
              </button>
            </div>
          </div>

          {/* Category filter */}
          <div className="chip-row" style={{ marginBottom: 16 }}>
            {categories.map((cat) => (
              <button key={cat} className={`pill ${activeCat === cat ? "active" : ""}`} onClick={() => setActiveCat(cat)}>{cat}</button>
            ))}
          </div>

          <div className="card" style={{ animation: "fadeUp 0.4s ease" }}>
            <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Avail.</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="mono" style={{ color: "var(--muted)", width: 40 }}>{String(idx + 1).padStart(2, "0")}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 22, lineHeight: 1 }}>{item.image}</span>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <p style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</p>
                            {item.variants?.length && (
                              <span className="badge solid" style={{ fontSize: 9, padding: "2px 6px" }}>SIZES</span>
                            )}
                          </div>
                          <p className="muted" style={{ fontSize: 11, marginTop: 1 }}>
                            {item.description.slice(0, 40)}{item.description.length > 40 ? "…" : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge">{item.category}</span></td>
                    <td>
                      {item.variants?.length ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          {item.variants.map((v) => (
                            <span key={v.label} className="mono" style={{ fontSize: 11 }}>
                              <span style={{ color: "var(--muted)" }}>{v.label} </span>₹{v.price}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="mono" style={{ fontWeight: 600 }}>₹{item.price}</span>
                      )}
                    </td>
                    <td>
                      <label className="toggle" onClick={() => toggleAvailability(item.id)} style={{ cursor: "pointer" }}>
                        <input type="checkbox" readOnly checked={item.available} style={{ opacity: 0, position: "absolute" }} />
                        <span className="toggle-track" />
                        <span className="toggle-thumb" />
                      </label>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="btn btn-ghost btn-icon-sm" onClick={() => openEdit(item)} title="Edit item">
                          <PencilSimple size={14} />
                        </button>
                        <button className="btn btn-ghost btn-icon-sm" onClick={() => setDeleteConfirm(item.id)} title="Delete item" style={{ color: "#ef4444" }}>
                          <Trash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="empty-state">
                <div className="empty-icon"><ForkKnife size={22} /></div>
                <p style={{ fontWeight: 600 }}>No items found</p>
                <p>Try a different search or category</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "categories" && (
        <div>
          <div className="page-header">
            <p className="page-subtitle">Category overview and item distribution</p>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {showAddCat ? (
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input
                    className="form-input"
                    placeholder="Category name…"
                    value={addCatName}
                    onChange={(e) => setAddCatName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                    style={{ width: 180, padding: "7px 12px", fontSize: 13 }}
                    autoFocus
                  />
                  <button className="btn btn-primary btn-sm" onClick={handleAddCategory} style={{ gap: 5 }}>
                    <CheckCircle size={13} weight="fill" /> Add
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => { setShowAddCat(false); setAddCatName(""); }}>Cancel</button>
                </div>
              ) : (
                <>
                  {catStats.length > 0 && (
                    <button className="btn btn-outline btn-sm" onClick={() => setClearAllCatsConfirm(true)} style={{ gap: 6, color: "#ef4444", borderColor: "#ef4444" }}>
                      <Trash size={13} /> Clear All
                    </button>
                  )}
                  <button className="btn btn-primary" onClick={() => setShowAddCat(true)} style={{ gap: 6 }}>
                    <Plus size={14} weight="bold" /> Add Category
                  </button>
                </>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {catStats.map((cat, i) => (
              <div key={cat.name} className="card card-padded" style={{ animation: "fadeUp 0.4s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <p className="eyebrow" style={{ marginBottom: 4 }}>CAT {String(i + 1).padStart(2, "0")}</p>
                    <h3 style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>{cat.name}</h3>
                  </div>
                  <button
                    className="btn btn-ghost btn-icon-sm"
                    onClick={() => setDeleteCatConfirm(cat.name)}
                    title={`Delete "${cat.name}" category`}
                    style={{ color: "#ef4444" }}
                  >
                    <Trash size={13} />
                  </button>
                </div>
                <div className="progress-bar" style={{ marginBottom: 10 }}>
                  <div className="progress-fill" style={{ width: cat.count ? `${(cat.available / cat.count) * 100}%` : "0%" }} />
                </div>
                <p style={{ fontSize: 12, color: "var(--muted)", display: "flex", gap: 12 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle size={12} weight="fill" color="var(--ink)" />
                    <strong>{cat.available}</strong> available
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <XCircle size={12} weight="fill" color="var(--muted)" />
                    <strong>{cat.count - cat.available}</strong> off
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? "Edit Menu Item" : "Add New Item"}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} style={{ gap: 6 }}>
              <CheckCircle size={14} weight="fill" />
              {editingItem ? "Save Changes" : "Add Item"}
            </button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 8 }}>
          <div className="form-group">
            <label className="form-label">Icon / Emoji</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {EMOJIS.map((e) => (
                <button
                  key={e} type="button" onClick={() => update("image", e)}
                  style={{
                    width: 34, height: 34, borderRadius: "var(--radius)", fontSize: 17, cursor: "pointer",
                    border: form.image === e ? "2px solid var(--ink)" : "1px solid var(--line)",
                    background: form.image === e ? "var(--chip)" : "var(--bg)",
                    transition: "all 120ms ease",
                  }}
                >{e}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Item Name *</label>
              <input className="form-input" placeholder="e.g. Butter Chicken" value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={form.category} onChange={(e) => update("category", e.target.value)}>
                {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Availability</label>
              <label className="toggle" style={{ marginTop: 8 }}>
                <input type="checkbox" checked={form.available} onChange={(e) => update("available", e.target.checked)} />
                <span className="toggle-track" />
                <span className="toggle-thumb" />
                <span style={{ marginLeft: 10, fontSize: 13, color: form.available ? "var(--ink)" : "var(--muted)" }}>
                  {form.available ? "Available" : "Unavailable"}
                </span>
              </label>
            </div>
          </div>

          {/* Price / Variants */}
          <div className="form-group">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <label className="form-label" style={{ marginBottom: 0 }}>
                {form.variants?.length ? "Size Variants (₹)" : "Price (₹) *"}
              </label>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  if (form.variants?.length) update("variants", undefined);
                  else update("variants", [
                    { label: "Qtr", price: form.price || 0 },
                    { label: "Half", price: 0 },
                    { label: "Full", price: 0 },
                  ]);
                }}
              >
                {form.variants?.length ? "Single price" : "+ Add sizes"}
              </button>
            </div>
            {form.variants?.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {form.variants.map((v, idx) => (
                  <div key={v.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="badge" style={{ width: 42, justifyContent: "center" }}>{v.label}</span>
                    <input
                      className="form-input"
                      type="number" min={0} placeholder="0"
                      value={v.price || ""}
                      onChange={(e) => {
                        const newVariants = [...(form.variants ?? [])];
                        newVariants[idx] = { ...newVariants[idx], price: Number(e.target.value) };
                        update("variants", newVariants);
                        if (idx === 0) update("price", Number(e.target.value));
                      }}
                      style={{ flex: 1 }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <input className="form-input" type="number" min={0} placeholder="0" value={form.price || ""} onChange={(e) => update("price", Number(e.target.value))} />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input" rows={2}
              placeholder="Brief description of the item…"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              style={{ resize: "none" }}
            />
          </div>
        </div>
      </Modal>

      {/* Delete item confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Item" maxWidth={380}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm!)} style={{ gap: 6 }}>
              <Trash size={13} weight="fill" /> Delete
            </button>
          </>
        }>
        <p style={{ fontSize: 14, color: "var(--muted)", paddingBottom: 8 }}>Are you sure you want to delete this menu item? This action cannot be undone.</p>
      </Modal>

      {/* Delete category confirm */}
      <Modal open={!!deleteCatConfirm} onClose={() => setDeleteCatConfirm(null)} title="Delete Category" maxWidth={400}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setDeleteCatConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDeleteCategory(deleteCatConfirm!)} style={{ gap: 6 }}>
              <Trash size={13} weight="fill" /> Delete Category
            </button>
          </>
        }>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingBottom: 8 }}>
          <Warning size={24} weight="fill" color="#ef4444" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
            This will permanently delete the <strong style={{ color: "var(--ink)" }}>&ldquo;{deleteCatConfirm}&rdquo;</strong> category and all{" "}
            <strong style={{ color: "var(--ink)" }}>{items.filter(i => i.category === deleteCatConfirm).length} items</strong> in it.
          </p>
        </div>
      </Modal>

      {/* Clear all categories confirm */}
      <Modal open={clearAllCatsConfirm} onClose={() => setClearAllCatsConfirm(false)} title="Clear All Categories" maxWidth={400}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setClearAllCatsConfirm(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleClearAllCategories} style={{ gap: 6 }}>
              <Trash size={13} weight="fill" /> Remove All
            </button>
          </>
        }>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingBottom: 8 }}>
          <Warning size={24} weight="fill" color="#ef4444" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
            This will permanently delete all <strong style={{ color: "var(--ink)" }}>{catStats.length} categories</strong> and{" "}
            <strong style={{ color: "var(--ink)" }}>{items.length} menu items</strong> within them.
          </p>
        </div>
      </Modal>

      {/* Clear all items confirm */}
      <Modal open={clearAllConfirm} onClose={() => setClearAllConfirm(false)} title="Clear All Items" maxWidth={400}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setClearAllConfirm(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleClearAll} style={{ gap: 6 }}>
              <Trash size={13} weight="fill" /> Remove All
            </button>
          </>
        }>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingBottom: 8 }}>
          <Warning size={24} weight="fill" color="#ef4444" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
            This will permanently delete all <strong style={{ color: "var(--ink)" }}>{items.length} menu items</strong>.
          </p>
        </div>
      </Modal>
    </AppShell>
  );
}

export default function MenuPage() {
  return (
    <AuthProvider>
      <MenuProvider>
        <OrderProvider>
          <ToastProvider>
            <MenuContent />
          </ToastProvider>
        </OrderProvider>
      </MenuProvider>
    </AuthProvider>
  );
}
