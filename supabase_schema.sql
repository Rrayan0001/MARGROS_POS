-- ============================================================
-- MARGROS POS — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Restaurants ──────────────────────────────────────────────
create table if not exists restaurants (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  owner_name  text not null,
  email       text unique not null,
  slug        text unique not null,
  phone       text,
  address     text,
  gst_number  text,
  logo_url    text,
  created_at  timestamptz default now()
);

-- Index for slug lookups (tenant routing)
create index if not exists idx_restaurants_slug on restaurants(slug);

-- ── Users ────────────────────────────────────────────────────
create table if not exists users (
  id              uuid primary key default uuid_generate_v4(),
  restaurant_id   uuid references restaurants(id) on delete cascade,
  name            text not null,
  email           text unique not null,
  password_hash   text not null,
  role            text not null check (role in ('admin', 'manager', 'cashier')),
  status          text not null default 'active' check (status in ('active', 'inactive')),
  created_at      timestamptz default now()
);

-- ── Menu Items ───────────────────────────────────────────────
create table if not exists menu_items (
  id              uuid primary key default uuid_generate_v4(),
  restaurant_id   uuid references restaurants(id) on delete cascade,
  name            text not null,
  category        text not null,
  price           numeric(10,2) not null,
  tax             numeric(5,2) not null default 0,
  description     text default '',
  image           text default '🍽️',
  available       boolean not null default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── Orders ───────────────────────────────────────────────────
create table if not exists orders (
  id              uuid primary key default uuid_generate_v4(),
  restaurant_id   uuid references restaurants(id) on delete cascade,
  order_number    text not null,
  subtotal        numeric(10,2) not null,
  tax             numeric(10,2) not null default 0,
  discount        numeric(10,2) not null default 0,
  total           numeric(10,2) not null,
  payment_method  text not null default 'Cash',
  status          text not null default 'completed' check (status in ('completed', 'pending', 'cancelled')),
  cashier_id      uuid references users(id),
  cashier_name    text,
  created_at      timestamptz default now()
);

-- ── Order Items ──────────────────────────────────────────────
create table if not exists order_items (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid references orders(id) on delete cascade,
  menu_item_id    uuid,
  name            text not null,
  category        text,
  price           numeric(10,2) not null,
  tax             numeric(5,2) not null default 0,
  qty             int not null,
  image           text default '🍽️'
);

-- ── Indexes ──────────────────────────────────────────────────
create index if not exists idx_menu_items_restaurant on menu_items(restaurant_id);
create index if not exists idx_orders_restaurant on orders(restaurant_id);
create index if not exists idx_orders_created_at on orders(created_at desc);
create index if not exists idx_order_items_order on order_items(order_id);

-- Additional indexes for multi-tenant scalability
create index if not exists idx_users_restaurant on users(restaurant_id);
create index if not exists idx_orders_restaurant_status on orders(restaurant_id, status);
create index if not exists idx_orders_restaurant_created on orders(restaurant_id, created_at desc);
create index if not exists idx_order_items_menu_item on order_items(menu_item_id);
create index if not exists idx_menu_items_restaurant_category on menu_items(restaurant_id, category);

-- Add variants column if not already present (for menu item variants support)
alter table menu_items add column if not exists variants jsonb;

-- Add slug column to existing restaurants table (migration for existing installs)
alter table restaurants add column if not exists slug text unique;
create index if not exists idx_restaurants_slug on restaurants(slug);

-- Backfill slugs for any existing restaurants that don't have one
-- Run this manually if you have existing rows:
-- update restaurants set slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g')) where slug is null;

-- ── Row Level Security ───────────────────────────────────────
alter table restaurants  enable row level security;
alter table users        enable row level security;
alter table menu_items   enable row level security;
alter table orders       enable row level security;
alter table order_items  enable row level security;

-- Allow service role full access (our API routes use service role)
create policy "service_role_all" on restaurants  for all using (true);
create policy "service_role_all" on users        for all using (true);
create policy "service_role_all" on menu_items   for all using (true);
create policy "service_role_all" on orders       for all using (true);
create policy "service_role_all" on order_items  for all using (true);
