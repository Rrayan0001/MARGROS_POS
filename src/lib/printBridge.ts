export type PaperWidth = "58mm" | "80mm";

export interface PrintBridgeConfig {
  bridgeUrl: string;
  paperWidth: PaperWidth;
  printerName: string;
  autoPrintAfterOrder: boolean;
  enabled: boolean;
}

export interface ReceiptPrintLineItem {
  name: string;
  qty: number;
  price: number;
}

export interface ReceiptPrintPayload {
  orderNumber: string;
  createdAt: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  total: number;
  items: ReceiptPrintLineItem[];
  restaurantName?: string;
  printerName?: string;
  paperWidth?: PaperWidth;
}

const STORAGE_KEY = "margros_print_bridge_config";

const DEFAULT_CONFIG: PrintBridgeConfig = {
  bridgeUrl: "http://127.0.0.1:4891",
  paperWidth: "80mm",
  printerName: "",
  autoPrintAfterOrder: true,
  enabled: true,
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function normalizeBridgeUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

export function getPrintBridgeConfig(): PrintBridgeConfig {
  if (!isBrowser()) return DEFAULT_CONFIG;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_CONFIG;

  try {
    const parsed = JSON.parse(raw) as Partial<PrintBridgeConfig>;
    return {
      bridgeUrl: normalizeBridgeUrl(parsed.bridgeUrl ?? DEFAULT_CONFIG.bridgeUrl),
      paperWidth: parsed.paperWidth === "58mm" ? "58mm" : "80mm",
      printerName: parsed.printerName ?? "",
      autoPrintAfterOrder: parsed.autoPrintAfterOrder ?? true,
      enabled: parsed.enabled ?? true,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function savePrintBridgeConfig(config: PrintBridgeConfig): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...config,
      bridgeUrl: normalizeBridgeUrl(config.bridgeUrl),
    })
  );
}

async function requestBridge<T>(
  config: PrintBridgeConfig,
  path: string,
  payload?: unknown,
  retries = 2,
  timeoutMs = 6000
): Promise<T> {
  const url = `${normalizeBridgeUrl(config.bridgeUrl)}${path}`;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: payload ? "POST" : "GET",
        headers: {
          "Content-Type": "application/json",
        },
        body: payload ? JSON.stringify(payload) : undefined,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Bridge request failed with ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
      }
    }
  }

  throw lastError ?? new Error("Bridge request failed");
}

export async function checkPrintBridge(config: PrintBridgeConfig): Promise<{ ok: boolean; printer?: string }> {
  const data = await requestBridge<{ ok: boolean; printer?: string }>(config, "/health", undefined, 0, 2500);
  return data;
}

export async function printReceiptToBridge(payload: ReceiptPrintPayload, config: PrintBridgeConfig): Promise<{ ok: boolean; jobId?: string }> {
  return requestBridge<{ ok: boolean; jobId?: string }>(config, "/print/receipt", {
    ...payload,
    paperWidth: config.paperWidth,
    printerName: config.printerName || payload.printerName,
  });
}

export async function sendTestPrint(config: PrintBridgeConfig): Promise<{ ok: boolean; jobId?: string }> {
  return requestBridge<{ ok: boolean; jobId?: string }>(config, "/print/test", {
    printerName: config.printerName,
    paperWidth: config.paperWidth,
    timestamp: new Date().toISOString(),
  });
}
