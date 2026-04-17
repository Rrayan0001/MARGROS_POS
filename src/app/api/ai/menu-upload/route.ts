import { NextRequest, NextResponse } from "next/server";
import { groq, GROQ_MODEL } from "@/lib/groq";

export const maxDuration = 60; // allow up to 60s for AI processing

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const textInput = formData.get("text") as string | null;

    console.log("[AI upload] file:", file ? `${file.name} ${file.type} ${file.size}b` : "null", "text:", textInput ? "yes" : "no");

    if (!file && !textInput) {
      return NextResponse.json({ error: "Image or text input required" }, { status: 400 });
    }

    let userContent: Parameters<typeof groq.chat.completions.create>[0]["messages"][0]["content"];

    const extractionPrompt = `Extract ALL menu items from this menu. Return a JSON array only, no explanation, no markdown.

Each item must have these fields:
- name: string (item name)
- category: string (use the EXACT section heading from the menu, e.g. "Chicken Curries", "Mutton Curry", "Food Court Special Non-veg". If unclear use "Main Course")
- price: number (base/quarter price in INR, or single price if no variants)
- halfPrice: number or null (half portion price, null if not available)
- fullPrice: number or null (full portion price, null if not available)
- tax: number (0, 5, 12, or 18 — use 5 for food)
- description: string (short 1-line description)

IMPORTANT RULES:
1. Preserve the exact category names from the menu headings (e.g. "Chicken Curries", "Mutton Curry").
2. If an item has Quarter/Half/Full columns, put the quarter price in "price", half in "halfPrice", full in "fullPrice".
3. If an item has only Half/Full columns (no quarter), put null in "price", half price in "halfPrice", full in "fullPrice".
4. If an item has only one price, put it in "price" and null for halfPrice and fullPrice.
5. Extract EVERY item — do not skip any.`;

    if (file) {
      // Convert image to base64
      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      const mimeType = file.type || "image/jpeg";

      userContent = [
        {
          type: "image_url",
          image_url: { url: `data:${mimeType};base64,${base64}` },
        },
        {
          type: "text",
          text: extractionPrompt,
        },
      ];
    } else {
      userContent = `${extractionPrompt}\n\nMenu text:\n${textInput}`;
    }

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a menu parser for an Indian restaurant POS system. Extract ALL menu items including size variants (Quarter/Half/Full). Return ONLY a valid JSON array with fields: name, category, price, halfPrice, fullPrice, tax, description. No markdown, no explanation, just the JSON array.",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
      temperature: 0.1,
      max_tokens: 4096,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "[]";

    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();

    let items: unknown[];
    try {
      items = JSON.parse(cleaned);
      if (!Array.isArray(items)) items = [];
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response", raw }, { status: 422 });
    }

    type Variant = { label: string; price: number };
    type NormalisedItem = {
      name: string; category: string; price: number;
      tax: number; description: string; image: string; available: boolean;
      variants?: Variant[];
    };

    // Normalise — keep one item per dish, attach variants array when sizes exist
    const normalised: NormalisedItem[] = [];

    for (const entry of items) {
      if (typeof entry !== "object" || entry === null) continue;
      const item = entry as Record<string, unknown>;
      const name        = String(item.name ?? "Unknown Item").trim();
      const category    = String(item.category ?? "Main Course").trim();
      const tax         = [0, 5, 12, 18].includes(Number(item.tax)) ? Number(item.tax) : 5;
      const description = String(item.description ?? "").trim();
      const basePrice   = item.price != null && Number(item.price) > 0 ? Number(item.price) : null;
      const halfPrice   = item.halfPrice != null && Number(item.halfPrice) > 0 ? Number(item.halfPrice) : null;
      const fullPrice   = item.fullPrice != null && Number(item.fullPrice) > 0 ? Number(item.fullPrice) : null;

      if (!name) continue;

      const hasVariants = basePrice != null || halfPrice != null || fullPrice != null
        ? (halfPrice != null || fullPrice != null)
        : false;

      if (hasVariants) {
        // Build variants array — only include sizes that exist
        const variants: Variant[] = [];
        if (basePrice) variants.push({ label: "Qtr", price: basePrice });
        if (halfPrice) variants.push({ label: "Half", price: halfPrice });
        if (fullPrice) variants.push({ label: "Full", price: fullPrice });

        // Base price = lowest variant price for display on card
        const displayPrice = variants[0].price;
        normalised.push({ name, category, price: displayPrice, tax, description, image: "🍽️", available: true, variants });
      } else {
        // Single price item
        if (basePrice && basePrice > 0) {
          normalised.push({ name, category, price: basePrice, tax, description, image: "🍽️", available: true });
        }
      }
    }

    return NextResponse.json({ items: normalised, count: normalised.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const status = (err as { status?: number })?.status;
    console.error("AI menu upload error:", message, status, err);
    return NextResponse.json({ error: "AI processing failed", detail: message }, { status: 500 });
  }
}
