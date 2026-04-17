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
  ToggleLeft,
  ToggleRight,
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
  // Custom categories managed locally (persisted in addition to CATEGORIES)
  const [customCats, setCustomCats] = useState<string[]>([]);
  // Track manually deleted built-in categories so they don't re-appear
  const [deletedBuiltinCats, setDeletedBuiltinCats] = useState<string[]>([]);

  // Categories = only custom cats + categories that actually have items (excluding manually deleted ones)
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

  const openAdd = () => {
    setEditingItem(null);
    setForm(EMPTY_ITEM);
    setModalOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setForm({ name: item.name, category: item.category, price: item.price, tax: 0, description: item.description, image: item.image, available: item.available, variants: item.variants });
    setModalOpen(true);
  };

  const handleClearAll = async () => {
    const count = items.length;
    for (const item of items) {
      await deleteItem(item.id);
    }
    setCustomCats([]);
    setDeletedBuiltinCats(allCategories);
    setClearAllConfirm(false);
    toast(`All ${count} items removed from menu`, "info");
  };

  const handleAddCategory = () => {
    const name = addCatName.trim();
    if (!name) return;
    if (allCategories.includes(name)) { toast("Category already exists", "error"); return; }
    setCustomCats((prev) => [...prev, name]);
    setAddCatName("");
    setShowAddCat(false);
    toast(`Category "${name}" added`, "success");
  };

  const handleDeleteCategory = async (catName: string) => {
    const toDelete = items.filter((i) => i.category === catName);
    for (const item of toDelete) {
      await deleteItem(item.id);
    }
    setCustomCats((prev) => prev.filter((c) => c !== catName));
    // Mark as deleted so it doesn't reappear from CATEGORIES or item data
    setDeletedBuiltinCats((prev) => [...prev, catName]);
    setDeleteCatConfirm(null);
    toast(`Category "${catName}" and ${toDelete.length} items removed`, "info");
  };

  const handleClearAllCategories = async () => {
    for (const item of items) {
      await deleteItem(item.id);
    }
    setCustomCats([]);
    setDeletedBuiltinCats(allCategories); // suppress all from reappearing
    setClearAllCatsConfirm(false);
    toast(`All categories and items removed`, "info");
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast("Item name is required", "error"); return; }
    let saveData = { ...form };
    if (form.variants?.length) {
      // Only keep variants that have a price filled in
      const filledVariants = form.variants.filter((v) => v.price > 0);
      if (filledVariants.length === 0) { toast("At least one variant price is required", "error"); return; }
      saveData = { ...saveData, variants: filledVariants, price: filledVariants[0].price };
    } else {
      if (form.price <= 0) { toast("Price must be greater than 0", "error"); return; }
    }
    if (editingItem) {
      updateItem(editingItem.id, saveData);
      toast("Item updated!", "success");
    } else {
      addItem(saveData);
      toast("Item added to menu!", "success");
    }
    setModalOpen(false);
  };

  // After deleting item(s), clean up any categories that now have no items
  const cleanupEmptyCategories = (remainingItems: typeof items) => {
    const occupied = new Set(remainingItems.map((i) => i.category));
    setCustomCats((prev) => prev.filter((c) => occupied.has(c)));
    setDeletedBuiltinCats((prev) => [
      ...prev,
      ...allCategories.filter((c) => !occupied.has(c) && !prev.includes(c)),
    ]);
  };

  const handleDelete = (id: string) => {
    const remaining = items.filter((i) => i.id !== id);
    deleteItem(id);
    cleanupEmptyCategories(remaining);
    setDeleteConfirm(null);
    toast("Item removed from menu", "info");
  };

  const update = (field: keyof typeof form, val: unknown) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  // catStats only shows categories that have items or were explicitly added as custom
  const catStats = allCategories
    .filter((c) => items.some((i) => i.category === c) || customCats.includes(c))
    .map((cat) => ({
      name: cat,
      count: items.filter((i) => i.category === cat).length,
      available: items.filter((i) => i.category === cat && i.available).length,
    }));

  return (
    <AppShell title="Menu Management" subtitle={`${items.length} items · ${items.filter(i => i.available).length} available`}>
      {/* Tabs */}
      <div className="tab-list">
        <button
          className={`tab-btn ${activeTab === "items" ? "active" : ""}`}
          onClick={() => setActiveTab("items")}
          style={{ display: "flex", alignItems: "center", gap: 7 }}
        >
          <ListChecks size={15} weight={activeTab === "items" ? "fill" : "regular"} />
          Menu Items
        </button>
        <button
          className={`tab-btn ${activeTab === "categories" ? "active" : ""}`}
          onClick={() => setActiveTab("categories")}
          style={{ display: "flex", alignItems: "center", gap: 7 }}
        >
          <ChartPieSlice size={15} weight={activeTab === "categories" ? "fill" : "regular"} />
          Categories
        </button>
      </div>

      {activeTab === "items" && (
        <>
          <div className="page-header">
            <div>
              <p className="page-subtitle">Add, edit, and manage your restaurant menu</p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div className="search-bar">
                <MagnifyingGlass size={16} weight="regular" className="search-icon" />
                <input
                  id="menu-search"
                  placeholder="Search items…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: 200 }}
                />
              </div>
              {items.length > 0 && (
                <button className="btn btn-ghost" onClick={() => setClearAllConfirm(true)} style={{ gap: 6, color: "#EF4444", borderColor: "#EF4444" }}>
                  <Trash size={15} weight="regular" /> Clear All
                </button>
              )}
              <button id="menu-add-item" className="btn btn-primary" onClick={openAdd} style={{ gap: 6 }}>
                <Plus size={16} weight="bold" /> Add Item
              </button>
            </div>
          </div>

          {/* Category filter */}
          <div className="chip-row" style={{ marginBottom: 16 }}>
            {categories.map((cat) => (
              <button key={cat} className={`pill ${activeCat === cat ? "active" : ""}`} onClick={() => setActiveCat(cat)}>
                {cat}
              </button>
            ))}
          </div>

          <div className="card" style={{ animation: "fadeUp 0.4s ease" }}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Availability</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 42, height: 42, borderRadius: 10, background: "linear-gradient(135deg, var(--cream), var(--cream-dark))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, border: "1px solid var(--border)" }}>
                            {item.image}
                          </div>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <p style={{ fontWeight: 700, fontSize: 13 }}>{item.name}</p>
                              {item.variants?.length && (
                                <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 5px", borderRadius: 4, background: "var(--primary)", color: "white", letterSpacing: "0.03em" }}>
                                  SIZES
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: 11, color: "var(--gray)", marginTop: 1 }}>{item.description.slice(0, 38)}{item.description.length > 38 ? "…" : ""}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-gray">{item.category}</span></td>
                      <td>
                        {item.variants?.length ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {item.variants.map((v) => (
                              <div key={v.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{
                                  fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, minWidth: 32, textAlign: "center",
                                  background: v.label === "Qtr" ? "rgba(242,106,33,0.1)" : v.label === "Half" ? "rgba(124,58,237,0.1)" : "rgba(76,175,80,0.1)",
                                  color: v.label === "Qtr" ? "#F26A21" : v.label === "Half" ? "#7C3AED" : "#4CAF50",
                                }}>
                                  {v.label}
                                </span>
                                <strong style={{ color: "var(--primary)", fontFamily: "var(--font-heading)", fontSize: 13 }}>₹{v.price}</strong>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <strong style={{ color: "var(--primary)", fontFamily: "var(--font-heading)", fontSize: 14 }}>₹{item.price}</strong>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => toggleAvailability(item.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px 8px",
                            borderRadius: 8,
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gray-lighter)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                        >
                          {item.available ? (
                            <>
                              <ToggleRight size={22} weight="fill" color="var(--secondary)" />
                              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--secondary)" }}>Available</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft size={22} weight="fill" color="var(--gray)" />
                              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--gray)" }}>Unavailable</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="btn btn-ghost btn-icon-sm"
                            onClick={() => openEdit(item)}
                            title="Edit item"
                            style={{ color: "var(--primary)" }}
                          >
                            <PencilSimple size={15} weight="regular" />
                          </button>
                          <button
                            className="btn btn-ghost btn-icon-sm"
                            onClick={() => setDeleteConfirm(item.id)}
                            title="Delete item"
                            style={{ color: "#EF4444" }}
                          >
                            <Trash size={15} weight="regular" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">
                    <ForkKnife size={28} weight="regular" />
                  </div>
                  <p style={{ fontWeight: 600 }}>No items found</p>
                  <p style={{ fontSize: 13, color: "var(--gray)" }}>Try a different search or category</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === "categories" && (
        <div>
          <div className="page-header">
            <p className="page-subtitle">Category overview and item distribution</p>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {showAddCat ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
                    <CheckCircle size={14} weight="fill" /> Add
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setShowAddCat(false); setAddCatName(""); }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  {catStats.length > 0 && (
                    <button className="btn btn-ghost" onClick={() => setClearAllCatsConfirm(true)} style={{ gap: 6, color: "#EF4444", borderColor: "#EF4444" }}>
                      <Trash size={15} weight="regular" /> Clear All
                    </button>
                  )}
                  <button className="btn btn-primary" onClick={() => setShowAddCat(true)} style={{ gap: 6 }}>
                    <Plus size={16} weight="bold" /> Add Category
                  </button>
                </>
              )}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {catStats.map((cat) => (
              <div key={cat.name} className="card card-padded" style={{ animation: "fadeUp 0.4s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700 }}>{cat.name}</h3>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span className="badge badge-orange">{cat.count} items</span>
                    <button
                      className="btn btn-ghost btn-icon-sm"
                      onClick={() => setDeleteCatConfirm(cat.name)}
                      title={`Delete "${cat.name}" category`}
                      style={{ color: "#EF4444" }}
                    >
                      <Trash size={13} weight="regular" />
                    </button>
                  </div>
                </div>
                <div className="progress-bar" style={{ marginBottom: 8 }}>
                  <div className="progress-fill" style={{ width: cat.count ? `${(cat.available / cat.count) * 100}%` : "0%", background: "var(--secondary)" }} />
                </div>
                <p style={{ fontSize: 12, color: "var(--gray)", display: "flex", gap: 12 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle size={13} weight="fill" color="var(--secondary)" />
                    <strong>{cat.available}</strong> available
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <XCircle size={13} weight="fill" color="var(--gray)" />
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
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} style={{ gap: 6 }}>
              <CheckCircle size={15} weight="fill" />
              {editingItem ? "Save Changes" : "Add Item"}
            </button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 8 }}>
          <div className="form-group">
            <label className="form-label">Icon / Emoji</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => update("image", e)}
                  style={{
                    width: 36, height: 36, borderRadius: 8, fontSize: 18, cursor: "pointer",
                    border: form.image === e ? "2px solid var(--primary)" : "1.5px solid var(--border)",
                    background: form.image === e ? "var(--primary-10)" : "var(--white)",
                    transition: "all 0.15s ease",
                    boxShadow: form.image === e ? "var(--shadow-orange)" : "none",
                  }}
                >
                  {e}
                </button>
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
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                Availability
                <button
                  type="button"
                  onClick={() => update("available", !form.available)}
                  style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0 }}
                >
                  {form.available ? (
                    <ToggleRight size={28} weight="fill" color="var(--secondary)" />
                  ) : (
                    <ToggleLeft size={28} weight="fill" color="var(--gray)" />
                  )}
                  <span style={{ fontSize: 12, fontWeight: 600, color: form.available ? "var(--secondary)" : "var(--gray)" }}>
                    {form.available ? "Available" : "Unavailable"}
                  </span>
                </button>
              </label>
            </div>
          </div>

          {/* Price / Variants section */}
          <div className="form-group">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <label className="form-label" style={{ marginBottom: 0 }}>
                {form.variants?.length ? "Size Variants (₹)" : "Price (₹) *"}
              </label>
              <button
                type="button"
                onClick={() => {
                  if (form.variants?.length) {
                    // Switch back to single price
                    update("variants", undefined);
                  } else {
                    // Switch to variants mode — seed with existing price as Qtr
                    update("variants", [
                      { label: "Qtr", price: form.price || 0 },
                      { label: "Half", price: 0 },
                      { label: "Full", price: 0 },
                    ]);
                  }
                }}
                style={{
                  fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, cursor: "pointer",
                  border: "1.5px solid var(--border)", background: "var(--white)", color: "var(--primary)",
                  fontFamily: "inherit",
                }}
              >
                {form.variants?.length ? "Switch to single price" : "+ Add size variants"}
              </button>
            </div>
            {form.variants?.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {form.variants.map((v, idx) => (
                  <div key={v.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 800, width: 36, textAlign: "center",
                      padding: "4px 0", borderRadius: 6,
                      background: v.label === "Qtr" ? "rgba(242,106,33,0.1)" : v.label === "Half" ? "rgba(124,58,237,0.1)" : "rgba(76,175,80,0.1)",
                      color: v.label === "Qtr" ? "#F26A21" : v.label === "Half" ? "#7C3AED" : "#4CAF50",
                      flexShrink: 0,
                    }}>
                      {v.label}
                    </span>
                    <input
                      className="form-input"
                      type="number"
                      min={0}
                      placeholder="0"
                      value={v.price || ""}
                      onChange={(e) => {
                        const newVariants = [...(form.variants ?? [])];
                        newVariants[idx] = { ...newVariants[idx], price: Number(e.target.value) };
                        update("variants", newVariants);
                        // Keep base price in sync with first variant
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
              className="form-input"
              rows={2}
              placeholder="Brief description of the item…"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              style={{ resize: "none" }}
            />
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Item"
        maxWidth={380}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm!)} style={{ gap: 6 }}>
              <Trash size={14} weight="fill" /> Delete
            </button>
          </>
        }
      >
        <p style={{ fontSize: 14, color: "var(--gray)", paddingBottom: 8 }}>
          Are you sure you want to delete this menu item? This action cannot be undone.
        </p>
      </Modal>

      {/* Delete Category confirm */}
      <Modal
        open={!!deleteCatConfirm}
        onClose={() => setDeleteCatConfirm(null)}
        title="Delete Category"
        maxWidth={400}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setDeleteCatConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDeleteCategory(deleteCatConfirm!)} style={{ gap: 6 }}>
              <Trash size={14} weight="fill" /> Delete Category
            </button>
          </>
        }
      >
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", paddingBottom: 8 }}>
          <Warning size={28} weight="fill" color="#EF4444" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: 14, color: "var(--gray)", lineHeight: 1.6 }}>
            This will permanently delete the <strong style={{ color: "var(--charcoal)" }}>"{deleteCatConfirm}"</strong> category and all <strong style={{ color: "var(--charcoal)" }}>{items.filter(i => i.category === deleteCatConfirm).length} items</strong> in it. This cannot be undone.
          </p>
        </div>
      </Modal>

      {/* Clear All Categories confirm */}
      <Modal
        open={clearAllCatsConfirm}
        onClose={() => setClearAllCatsConfirm(false)}
        title="Clear All Categories"
        maxWidth={400}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setClearAllCatsConfirm(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleClearAllCategories} style={{ gap: 6 }}>
              <Trash size={14} weight="fill" /> Remove All
            </button>
          </>
        }
      >
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", paddingBottom: 8 }}>
          <Warning size={28} weight="fill" color="#EF4444" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: 14, color: "var(--gray)", lineHeight: 1.6 }}>
            This will permanently delete all <strong style={{ color: "var(--charcoal)" }}>{catStats.length} categories</strong> and <strong style={{ color: "var(--charcoal)" }}>{items.length} menu items</strong> within them. This cannot be undone.
          </p>
        </div>
      </Modal>

      {/* Clear All Items confirm */}
      <Modal
        open={clearAllConfirm}
        onClose={() => setClearAllConfirm(false)}
        title="Clear All Items"
        maxWidth={400}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setClearAllConfirm(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleClearAll} style={{ gap: 6 }}>
              <Trash size={14} weight="fill" /> Remove All
            </button>
          </>
        }
      >
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", paddingBottom: 8 }}>
          <Warning size={28} weight="fill" color="#EF4444" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: 14, color: "var(--gray)", lineHeight: 1.6 }}>
            This will permanently delete all <strong style={{ color: "var(--charcoal)" }}>{items.length} menu items</strong>. This action cannot be undone.
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
