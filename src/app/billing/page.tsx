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

type CartItem = MenuItem & { qty: number };
import {
  MagnifyingGlass,
  Plus,
  Minus,
  Trash,
  Printer,
  DownloadSimple,
  ArrowCounterClockwise,
  CheckCircle,
  Money,
  CreditCard,
  DeviceMobile,
  Wallet,
  ShoppingCart,
  Tag,
  Receipt,
  SealPercent,
  XCircle,
  ArrowRight,
} from "@phosphor-icons/react";

// Size picker popup for items with variants
function VariantPicker({
  item,
  onSelect,
  onClose,
}: {
  item: MenuItem;
  onSelect: (variant: { label: string; price: number }) => void;
  onClose: () => void;
}) {
  const variants = item.variants!;
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "fadeIn 0.15s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--white)", borderRadius: 20, padding: "24px 20px",
          minWidth: 280, maxWidth: 360, width: "90%",
          boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
          animation: "scaleIn 0.18s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>{item.image}</div>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 17, fontWeight: 800, color: "var(--charcoal)" }}>
            {item.name}
          </h3>
          <p style={{ fontSize: 11, color: "var(--gray)", marginTop: 3 }}>Tap a size to add to cart</p>
        </div>

        {/* Variant buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {variants.map((v) => (
            <button
              key={v.label}
              onClick={() => { onSelect(v); onClose(); }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 20px", borderRadius: 14,
                border: "2px solid var(--border)",
                background: "var(--white)", cursor: "pointer", transition: "all 0.12s ease",
                fontFamily: "inherit", width: "100%",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--primary)";
                (e.currentTarget as HTMLButtonElement).style.background = "var(--primary-10)";
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLButtonElement).style.background = "var(--white)";
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 15, color: "var(--charcoal)" }}>{v.label}</span>
              <span style={{ fontWeight: 800, fontSize: 20, color: "var(--primary)", fontFamily: "var(--font-heading)" }}>
                ₹{v.price}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
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
    // Items with variants show a size picker instead of directly adding
    if (item.variants && item.variants.length > 0) {
      setVariantItem(item);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const addVariantToCart = useCallback((item: MenuItem, variant: { label: string; price: number }) => {
    // Use a composite cart key: itemId + variant label
    const cartId = `${item.id}__${variant.label}`;
    setCart((prev) => {
      const existing = prev.find((c) => c.id === cartId);
      if (existing) return prev.map((c) => c.id === cartId ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, id: cartId, name: `${item.name} (${variant.label})`, price: variant.price, qty: 1 }];
    });
  }, []);

  const updateQty = useCallback((id: string, delta: number) => {
    setCart((prev) =>
      prev.map((c) => c.id === id ? { ...c, qty: c.qty + delta } : c)
        .filter((c) => c.qty > 0)
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discountAmount = Math.min(discount, subtotal);
  const total = subtotal - discountAmount;

  const handleCompleteOrder = async () => {
    if (cart.length === 0) { toast("Add items to cart first", "error"); return; }
    try {
      const order = await addOrder({
        items: cart,
        subtotal: Math.round(subtotal),
        tax: 0,
        discount: discountAmount,
        total: Math.round(total),
        paymentMethod: payment,
      });
      setLastOrder(order);
      setShowReceipt(true);
      toast("Order completed successfully!", "success");
    } catch {
      toast("Failed to complete order. Please try again.", "error");
    }
  };

  const resetOrder = () => {
    setCart([]);
    setDiscount(0);
    setPayment("Cash");
    setShowReceipt(false);
    setLastOrder(null);
  };

  const paymentMethods = [
    { id: "Cash", icon: <Money size={22} weight="duotone" />, label: "Cash" },
    { id: "Card", icon: <CreditCard size={22} weight="duotone" />, label: "Card" },
    { id: "UPI", icon: <DeviceMobile size={22} weight="duotone" />, label: "UPI" },
    { id: "Wallet", icon: <Wallet size={22} weight="duotone" />, label: "Wallet" },
  ];

  const categories = CATEGORIES.filter((c) => c === "All" || items.some((i) => i.category === c));

  return (
    <AppShell title="Billing" subtitle="Fast & accurate order processing">

      {/* Mobile tab switcher */}
      <div className="billing-mobile-tabs">
        <button
          className={`billing-tab ${mobileTab === "menu" ? "active" : ""}`}
          onClick={() => setMobileTab("menu")}
        >
          Menu
        </button>
        <button
          className={`billing-tab ${mobileTab === "cart" ? "active" : ""}`}
          onClick={() => setMobileTab("cart")}
        >
          Cart
          {cart.length > 0 && (
            <span className="billing-tab-badge">{cart.length}</span>
          )}
        </button>
        <button
          className={`billing-tab ${mobileTab === "summary" ? "active" : ""}`}
          onClick={() => setMobileTab("summary")}
        >
          Summary
        </button>
      </div>

      <div className="billing-layout">
        {/* LEFT: Menu */}
        <div className={`billing-panel billing-panel-menu${mobileTab === "menu" ? " mob-visible" : ""}`}>
          <div className="billing-panel-header">
            <div className="search-bar" style={{ marginBottom: 10 }}>
              <MagnifyingGlass size={16} weight="regular" className="search-icon" />
              <input
                id="billing-search"
                placeholder="Search menu items…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="chip-row">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`pill ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                  style={{ fontSize: 12 }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="billing-panel-body">
            {filteredItems.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <MagnifyingGlass size={28} weight="regular" />
                </div>
                <p style={{ fontWeight: 600, color: "var(--charcoal)" }}>No items found</p>
                <p style={{ fontSize: 13, color: "var(--gray)" }}>Try a different search or category</p>
              </div>
            ) : (
              <div className="menu-items-grid">
                {filteredItems.map((item) => {
                  const hasVariants = item.variants && item.variants.length > 0;
                  // For variant items, count how many variant lines are in cart
                  const variantQtyTotal = hasVariants
                    ? cart.filter((c) => c.id.startsWith(`${item.id}__`)).reduce((s, c) => s + c.qty, 0)
                    : 0;
                  const singleQty = !hasVariants ? cart.find((c) => c.id === item.id)?.qty : 0;
                  const inCart = hasVariants ? variantQtyTotal > 0 : !!singleQty;

                  return (
                  <div
                    key={item.id}
                    className={`menu-item-card ${!item.available ? "unavailable" : ""}`}
                    onClick={() => addToCart(item)}
                  >
                    <div style={{ position: "relative", background: "linear-gradient(135deg, var(--cream), var(--cream-dark))", padding: "16px 0", textAlign: "center", fontSize: 28 }}>
                      {item.image}
                      {hasVariants && (
                        <div style={{
                          position: "absolute", top: 6, right: 6,
                          background: "var(--primary)", color: "white",
                          fontSize: 9, fontWeight: 800, borderRadius: 4,
                          padding: "2px 5px", letterSpacing: "0.03em",
                        }}>
                          SIZES
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "8px 10px 10px" }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "var(--charcoal)", marginBottom: 2, lineHeight: 1.3 }}>
                        {item.name}
                      </p>
                      {hasVariants && (
                        <p style={{ fontSize: 10, color: "var(--gray)", marginBottom: 2 }}>
                          {item.variants!.map((v) => `${v.label} ₹${v.price}`).join(" · ")}
                        </p>
                      )}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "var(--primary)" }}>
                          {hasVariants ? `from ₹${item.variants![0].price}` : `₹${item.price}`}
                        </span>
                        {inCart ? (
                          <span style={{ background: "var(--primary)", color: "white", borderRadius: 6, padding: "2px 7px", fontSize: 11, fontWeight: 700 }}>
                            ×{hasVariants ? variantQtyTotal : singleQty}
                          </span>
                        ) : (
                          <span style={{ width: 22, height: 22, background: "var(--primary-10)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid rgba(242,106,33,0.2)" }}>
                            <Plus size={12} weight="bold" color="var(--primary)" />
                          </span>
                        )}
                      </div>
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
          <div className="billing-panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ShoppingCart size={17} weight="fill" color="var(--primary)" />
              <span>Cart
                {cart.length > 0 && (
                  <span style={{ marginLeft: 6, background: "var(--primary)", color: "white", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>
                    {cart.length}
                  </span>
                )}
              </span>
            </div>
            {cart.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={() => setCart([])} style={{ color: "#EF4444", fontSize: 12, gap: 4 }}>
                <XCircle size={14} weight="fill" /> Clear
              </button>
            )}
          </div>

          <div className="billing-panel-body" style={{ padding: 0 }}>
            {cart.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <ShoppingCart size={28} weight="regular" />
                </div>
                <p style={{ fontWeight: 600, color: "var(--charcoal)" }}>Cart is empty</p>
                <p style={{ fontSize: 13, color: "var(--gray)" }}>Click menu items to add them</p>
              </div>
            ) : (
              <div>
                {cart.map((item) => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 20, flexShrink: 0 }}>{item.image}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--charcoal)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                      <p style={{ fontSize: 11, color: "var(--gray)", marginTop: 1 }}>₹{item.price} each</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      <button className="qty-btn minus" onClick={() => updateQty(item.id, -1)}>
                        <Minus size={11} weight="bold" />
                      </button>
                      <span className="qty-value">{item.qty}</span>
                      <button className="qty-btn plus" onClick={() => updateQty(item.id, 1)}>
                        <Plus size={11} weight="bold" />
                      </button>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, minWidth: 54 }}>
                      <p style={{ fontSize: 14, fontWeight: 800, color: "var(--charcoal)" }}>₹{(item.price * item.qty).toLocaleString("en-IN")}</p>
                    </div>
                    <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray)", padding: 4, flexShrink: 0, transition: "color 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--gray)")}
                    >
                      <Trash size={15} weight="regular" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Summary */}
        <div className={`billing-panel billing-panel-summary${mobileTab === "summary" ? " mob-visible" : ""}`}>
          <div className="billing-panel-header" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Tag size={16} weight="fill" color="var(--primary)" />
            Order Summary
          </div>
          <div className="billing-panel-body" style={{ display: "flex", flexDirection: "column" }}>
            {/* Totals */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--gray)" }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--secondary-dark)" }}>
                  <SealPercent size={14} weight="fill" color="var(--secondary)" />
                  Discount
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: "var(--gray)" }}>₹</span>
                  <input
                    type="number"
                    min={0}
                    max={subtotal}
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                    style={{ width: 60, border: "1.5px solid var(--border)", borderRadius: 6, padding: "3px 7px", fontSize: 13, textAlign: "right", outline: "none", color: "var(--secondary-dark)", fontWeight: 700 }}
                  />
                </div>
              </div>
              <div className="divider" style={{ margin: "4px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 20, fontFamily: "var(--font-heading)", color: "var(--charcoal)" }}>
                <span>Total</span>
                <span style={{ color: "var(--primary)" }}>₹{Math.round(total).toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Payment */}
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--gray)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
              <CreditCard size={13} weight="fill" color="var(--gray)" />
              Payment Method
            </p>
            <div className="payment-grid" style={{ marginBottom: 16 }}>
              {paymentMethods.map((m) => (
                <button
                  key={m.id}
                  className={`payment-option ${payment === m.id ? "active" : ""}`}
                  onClick={() => setPayment(m.id)}
                >
                  {m.icon}
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            {/* Actions */}
            <button
              id="billing-complete-order"
              className="btn btn-primary w-full btn-lg"
              onClick={handleCompleteOrder}
              disabled={cart.length === 0}
              style={{ marginBottom: 10, gap: 10 }}
            >
              <CheckCircle size={20} weight="fill" />
              Complete Order
              <ArrowRight size={16} weight="bold" />
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowReceipt(true)} disabled={!lastOrder} style={{ fontSize: 11, gap: 4 }}>
                <Printer size={15} weight="regular" /> Print
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowReceipt(true)} disabled={!lastOrder} style={{ fontSize: 11, gap: 4 }}>
                <DownloadSimple size={15} weight="regular" /> Invoice
              </button>
              <button className="btn btn-ghost btn-sm" onClick={resetOrder} style={{ fontSize: 11, color: "var(--rust)", gap: 4 }}>
                <ArrowCounterClockwise size={15} weight="regular" /> New
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Size variant picker popup */}
      {variantItem && (
        <VariantPicker
          item={variantItem}
          onSelect={(v) => addVariantToCart(variantItem, v)}
          onClose={() => setVariantItem(null)}
        />
      )}

      {/* Receipt Modal */}
      <Modal
        open={showReceipt}
        onClose={() => setShowReceipt(false)}
        title="Order Receipt"
        maxWidth={420}
        footer={
          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <button className="btn btn-outline w-full btn-sm" style={{ gap: 6 }}>
              <Printer size={14} weight="regular" /> Print
            </button>
            <button className="btn btn-primary w-full btn-sm" onClick={resetOrder} style={{ gap: 6 }}>
              <Receipt size={14} weight="fill" /> New Order
            </button>
          </div>
        }
      >
        {lastOrder ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ textAlign: "center", borderBottom: "1px dashed var(--border)", paddingBottom: 16 }}>
              <p style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 20, color: "var(--primary)" }}>MARGROS POS</p>
              <p style={{ fontSize: 12, color: "var(--gray)", marginTop: 4 }}>Smart Billing for Smart Restaurants</p>
              <p style={{ fontSize: 13, fontWeight: 700, marginTop: 8 }}>{lastOrder.orderNumber}</p>
              <p style={{ fontSize: 12, color: "var(--gray)" }}>{new Date(lastOrder.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {lastOrder.items.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span>{item.name} <strong style={{ color: "var(--gray)" }}>×{item.qty}</strong></span>
                  <span style={{ fontWeight: 600 }}>₹{(item.price * item.qty).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px dashed var(--border)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--gray)" }}>
                <span>Subtotal</span><span>₹{lastOrder.subtotal.toLocaleString("en-IN")}</span>
              </div>
              {lastOrder.discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--secondary-dark)" }}>
                  <span>Discount</span><span>-₹{lastOrder.discount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 18, color: "var(--charcoal)", marginTop: 4, fontFamily: "var(--font-heading)" }}>
                <span>Total</span><span style={{ color: "var(--primary)" }}>₹{lastOrder.total.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--gray)", marginTop: 4 }}>
                <span>Payment</span><span style={{ fontWeight: 700, color: "var(--charcoal)" }}>{lastOrder.payment}</span>
              </div>
            </div>
            <p style={{ textAlign: "center", fontSize: 12, color: "var(--gray)", borderTop: "1px dashed var(--border)", paddingTop: 12 }}>
              Thank you for visiting! 🙏
            </p>
          </div>
        ) : null}
      </Modal>
    </AppShell>
  );
}

export default function BillingPage() {
  return (
    <AuthProvider>
      <MenuProvider>
        <OrderProvider>
          <ToastProvider>
            <BillingContent />
          </ToastProvider>
        </OrderProvider>
      </MenuProvider>
    </AuthProvider>
  );
}
