"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";

export interface MenuItemVariant {
  label: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  tax: number;
  description: string;
  image: string;
  available: boolean;
  variants?: MenuItemVariant[];
}

interface MenuContextType {
  items: MenuItem[];
  isLoading: boolean;
  addItem: (item: Omit<MenuItem, "id">) => Promise<void>;
  updateItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleAvailability: (id: string) => Promise<void>;
  bulkAddItems: (items: Omit<MenuItem, "id">[]) => Promise<void>;
  refresh: () => Promise<void>;
}

const MenuContext = createContext<MenuContextType | null>(null);

export function MenuProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchItems = useCallback(async () => {
    if (!user?.restaurantId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/menu?restaurantId=${user.restaurantId}`);
      if (!res.ok) throw new Error("Failed to fetch menu");
      const { items: data } = await res.json();
      setItems(data.map((i: Record<string, unknown>) => ({
        id:          String(i.id),
        name:        String(i.name),
        category:    String(i.category),
        price:       Number(i.price),
        tax:         Number(i.tax),
        description: String(i.description ?? ""),
        image:       String(i.image ?? "🍽️"),
        available:   Boolean(i.available),
        variants:    Array.isArray(i.variants) ? i.variants as MenuItemVariant[] : undefined,
      })));
    } catch (err) {
      console.error("MenuContext fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.restaurantId]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const addItem = useCallback(async (item: Omit<MenuItem, "id">) => {
    if (!user?.restaurantId) return;
    const res = await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId: user.restaurantId, ...item }),
    });
    if (!res.ok) throw new Error("Failed to add item");
    const { item: created } = await res.json();
    setItems((prev) => [...prev, {
      id: created.id, name: created.name, category: created.category,
      price: Number(created.price), tax: Number(created.tax),
      description: created.description ?? "", image: created.image ?? "🍽️",
      available: created.available,
      variants: Array.isArray(created.variants) ? created.variants as MenuItemVariant[] : undefined,
    }]);
  }, [user?.restaurantId]);

  const updateItem = useCallback(async (id: string, updates: Partial<MenuItem>) => {
    const res = await fetch("/api/menu", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    if (!res.ok) throw new Error("Failed to update item");
    const { item: updated } = await res.json();
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, ...updated, price: Number(updated.price), tax: Number(updated.tax) } : i));
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    const res = await fetch(`/api/menu?id=${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete item");
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const toggleAvailability = useCallback(async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    await updateItem(id, { available: !item.available });
  }, [items, updateItem]);

  const bulkAddItems = useCallback(async (newItems: Omit<MenuItem, "id">[]) => {
    if (!user?.restaurantId) return;
    // Add items sequentially to avoid rate limits
    for (const item of newItems) {
      await addItem(item);
    }
  }, [user?.restaurantId, addItem]);

  return (
    <MenuContext.Provider value={{ items, isLoading, addItem, updateItem, deleteItem, toggleAvailability, bulkAddItems, refresh: fetchItems }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be used within MenuProvider");
  return ctx;
}
