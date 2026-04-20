"use client";

import React, { useState, useRef, useCallback } from "react";
import AppShell from "@/components/AppShell";
import { AuthProvider } from "@/context/AuthContext";
import { MenuProvider, useMenu } from "@/context/MenuContext";
import { OrderProvider } from "@/context/OrderContext";
import { ToastProvider, useToast } from "@/components/Toast";
import { CATEGORIES } from "@/data/mockData";
import {
  UploadSimple, Sparkle, CheckCircle, PencilSimple, Trash,
  FloppyDisk, Image as ImageIcon, Robot, ArrowRight, ArrowCounterClockwise, ForkKnife,
} from "@phosphor-icons/react";

type UploadStep = "idle" | "uploading" | "processing" | "preview" | "done";

interface ExtractedVariant { label: string; price: number; }
interface ExtractedItem { id: string; name: string; price: number; category: string; selected: boolean; variants?: ExtractedVariant[]; }

function AIUploadContent() {
  const { addItem } = useMenu();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<UploadStep>("idle");
  const [dragover, setDragover] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [items, setItems] = useState<ExtractedItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const compressImage = (file: File): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX = 1200;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Canvas toBlob failed")), "image/jpeg", 0.85);
      };
      img.onerror = reject;
      img.src = url;
    });

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) { toast("Please upload an image file", "error"); return; }
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setStep("uploading");
    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append("image", compressed, "menu.jpg");
      setStep("processing");
      const res = await fetch("/api/ai/menu-upload", { method: "POST", body: formData });
      if (!res.ok) { const err = await res.json().catch(() => ({})); toast(err.error || "AI extraction failed. Please try again.", "error"); setStep("idle"); return; }
      const data = await res.json();
      const extracted: ExtractedItem[] = (data.items || []).map(
        (item: { name: string; price: number; category: string; variants?: ExtractedVariant[] }, idx: number) => ({
          id: `e${Date.now()}_${idx}`, name: item.name, price: item.price, category: item.category,
          selected: true, variants: item.variants?.length ? item.variants : undefined,
        })
      );
      if (extracted.length === 0) { toast("No items could be extracted from this image. Try a clearer menu photo.", "error"); setStep("idle"); return; }
      setItems(extracted);
      setStep("preview");
    } catch { toast("Network error. Please check your connection and try again.", "error"); setStep("idle"); }
  }, [toast]);

  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setDragover(false); const file = e.dataTransfer.files[0]; if (file) processFile(file); };
  const updateItem = (id: string, field: keyof ExtractedItem, val: unknown) => setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: val } : item)));
  const removeItem = (id: string) => setItems((prev) => prev.filter((item) => item.id !== id));

  const handleImport = () => {
    const selected = items.filter((i) => i.selected);
    selected.forEach((item) => addItem({ name: item.name, category: item.category, price: item.price, tax: 5, description: "Imported via AI from menu image", image: "🍽️", available: true, variants: item.variants }));
    toast(`${selected.length} items imported to menu!`, "success");
    setStep("done");
  };

  const reset = () => { setStep("idle"); setPreview(null); setItems([]); setEditingId(null); };

  const stepNums: Record<UploadStep, number> = { idle: 1, uploading: 2, processing: 2, preview: 3, done: 4 };
  const current = stepNums[step];
  const stepList = [{ num: 1, label: "Upload" }, { num: 2, label: "Scanning" }, { num: 3, label: "Review" }, { num: 4, label: "Done" }];

  return (
    <AppShell title="AI Menu Upload." subtitle="Upload a menu image — AI extracts items, categories & size variants">
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Step Indicator */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 40, justifyContent: "center" }} className="step-indicator">
          {stepList.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className={`step-item ${current === s.num ? "active" : ""} ${current > s.num ? "completed" : ""}`}>
                <div className="step-circle">
                  {current > s.num ? <CheckCircle size={16} weight="fill" /> : s.num}
                </div>
                <span className="step-label">{s.label}</span>
              </div>
              {i < stepList.length - 1 && (
                <div style={{ flex: 1, height: 1, background: current > s.num ? "var(--ink)" : "var(--line)", margin: "0 4px", marginBottom: 18, transition: "background 0.3s ease" }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Idle — Drop Zone */}
        {step === "idle" && (
          <>
            <div
              className={`drop-zone ${dragover ? "dragover" : ""}`}
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
              onDragLeave={() => setDragover(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="drop-zone-icon"><ImageIcon size={28} /></div>
              <h3 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 8 }}>Drop your menu image here</h3>
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24 }}>Supports JPG, PNG, WEBP · Max 10MB</p>
              <button className="btn btn-primary btn-lg" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} style={{ gap: 8 }}>
                <UploadSimple size={16} weight="bold" /> Browse Image
              </button>
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 16 }}>AI will extract item names, prices, and categories automatically</p>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginTop: 28 }}>
              {[
                { Icon: ImageIcon, title: "Upload Menu Image", desc: "Upload a photo of your physical or digital menu" },
                { Icon: Robot, title: "AI Scans It", desc: "AI extracts item names, prices, categories and size variants" },
                { Icon: CheckCircle, title: "Review & Import", desc: "Edit extracted items and import to your live menu" },
              ].map((f, i) => (
                <div key={f.title} className="card card-padded" style={{ textAlign: "center", animation: "fadeUp 0.5s ease" }}>
                  <div style={{ width: 52, height: 52, margin: "0 auto 14px", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
                    <f.Icon size={24} />
                  </div>
                  <p style={{ fontFamily: "var(--mono)", fontSize: 9.5, color: "var(--muted)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>STEP {String(i + 1).padStart(2, "0")}</p>
                  <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{f.title}</h3>
                  <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Uploading */}
        {step === "uploading" && (
          <div className="card card-padded" style={{ textAlign: "center", animation: "fadeIn 0.3s ease" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", border: "3px solid var(--line)", borderTopColor: "var(--ink)", animation: "spin 0.8s linear infinite", margin: "20px auto 24px" }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Uploading image…</h3>
            <p style={{ color: "var(--muted)" }}>Please wait while we upload your menu image</p>
          </div>
        )}

        {/* Processing */}
        {step === "processing" && (
          <div style={{ display: "grid", gridTemplateColumns: preview ? "1fr 1fr" : "1fr", gap: 24 }}>
            {preview && (
              <div className="card" style={{ overflow: "hidden", animation: "fadeIn 0.3s ease" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Uploaded menu" style={{ width: "100%", height: 280, objectFit: "cover" }} />
                <div style={{ padding: 14 }}>
                  <p className="eyebrow" style={{ textAlign: "center" }}>Menu image uploaded ✓</p>
                </div>
              </div>
            )}
            <div className="card card-padded" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, animation: "fadeIn 0.3s ease" }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
                  <Sparkle size={40} weight="duotone" />
                </div>
                <div style={{ position: "absolute", inset: -10, borderRadius: "50%", border: "2px solid var(--ink)", opacity: 0.15, animation: "ping 1.5s ease-in-out infinite" }} />
              </div>
              <div style={{ textAlign: "center" }}>
                <h3 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 8 }}>AI is scanning your menu…</h3>
                <p style={{ color: "var(--muted)", fontSize: 13 }}>Extracting item names, prices, and categories</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 260 }}>
                {["Detecting text regions…", "Extracting item names…", "Parsing prices & size variants…", "Categorizing items…"].map((msg, i) => (
                  <div key={msg} style={{ display: "flex", alignItems: "center", gap: 10, opacity: 0, animation: `fadeIn 0.3s ease ${i * 650}ms both` }}>
                    <CheckCircle size={13} weight="fill" color="var(--ink)" />
                    <span style={{ fontSize: 13, color: "var(--muted)" }}>{msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        {step === "preview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp 0.4s ease" }}>
            <div className="card card-padded" style={{ background: "var(--chip)", border: "1px solid var(--line)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckCircle size={20} weight="fill" />
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>AI extraction complete!</p>
                  <p className="muted" style={{ fontSize: 12, marginTop: 2 }}>{items.length} items detected · Review and confirm below</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <ForkKnife size={16} weight="fill" />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>Extracted Items</p>
                    <p className="eyebrow" style={{ marginTop: 2 }}>{items.filter((i) => i.selected).length} of {items.length} selected</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => setItems((prev) => prev.map((i) => ({ ...i, selected: true })))}>Select All</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setItems((prev) => prev.map((i) => ({ ...i, selected: false })))}>None</button>
                </div>
              </div>
              <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}></th>
                      <th>Item Name</th>
                    <th>Category</th>
                    <th>Price (₹)</th>
                    <th>Sizes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} style={{ opacity: item.selected ? 1 : 0.35 }}>
                      <td>
                        <input type="checkbox" checked={item.selected} onChange={(e) => updateItem(item.id, "selected", e.target.checked)}
                          style={{ width: 15, height: 15, cursor: "pointer", accentColor: "var(--ink)" }} />
                      </td>
                      <td>
                        {editingId === item.id ? (
                          <input className="form-input" value={item.name} onChange={(e) => updateItem(item.id, "name", e.target.value)} style={{ padding: "5px 10px", fontSize: 13 }} autoFocus />
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</span>
                            {item.variants?.length && <span className="badge solid" style={{ fontSize: 9 }}>SIZES</span>}
                          </div>
                        )}
                      </td>
                      <td>
                        {editingId === item.id ? (
                          <select className="form-input" value={item.category} onChange={(e) => updateItem(item.id, "category", e.target.value)} style={{ padding: "5px 10px", fontSize: 13 }}>
                            {Array.from(new Set([...CATEGORIES.slice(1), item.category])).map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        ) : (
                          <span className="badge">{item.category}</span>
                        )}
                      </td>
                      <td>
                        {item.variants?.length ? (
                          <span className="muted" style={{ fontSize: 12 }}>—</span>
                        ) : editingId === item.id ? (
                          <input className="form-input" type="number" value={item.price} onChange={(e) => updateItem(item.id, "price", Number(e.target.value))} style={{ padding: "5px 10px", fontSize: 13, width: 80 }} />
                        ) : (
                          <span className="mono" style={{ fontWeight: 600 }}>₹{item.price}</span>
                        )}
                      </td>
                      <td>
                        {item.variants?.length ? (
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {item.variants.map((v) => (
                              <span key={v.label} className="badge" style={{ fontSize: 10 }}>{v.label} ₹{v.price}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="muted" style={{ fontSize: 12 }}>—</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          {editingId === item.id ? (
                            <button className="btn btn-ghost btn-icon-sm" onClick={() => setEditingId(null)} title="Save">
                              <FloppyDisk size={13} weight="fill" />
                            </button>
                          ) : (
                            <button className="btn btn-ghost btn-icon-sm" onClick={() => setEditingId(item.id)} title="Edit">
                              <PencilSimple size={13} />
                            </button>
                          )}
                          <button className="btn btn-ghost btn-icon-sm" onClick={() => removeItem(item.id)} title="Remove" style={{ color: "#ef4444" }}>
                            <Trash size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-outline" onClick={reset} style={{ gap: 6 }}>
                <ArrowCounterClockwise size={14} /> Cancel
              </button>
              <button
                id="ai-confirm-import"
                className="btn btn-primary btn-lg"
                onClick={handleImport}
                disabled={items.filter((i) => i.selected).length === 0}
                style={{ gap: 8 }}
              >
                <CheckCircle size={16} weight="fill" />
                Confirm Import ({items.filter((i) => i.selected).length} items)
                <ArrowRight size={14} weight="bold" />
              </button>
            </div>
          </div>
        )}

        {/* Done */}
        {step === "done" && (
          <div className="card card-padded" style={{ textAlign: "center", animation: "scaleIn 0.4s ease" }}>
            <div style={{ width: 80, height: 80, border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <CheckCircle size={44} weight="fill" color="var(--ink)" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 8 }}>Import Successful</h2>
            <p style={{ color: "var(--muted)", marginBottom: 28, fontSize: 14 }}>Your menu items have been added to MARGROS POS.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button className="btn btn-outline" onClick={reset} style={{ gap: 6 }}><UploadSimple size={14} /> Upload Another</button>
              <a href="/menu" className="btn btn-primary" style={{ gap: 6 }}><ForkKnife size={14} weight="fill" /> Go to Menu</a>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes ping { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2); opacity: 0; } }
      `}</style>
    </AppShell>
  );
}

export default function AIUploadPage() {
  return (
    <AuthProvider><MenuProvider><OrderProvider><ToastProvider><AIUploadContent /></ToastProvider></OrderProvider></MenuProvider></AuthProvider>
  );
}
