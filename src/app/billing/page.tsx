"use client";

import React, { useState, useMemo, useCallback } from "react";
import AppShell from "@/components/AppShell";
import Modal from "@/components/Modal";
import { AuthProvider } from "@/context/AuthContext";
import { MenuProvider, useMenu } from "@/context/MenuContext";
import { OrderProvider, useOrders } from "@/context/OrderContext";
import { ToastProvider, useToast } from "@/components/Toast";
import { CATEGORIES } from "@/data/mockData";
import { MenuItem } from "@/context/MenuContext";
import {
  MagnifyingGlass, Plus, Minus, Trash, Printer,
  DownloadSimple, ArrowCounterClockwise, CheckCircle,
  Money, CreditCard, DeviceMobile, Wallet,
  ShoppingCart, Tag, Receipt, SealPercent, XCircle, ArrowRight,
} from "@phosphor-icons/react";

type CartItem = MenuItem & { qty: number };

function VariantPicker({ item, onSelect, onClose }: { item: MenuItem; onSelect: (v: { label: string; price: number }) => void; onClose: () => void; }) {
  const variants = item.variants!;
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)", animation: "fadeIn 0.2s ease" }} />
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, marginLeft: "auto", marginRight: "auto", width: "100%", maxWidth: 480, background: "var(--bg)", borderTop: "1px solid var(--line)", zIndex: 1001, animation: "sheetUp 0.28s cubic-bezier(0.32,0.72,0,1)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 32, height: 3, borderRadius: 99, background: "var(--line)" }} />
        </div>
        <div style={{ padding: "12px 22px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 32 }}>{item.image}</span>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>{item.name}</p>
            <p className="muted" style={{ fontSize: 12, marginTop: 2 }}>Select a portion size</p>
          </div>
        </div>
        <div style={{ padding: "12px 16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
          {variants.map((v) => (
            <button key={v.label} onClick={() => { onSelect(v); onClose(); }}
              className="btn btn-outline"
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", width: "100%", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="badge">{v.label}</span>
                <span style={{ fontWeight: 500, fontSize: 14 }}>{v.label === "Qtr" ? "Quarter" : v.label === "Half" ? "Half" : "Full"}</span>
              </div>
              <span className="mono" style={{ fontWeight: 700, fontSize: 18 }}>₹{v.price}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function BillingContent() {
  const { items } = useMenu();
  const { addOrder } = useOrders();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState("Cash");
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState<Awaited<ReturnType<typeof addOrder>> | null>(null);
  const [mobileTab, setMobileTab] = useState<"menu" | "cart" | "summary">("menu");
  const [variantItem, setVariantItem] = useState<MenuItem | null>(null);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat = activeCategory === "All" || item.category === activeCategory;
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [items, search, activeCategory]);

  const addToCart = useCallback((item: MenuItem) => {
    if (!item.available) return;
    if (item.variants && item.variants.length > 0) { setVariantItem(item); return; }
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const addVariantToCart = useCallback((item: MenuItem, variant: { label: string; price: number }) => {
    const cartId = `${item.id}__${variant.label}`;
    setCart((prev) => {
      const existing = prev.find((c) => c.id === cartId);
      if (existing) return prev.map((c) => c.id === cartId ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, id: cartId, name: `${item.name} (${variant.label})`, price: variant.price, qty: 1 }];
    });
  }, []);

  const updateQty = useCallback((id: string, delta: number) => {
    setCart((prev) => prev.map((c) => c.id === id ? { ...c, qty: c.qty + delta } : c).filter((c) => c.qty > 0));
  }, []);

  const removeItem = useCallback((id: string) => { setCart((prev) => prev.filter((c) => c.id !== id)); }, []);

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discountAmount = Math.min(discount, subtotal);
  const total = subtotal - discountAmount;

  const handleCompleteOrder = async () => {
    if (cart.length === 0) { toast("Add items to cart first", "error"); return; }
    try {
      const order = await addOrder({ items: cart, subtotal: Math.round(subtotal), tax: 0, discount: discountAmount, total: Math.round(total), paymentMethod: payment });
      setLastOrder(order); setShowReceipt(true);
      toast("Order completed successfully!", "success");
    } catch { toast("Failed to complete order. Please try again.", "error"); }
  };

  const resetOrder = () => { setCart([]); setDiscount(0); setPayment("Cash"); setShowReceipt(false); setLastOrder(null); };

  const paymentMethods = [
    { id: "Cash", icon: <Money size={20} weight="duotone" />, label: "Cash" },
    { id: "Card", icon: <CreditCard size={20} weight="duotone" />, label: "Card" },
    { id: "UPI", icon: <DeviceMobile size={20} weight="duotone" />, label: "UPI" },
    { id: "Wallet", icon: <Wallet size={20} weight="duotone" />, label: "Wallet" },
  ];

  const categories = CATEGORIES.filter((c) => c === "All" || items.some((i) => i.category === c));

  return (
    <AppShell title="Billing." subtitle="Fast & accurate order processing">

      <div className="billing-mobile-tabs">
        <button className={`billing-tab ${mobileTab === "menu" ? "active" : ""}`} onClick={() => setMobileTab("menu")}>Menu</button>
        <button className={`billing-tab ${mobileTab === "cart" ? "active" : ""}`} onClick={() => setMobileTab("cart")}>
          Cart {cart.length > 0 && <span className="billing-tab-badge">{cart.length}</span>}
        </button>
      </div>

      <div className="billing-layout">
        {/* LEFT: Menu panel */}
        <div className={`billing-panel billing-panel-menu ${mobileTab === "menu" ? "mob-visible" : ""}`}>
          <div className="billing-panel-header" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="search" style={{ flex: 1 }}>
              <MagnifyingGlass size={15} color="var(--muted)" />
              <input id="billing-search" placeholder="Search menu items…" value={search} onChange={(e) => setSearch(e.target.value)} />
              <span className="kbd">⌘K</span>
            </div>
            <div className="cats">
              {categories.map((cat) => (
                <button key={cat} className={`cat-chip ${activeCategory === cat ? "active" : ""}`} onClick={() => setActiveCategory(cat)}>
                  {cat}
                  <span className="n">{cat === "All" ? items.length : items.filter(i => i.category === cat).length}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="billing-panel-body">
            {filteredItems.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><MagnifyingGlass size={22} /></div>
                <p style={{ fontWeight: 600 }}>No items found</p>
                <p>Try a different search or category</p>
              </div>
            ) : (
              <div className="menu-grid">
                {filteredItems.map((item) => {
                  const hasVariants = item.variants && item.variants.length > 0;
                  const variantQtyTotal = hasVariants ? cart.filter((c) => c.id.startsWith(`${item.id}__`)).reduce((s, c) => s + c.qty, 0) : 0;
                  const singleQty = !hasVariants ? cart.find((c) => c.id === item.id)?.qty : 0;
                  const inCart = hasVariants ? variantQtyTotal > 0 : !!singleQty;
                  return (
                    <div key={item.id} className={`menu-card ${!item.available ? "unavailable" : ""}`} onClick={() => addToCart(item)}>
                      <div className="swatch">
                        <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 28 }}>{item.image}</span>
                        {hasVariants && <span style={{ position: "absolute", top: 6, right: 6, fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "0.12em", background: "var(--ink)", color: "var(--bg)", padding: "2px 5px" }}>SIZES</span>}
                        {inCart && <span style={{ position: "absolute", top: 6, left: 6, background: "var(--ink)", color: "var(--bg)", borderRadius: 99, fontFamily: "var(--mono)", fontSize: 10, fontWeight: 600, padding: "2px 7px" }}>×{hasVariants ? variantQtyTotal : singleQty}</span>}
                      </div>
                      <p className="name">{item.name}</p>
                      <div className="meta">
                        <span className="price">{hasVariants ? `from ₹${item.variants![0].price}` : `₹${item.price}`}</span>
                        {hasVariants ? <span className="sz">{item.variants!.length} sizes</span> : <Plus size={13} weight="bold" color="var(--muted)" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* CENTER: Cart */}
        <div className={`billing-panel billing-panel-cart${mobileTab === "cart" ? " mob-visible" : ""}`}>
          <div className="cart-head">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ShoppingCart size={15} weight="fill" />
              <span style={{ fontWeight: 600, fontSize: 14 }}>Cart</span>
              {cart.length > 0 && <span className="badge solid" style={{ fontSize: 10 }}>{cart.length}</span>}
            </div>
            {cart.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={() => setCart([])} style={{ color: "#ef4444", gap: 4 }}>
                <XCircle size={13} weight="fill" /> Clear
              </button>
            )}
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="cart-empty">
                <ShoppingCart size={28} color="var(--muted)" style={{ margin: "0 auto 10px" }} />
                <p>Cart is empty</p>
                <p style={{ fontSize: 11, marginTop: 4 }}>Click menu items to add them</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div>
                    <p className="name">{item.name}</p>
                    <p className="sz">₹{item.price} each</p>
                  </div>
                  <span className="price">₹{(item.price * item.qty).toLocaleString("en-IN")}</span>
                  <div className="qty">
                    <button onClick={() => updateQty(item.id, -1)}><Minus size={10} weight="bold" /></button>
                    <span className="n">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)}><Plus size={10} weight="bold" /></button>
                  </div>
                  <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4, transition: "color 120ms ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}>
                    <Trash size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Summary */}
        <div className={`billing-panel billing-panel-summary${mobileTab === "summary" ? " mob-visible" : ""}`}>
          <div className="cart-head">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Tag size={14} weight="fill" />
              <span style={{ fontWeight: 600, fontSize: 14 }}>Order Summary</span>
            </div>
          </div>
          <div className="cart-foot" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
            {/* Totals */}
            <div className="tot-row"><span>Subtotal</span><span className="v">₹{subtotal.toLocaleString("en-IN")}</span></div>
            <div className="tot-row">
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <SealPercent size={13} weight="fill" /> Discount
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ color: "var(--muted)" }}>₹</span>
                <input type="number" min={0} max={subtotal} value={discount} onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                  style={{ width: 56, border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: "3px 7px", fontSize: 13, textAlign: "right", outline: "none", fontFamily: "var(--mono)", background: "var(--bg)" }} />
              </div>
            </div>
            <div className="tot-row grand">
              <span>Total</span>
              <span className="v">₹{Math.round(total).toLocaleString("en-IN")}</span>
            </div>

            {/* Payment methods */}
            <p className="eyebrow" style={{ marginTop: 16, marginBottom: 10 }}>Payment Method</p>
            <div className="pay-grid">
              {paymentMethods.map((m) => (
                <button key={m.id} className={`pay ${payment === m.id ? "active" : ""}`} onClick={() => setPayment(m.id)}>
                  {m.icon}
                  <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.06em" }}>{m.label}</span>
                </button>
              ))}
            </div>

            {/* CTA */}
            <button id="billing-complete-order" className="btn btn-primary" onClick={handleCompleteOrder} disabled={cart.length === 0}
              style={{ width: "100%", justifyContent: "center", padding: "13px 18px", fontSize: 14, gap: 10, marginTop: 4 }}>
              <CheckCircle size={18} weight="fill" />
              Complete Order
              <ArrowRight size={14} weight="bold" />
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowReceipt(true)} disabled={!lastOrder} style={{ fontSize: 11, gap: 4 }}>
                <Printer size={13} /> Print
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowReceipt(true)} disabled={!lastOrder} style={{ fontSize: 11, gap: 4 }}>
                <DownloadSimple size={13} /> Invoice
              </button>
              <button className="btn btn-ghost btn-sm" onClick={resetOrder} style={{ fontSize: 11, gap: 4 }}>
                <ArrowCounterClockwise size={13} /> New
              </button>
            </div>
          </div>
        </div>
      </div>

      {variantItem && (
        <VariantPicker item={variantItem} onSelect={(v) => addVariantToCart(variantItem, v)} onClose={() => setVariantItem(null)} />
      )}

      {/* Receipt Modal */}
      <Modal open={showReceipt} onClose={() => setShowReceipt(false)} title="Order Receipt" maxWidth={420}
        footer={
          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <button className="btn btn-outline" style={{ flex: 1, gap: 6 }}><Printer size={13} /> Print</button>
            <button className="btn btn-primary" style={{ flex: 1, gap: 6 }} onClick={resetOrder}><Receipt size={13} weight="fill" /> New Order</button>
          </div>
        }>
        {lastOrder && (
          <div className="receipt">
            <div className="rc-logo">
              <p className="name">MARGROS POS</p>
              <p className="sub">Smart Billing for Smart Restaurants</p>
            </div>
            <div className="rc-meta">
              <span className="k">Order #</span><span>{lastOrder.orderNumber}</span>
              <span className="k">Date</span><span>{new Date(lastOrder.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
              <span className="k">Time</span><span>{new Date(lastOrder.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
              <span className="k">Payment</span><span>{lastOrder.payment}</span>
            </div>
            <div className="rc-items">
              {lastOrder.items.map((item) => (
                <div key={item.id} className="row">
                  <span>{item.name}</span>
                  <span>×{item.qty}</span>
                  <span>₹{(item.price * item.qty).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
            <div className="rc-tot">
              <div className="row"><span>Subtotal</span><span>₹{lastOrder.subtotal.toLocaleString("en-IN")}</span></div>
              {lastOrder.discount > 0 && <div className="row"><span>Discount</span><span>-₹{lastOrder.discount.toLocaleString("en-IN")}</span></div>}
              <div className="row grand"><span>Total</span><span>₹{lastOrder.total.toLocaleString("en-IN")}</span></div>
            </div>
            <div className="rc-foot">Thank you for visiting · MARGROS POS</div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}

export default function BillingPage() {
  return (
    <AuthProvider><MenuProvider><OrderProvider><ToastProvider><BillingContent /></ToastProvider></OrderProvider></MenuProvider></AuthProvider>
  );
}
