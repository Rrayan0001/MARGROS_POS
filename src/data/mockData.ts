export type Role = "admin" | "cashier" | "manager";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  restaurantName: string;
  avatar?: string;
}

export interface MenuItemVariant {
  label: string;  // e.g. "Qtr", "Half", "Full"
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
  variants?: MenuItemVariant[]; // optional size variants
}

export interface CartItem extends MenuItem {
  qty: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment: string;
  status: "completed" | "pending" | "cancelled";
  time: string;
  date: string;
  cashier: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "inactive";
  joined: string;
}

// ─── Mock Auth ──────────────────────────────────────────────
export const MOCK_USERS: User[] = [
  {
    id: "u1",
    name: "Rayan Ahmed",
    email: "admin@margros.com",
    role: "admin",
    restaurantName: "Margros Kitchen",
  },
  {
    id: "u2",
    name: "Priya Sharma",
    email: "cashier@margros.com",
    role: "cashier",
    restaurantName: "Margros Kitchen",
  },
];

// ─── Menu Data ───────────────────────────────────────────────
export const CATEGORIES = [
  "All",
  "Breakfast",
  "Chicken Curries",
  "Mutton Curry",
  "Main Course",
  "Breads",
  "Beverages",
  "Snacks",
  "Desserts",
  "Rice & Biryani",
  "Soups",
  "Food Court Special Non-veg",
];

export const MENU_ITEMS: MenuItem[] = [
  { id: "m1", name: "Masala Dosa", category: "Breakfast", price: 80, tax: 5, description: "Crispy dosa with spiced potato filling", image: "🫓", available: true },
  { id: "m2", name: "Idli Sambar", category: "Breakfast", price: 60, tax: 5, description: "Steamed rice cakes with lentil soup", image: "🍚", available: true },
  { id: "m3", name: "Poha", category: "Breakfast", price: 50, tax: 5, description: "Flattened rice with spices and veggies", image: "🥣", available: true },
  { id: "m4", name: "Upma", category: "Breakfast", price: 55, tax: 5, description: "Semolina with spices and vegetables", image: "🥣", available: false },
  { id: "m5", name: "Butter Chicken", category: "Main Course", price: 280, tax: 12, description: "Creamy tomato-based chicken curry", image: "🍛", available: true },
  { id: "m6", name: "Paneer Tikka Masala", category: "Main Course", price: 240, tax: 12, description: "Cottage cheese in rich tomato gravy", image: "🍛", available: true },
  { id: "m7", name: "Dal Tadka", category: "Main Course", price: 160, tax: 5, description: "Yellow lentils with tempered spices", image: "🍲", available: true },
  { id: "m8", name: "Chicken Biryani", category: "Rice & Biryani", price: 320, tax: 12, description: "Aromatic basmati rice with spiced chicken", image: "🍚", available: true },
  { id: "m9", name: "Veg Biryani", category: "Rice & Biryani", price: 220, tax: 5, description: "Fragrant rice with mixed vegetables", image: "🍚", available: true },
  { id: "m10", name: "Chapati", category: "Breads", price: 20, tax: 0, description: "Soft whole wheat flatbread", image: "🫓", available: true },
  { id: "m11", name: "Garlic Naan", category: "Breads", price: 40, tax: 0, description: "Leavened bread with garlic butter", image: "🫓", available: true },
  { id: "m12", name: "Paratha", category: "Breads", price: 35, tax: 0, description: "Flaky layered flatbread", image: "🫓", available: true },
  { id: "m13", name: "Masala Chai", category: "Beverages", price: 30, tax: 0, description: "Spiced Indian milk tea", image: "☕", available: true },
  { id: "m14", name: "Fresh Lime Soda", category: "Beverages", price: 45, tax: 5, description: "Chilled lime soda with mint", image: "🥤", available: true },
  { id: "m15", name: "Mango Lassi", category: "Beverages", price: 80, tax: 5, description: "Sweet mango yogurt drink", image: "🥛", available: true },
  { id: "m16", name: "Cold Coffee", category: "Beverages", price: 90, tax: 5, description: "Blended iced coffee with cream", image: "☕", available: true },
  { id: "m17", name: "Samosa", category: "Snacks", price: 25, tax: 5, description: "Crispy pastry with spiced potato filling", image: "🥟", available: true },
  { id: "m18", name: "Pani Puri", category: "Snacks", price: 50, tax: 5, description: "Crispy shells with tangy water", image: "🫙", available: true },
  { id: "m19", name: "Onion Pakora", category: "Snacks", price: 60, tax: 5, description: "Deep-fried onion fritters", image: "🧅", available: true },
  { id: "m20", name: "Gulab Jamun", category: "Desserts", price: 70, tax: 5, description: "Soft milk-solid balls in sugar syrup", image: "🍮", available: true },
  { id: "m21", name: "Rasgulla", category: "Desserts", price: 65, tax: 5, description: "Spongy cottage cheese balls in syrup", image: "🍮", available: true },
  { id: "m22", name: "Kulfi", category: "Desserts", price: 80, tax: 5, description: "Traditional Indian ice cream", image: "🍦", available: true },
];

// ─── Orders (last 30 days) ───────────────────────────────────
function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateOrders(): Order[] {
  const orders: Order[] = [];
  const payments = ["Cash", "Card", "UPI", "Wallet"];
  const cashiers = ["Priya Sharma", "Rayan Ahmed", "Arun Kumar"];
  const today = new Date();

  for (let d = 0; d < 30; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const dateStr = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

    const orderCount = d === 0 ? randomBetween(3, 8) : randomBetween(8, 25);

    for (let o = 0; o < orderCount; o++) {
      const itemCount = randomBetween(1, 4);
      const items: CartItem[] = [];
      const used = new Set<string>();

      for (let i = 0; i < itemCount; i++) {
        let item = MENU_ITEMS[randomBetween(0, MENU_ITEMS.length - 1)];
        while (used.has(item.id)) {
          item = MENU_ITEMS[randomBetween(0, MENU_ITEMS.length - 1)];
        }
        used.add(item.id);
        items.push({ ...item, qty: randomBetween(1, 3) });
      }

      const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
      const taxAmt = items.reduce((s, i) => s + (i.price * i.qty * i.tax) / 100, 0);
      const discount = randomBetween(0, 1) ? randomBetween(0, Math.floor(subtotal * 0.1)) : 0;
      const total = subtotal + taxAmt - discount;

      const hour = randomBetween(8, 22);
      const min = randomBetween(0, 59);
      const timeStr = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;

      orders.push({
        id: `ORD-${1000 + orders.length}`,
        items,
        subtotal: Math.round(subtotal),
        tax: Math.round(taxAmt),
        discount,
        total: Math.round(total),
        payment: payments[randomBetween(0, payments.length - 1)],
        status: "completed",
        time: timeStr,
        date: dateStr,
        cashier: cashiers[randomBetween(0, cashiers.length - 1)],
      });
    }
  }

  return orders;
}

export const STAFF: StaffMember[] = [
  { id: "s1", name: "Rayan Ahmed", email: "admin@margros.com", role: "admin", status: "active", joined: "01 Jan 2025" },
  { id: "s2", name: "Priya Sharma", email: "cashier@margros.com", role: "cashier", status: "active", joined: "15 Feb 2025" },
  { id: "s3", name: "Arun Kumar", email: "arun@margros.com", role: "cashier", status: "active", joined: "10 Mar 2025" },
  { id: "s4", name: "Meena Iyer", email: "meena@margros.com", role: "manager", status: "inactive", joined: "20 Apr 2025" },
];
