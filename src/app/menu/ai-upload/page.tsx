"use client";

import React, { useState, useRef, useCallback } from "react";
import AppShell from "@/components/AppShell";
import { AuthProvider } from "@/context/AuthContext";
import { MenuProvider, useMenu } from "@/context/MenuContext";
import { OrderProvider } from "@/context/OrderContext";
import { ToastProvider, useToast } from "@/components/Toast";
import { CATEGORIES } from "@/data/mockData";
import {
  UploadSimple,
  Sparkle,
  CheckCircle,
  PencilSimple,
  Trash,
  FloppyDisk,
  Image as ImageIcon,
  Robot,
  ArrowRight,
  ArrowCounterClockwise,
  ForkKnife,
} from "@phosphor-icons/react";

type UploadStep = "idle" | "uploading" | "processing" | "preview" | "done";

interface ExtractedVariant {
  label: string;
  price: number;
}

interface ExtractedItem {
  id: string;
  name: string;
  price: number;
  category: string;
  selected: boolean;
  variants?: ExtractedVariant[];
}


function AIUploadContent() {
  const { addItem } = useMenu();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<UploadStep>("idle");
  const [dragover, setDragover] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [items, setItems] = useState<ExtractedItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Resize image to max 1200px on longest side, JPEG 85% quality
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

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast("Please upload an image file", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
      setStep("uploading");

      try {
        // Compress before sending to stay within API limits
        const compressed = await compressImage(file);
        const formData = new FormData();
        formData.append("image", compressed, "menu.jpg");

        setStep("processing");

        const res = await fetch("/api/ai/menu-upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          toast(err.error || "AI extraction failed. Please try again.", "error");
          setStep("idle");
          return;
        }

        const data = await res.json();
        const extracted: ExtractedItem[] = (data.items || []).map(
          (item: { name: string; price: number; category: string; variants?: ExtractedVariant[] }, idx: number) => ({
            id: `e${Date.now()}_${idx}`,
            name: item.name,
            price: item.price,
            category: item.category,
            selected: true,
            variants: item.variants?.length ? item.variants : undefined,
          })
        );

        if (extracted.length === 0) {
          toast("No items could be extracted from this image. Try a clearer menu photo.", "error");
          setStep("idle");
          return;
        }

        setItems(extracted);
        setStep("preview");
      } catch {
        toast("Network error. Please check your connection and try again.", "error");
        setStep("idle");
      }
    },
    [toast]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragover(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const updateItem = (id: string, field: keyof ExtractedItem, val: unknown) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleImport = () => {
    const selected = items.filter((i) => i.selected);
    selected.forEach((item) => {
      addItem({
        name: item.name,
        category: item.category,
        price: item.price,
        tax: 5,
        description: `Imported via AI from menu image`,
        image: "🍽️",
        available: true,
        variants: item.variants,
      });
    });
    toast(`${selected.length} items imported to menu!`, "success");
    setStep("done");
  };

  const reset = () => {
    setStep("idle");
    setPreview(null);
    setItems([]);
    setEditingId(null);
  };

  const stepNums: Record<UploadStep, number> = {
    idle: 1,
    uploading: 2,
    processing: 2,
    preview: 3,
    done: 4,
  };
  const current = stepNums[step];

  const stepList = [
    { num: 1, label: "Upload" },
    { num: 2, label: "Scanning" },
    { num: 3, label: "Review" },
    { num: 4, label: "Done" },
  ];

  return (
    <AppShell
      title="AI Menu Upload"
      subtitle="Upload a menu image — AI extracts items, categories and size variants (Qtr/Half/Full)"
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Step Indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            marginBottom: 36,
            justifyContent: "center",
          }}
        >
          {stepList.map((s, i) => (
            <React.Fragment key={s.num}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 14,
                    transition: "all 0.3s ease",
                    background:
                      current > s.num
                        ? "var(--secondary)"
                        : current === s.num
                        ? "var(--primary)"
                        : "var(--gray-lighter)",
                    color:
                      current >= s.num ? "white" : "var(--gray)",
                    boxShadow:
                      current === s.num ? "var(--shadow-orange)" : "none",
                  }}
                >
                  {current > s.num ? (
                    <CheckCircle size={20} weight="fill" />
                  ) : (
                    s.num
                  )}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color:
                      current >= s.num ? "var(--primary)" : "var(--gray)",
                  }}
                >
                  {s.label}
                </span>
              </div>
              {i < stepList.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    background:
                      current > s.num
                        ? "var(--secondary)"
                        : "var(--border)",
                    margin: "0 4px",
                    marginBottom: 18,
                    transition: "background 0.3s ease",
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Idle */}
        {step === "idle" && (
          <>
            <div
              className={`drop-zone ${dragover ? "dragover" : ""}`}
              onDrop={onDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragover(true);
              }}
              onDragLeave={() => setDragover(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="drop-zone-icon">
                <ImageIcon size={36} weight="duotone" />
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--charcoal)",
                  marginBottom: 8,
                }}
              >
                Drop your menu image here
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--gray)",
                  marginBottom: 24,
                }}
              >
                Supports JPG, PNG, WEBP · Max 10MB
              </p>
              <button
                className="btn btn-primary btn-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                style={{ gap: 8 }}
              >
                <UploadSimple size={18} weight="bold" />
                Browse Image
              </button>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--gray)",
                  marginTop: 16,
                }}
              >
                AI will extract item names, prices, and categories automatically
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) =>
                  e.target.files?.[0] && processFile(e.target.files[0])
                }
              />
            </div>

            {/* How it works */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
                marginTop: 28,
              }}
            >
              {[
                {
                  icon: <ImageIcon size={32} weight="duotone" color="#F26A21" />,
                  title: "Upload Menu Image",
                  desc: "Upload a photo of your physical or digital menu",
                  bg: "rgba(242,106,33,0.08)",
                  border: "rgba(242,106,33,0.15)",
                },
                {
                  icon: <Robot size={32} weight="duotone" color="#7C3AED" />,
                  title: "AI Scans It",
                  desc: "AI extracts item names, prices, categories and size variants (Qtr/Half/Full)",
                  bg: "rgba(124,58,237,0.08)",
                  border: "rgba(124,58,237,0.15)",
                },
                {
                  icon: <CheckCircle size={32} weight="duotone" color="#4CAF50" />,
                  title: "Review & Import",
                  desc: "Edit extracted items and import to your live menu",
                  bg: "rgba(76,175,80,0.08)",
                  border: "rgba(76,175,80,0.15)",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="card card-padded"
                  style={{
                    textAlign: "center",
                    animation: "fadeUp 0.5s ease",
                    background: f.bg,
                    border: `1.5px solid ${f.border}`,
                    boxShadow: "none",
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      margin: "0 auto 16px",
                      background: "rgba(255,255,255,0.8)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    }}
                  >
                    {f.icon}
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: 14,
                      fontWeight: 700,
                      marginBottom: 6,
                    }}
                  >
                    {f.title}
                  </h3>
                  <p style={{ fontSize: 12, color: "var(--gray)", lineHeight: 1.6 }}>
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Uploading */}
        {step === "uploading" && (
          <div
            className="card card-padded"
            style={{ textAlign: "center", animation: "fadeIn 0.3s ease" }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                border: "4px solid var(--border)",
                borderTopColor: "var(--primary)",
                animation: "spin 1s linear infinite",
                margin: "20px auto 24px",
              }}
            />
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700 }}>
              Uploading image…
            </h3>
            <p style={{ color: "var(--gray)", marginTop: 8 }}>
              Please wait while we upload your menu image
            </p>
          </div>
        )}

        {/* Processing */}
        {step === "processing" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: preview ? "1fr 1fr" : "1fr",
              gap: 24,
            }}
          >
            {preview && (
              <div
                className="card"
                style={{ overflow: "hidden", animation: "fadeIn 0.3s ease" }}
              >
                <img
                  src={preview}
                  alt="Uploaded menu"
                  style={{ width: "100%", height: 300, objectFit: "cover" }}
                />
                <div style={{ padding: 16 }}>
                  <p style={{ fontSize: 13, color: "var(--gray)", textAlign: "center" }}>
                    Menu image uploaded ✓
                  </p>
                </div>
              </div>
            )}
            <div
              className="card card-padded"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 20,
                animation: "fadeIn 0.3s ease",
              }}
            >
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, rgba(242,106,33,0.12), rgba(124,58,237,0.1))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Sparkle size={44} weight="duotone" color="var(--primary)" />
                </div>
                <div
                  style={{
                    position: "absolute",
                    inset: -10,
                    borderRadius: "50%",
                    border: "3px solid var(--primary)",
                    opacity: 0.25,
                    animation: "ping 1.5s ease-in-out infinite",
                  }}
                />
              </div>
              <div style={{ textAlign: "center" }}>
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: 22,
                    fontWeight: 700,
                  }}
                >
                  AI is scanning your menu…
                </h3>
                <p style={{ color: "var(--gray)", marginTop: 8, fontSize: 14 }}>
                  Extracting item names, prices, and categories
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  width: "100%",
                  maxWidth: 280,
                }}
              >
                {[
                  "Detecting text regions…",
                  "Extracting item names…",
                  "Parsing prices & size variants…",
                  "Categorizing items…",
                ].map((msg, i) => (
                  <div
                    key={msg}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      opacity: 0,
                      animation: `fadeIn 0.3s ease ${i * 650}ms both`,
                    }}
                  >
                    <CheckCircle
                      size={14}
                      weight="fill"
                      color="var(--secondary)"
                    />
                    <span style={{ fontSize: 13, color: "var(--gray)" }}>
                      {msg}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        {step === "preview" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              animation: "fadeUp 0.4s ease",
            }}
          >
            <div
              className="card card-padded"
              style={{
                background:
                  "linear-gradient(135deg, rgba(76,175,80,0.08), rgba(31,107,58,0.04))",
                border: "1px solid rgba(76,175,80,0.2)",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: 14 }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "var(--secondary-10)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckCircle
                    size={24}
                    weight="fill"
                    color="var(--secondary)"
                  />
                </div>
                <div>
                  <p
                    style={{
                      fontWeight: 700,
                      color: "var(--charcoal)",
                      fontSize: 15,
                    }}
                  >
                    AI extraction complete!
                  </p>
                  <p
                    style={{ fontSize: 13, color: "var(--gray)" }}
                  >{`${items.length} items detected · Review and confirm below`}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <ForkKnife size={18} weight="fill" color="var(--primary)" />
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: 15,
                        fontWeight: 700,
                      }}
                    >
                      Extracted Items
                    </h3>
                    <p style={{ fontSize: 12, color: "var(--gray)", marginTop: 2 }}>
                      {items.filter((i) => i.selected).length} of {items.length}{" "}
                      selected
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() =>
                      setItems((prev) =>
                        prev.map((i) => ({ ...i, selected: true }))
                      )
                    }
                  >
                    Select All
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() =>
                      setItems((prev) =>
                        prev.map((i) => ({ ...i, selected: false }))
                      )
                    }
                  >
                    None
                  </button>
                </div>
              </div>
              <div className="table-wrapper">
                <table>
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
                      <tr
                        key={item.id}
                        style={{ opacity: item.selected ? 1 : 0.4 }}
                      >
                        <td>
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "selected",
                                e.target.checked
                              )
                            }
                            style={{
                              width: 16,
                              height: 16,
                              cursor: "pointer",
                              accentColor: "var(--primary)",
                            }}
                          />
                        </td>
                        <td>
                          {editingId === item.id ? (
                            <input
                              className="form-input"
                              value={item.name}
                              onChange={(e) =>
                                updateItem(item.id, "name", e.target.value)
                              }
                              style={{ padding: "5px 10px", fontSize: 13 }}
                              autoFocus
                            />
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontWeight: 600, fontSize: 13 }}>
                                {item.name}
                              </span>
                              {item.variants?.length && (
                                <span style={{
                                  fontSize: 9, fontWeight: 800, padding: "2px 5px",
                                  borderRadius: 4, background: "var(--primary)",
                                  color: "white", letterSpacing: "0.03em",
                                }}>
                                  SIZES
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          {editingId === item.id ? (
                            <select
                              className="form-input"
                              value={item.category}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "category",
                                  e.target.value
                                )
                              }
                              style={{ padding: "5px 10px", fontSize: 13 }}
                            >
                              {/* Include current category even if not in CATEGORIES list */}
                              {Array.from(new Set([
                                ...CATEGORIES.slice(1),
                                item.category,
                              ])).map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="badge badge-gray">
                              {item.category}
                            </span>
                          )}
                        </td>
                        <td>
                          {item.variants?.length ? (
                            <span style={{ fontSize: 12, color: "var(--gray)" }}>—</span>
                          ) : editingId === item.id ? (
                            <input
                              className="form-input"
                              type="number"
                              value={item.price}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "price",
                                  Number(e.target.value)
                                )
                              }
                              style={{
                                padding: "5px 10px",
                                fontSize: 13,
                                width: 80,
                              }}
                            />
                          ) : (
                            <strong
                              style={{
                                color: "var(--primary)",
                                fontFamily: "var(--font-heading)",
                              }}
                            >
                              ₹{item.price}
                            </strong>
                          )}
                        </td>
                        <td>
                          {item.variants?.length ? (
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                              {item.variants.map((v) => (
                                <span
                                  key={v.label}
                                  style={{
                                    fontSize: 11, fontWeight: 700,
                                    padding: "2px 7px", borderRadius: 5,
                                    background: v.label === "Qtr"
                                      ? "rgba(242,106,33,0.1)" : v.label === "Half"
                                      ? "rgba(124,58,237,0.1)" : "rgba(76,175,80,0.1)",
                                    color: v.label === "Qtr"
                                      ? "#F26A21" : v.label === "Half"
                                      ? "#7C3AED" : "#4CAF50",
                                  }}
                                >
                                  {v.label} ₹{v.price}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: "var(--gray)" }}>—</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            {editingId === item.id ? (
                              <button
                                className="btn btn-ghost btn-icon-sm"
                                onClick={() => setEditingId(null)}
                                style={{ color: "var(--secondary)" }}
                                title="Save"
                              >
                                <FloppyDisk size={14} weight="fill" />
                              </button>
                            ) : (
                              <button
                                className="btn btn-ghost btn-icon-sm"
                                onClick={() => setEditingId(item.id)}
                                style={{ color: "var(--primary)" }}
                                title="Edit"
                              >
                                <PencilSimple size={14} weight="regular" />
                              </button>
                            )}
                            <button
                              className="btn btn-ghost btn-icon-sm"
                              onClick={() => removeItem(item.id)}
                              style={{ color: "#EF4444" }}
                              title="Remove"
                            >
                              <Trash size={14} weight="regular" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={reset} style={{ gap: 6 }}>
                <ArrowCounterClockwise size={15} weight="regular" /> Cancel
              </button>
              <button
                id="ai-confirm-import"
                className="btn btn-primary btn-lg"
                onClick={handleImport}
                disabled={items.filter((i) => i.selected).length === 0}
                style={{ gap: 8 }}
              >
                <CheckCircle size={18} weight="fill" />
                Confirm Import ({items.filter((i) => i.selected).length} items)
                <ArrowRight size={16} weight="bold" />
              </button>
            </div>
          </div>
        )}

        {/* Done */}
        {step === "done" && (
          <div
            className="card card-padded"
            style={{ textAlign: "center", animation: "scaleIn 0.4s ease" }}
          >
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, rgba(76,175,80,0.15), rgba(31,107,58,0.08))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                border: "2px solid rgba(76,175,80,0.2)",
              }}
            >
              <CheckCircle size={52} weight="fill" color="var(--secondary)" />
            </div>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 26,
                fontWeight: 800,
                marginBottom: 8,
              }}
            >
              Import Successful! 🎉
            </h2>
            <p style={{ color: "var(--gray)", marginBottom: 28, fontSize: 15 }}>
              Your menu items have been added to MARGROS POS.
            </p>
            <div
              style={{ display: "flex", gap: 12, justifyContent: "center" }}
            >
              <button
                className="btn btn-outline"
                onClick={reset}
                style={{ gap: 6 }}
              >
                <UploadSimple size={15} weight="regular" />
                Upload Another
              </button>
              <a href="/menu" className="btn btn-primary" style={{ gap: 6 }}>
                <ForkKnife size={15} weight="fill" />
                Go to Menu
              </a>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </AppShell>
  );
}

export default function AIUploadPage() {
  return (
    <AuthProvider>
      <MenuProvider>
        <OrderProvider>
          <ToastProvider>
            <AIUploadContent />
          </ToastProvider>
        </OrderProvider>
      </MenuProvider>
    </AuthProvider>
  );
}
