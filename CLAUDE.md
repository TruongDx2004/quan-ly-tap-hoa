# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Run development server: `npm run dev`
- Build application: `npm run build` (runs `tsc` and `vite build`)
- Lint codebase: `npm run lint`
- Preview production build: `npm run preview`

*Note: There are no unit or integration test runners configured in this project. All verification is done via local compilation, linting, and manual runtime testing.*

## Code Architecture

This repository contains a lightweight, zero-backend Point of Sale (POS) and inventory management web application for small retail stores.

### Tech Stack
- **Frontend**: React (Vite) + TypeScript + Ant Design + React Router
- **Database/Backend**: Supabase (PostgreSQL client-side calls directly via `@supabase/supabase-js`)
- **State Management**: Zustand (local cart/POS state) + TanStack Query (Supabase server state synchronization)
- **Forms**: React Hook Form + Zod (validations)

### Key Directories
- `src/lib/`: Supabase client definition (`supabase.ts`) and TanStack Query client (`queryClient.ts`).
- `src/types/`: Centralized TypeScript interfaces for Products, Orders, OrderItems, CartItems, and Form structures.
- `src/stores/`: Local state management. `cartStore.ts` handles adding/removing items from the POS cart and calculating totals.
- `src/hooks/`: Custom hooks linking UI to Supabase database (CRUD for products, creating orders, updating inventory, retrieving history, and dashboard aggregations).
- `src/components/`: Modular React components grouped by functional domain:
  - `Layout/`: Primary sidebar layout shell with custom shop headers and credits.
  - `Products/`: Inventory table, CRUD modals, and image uploads.
  - `POS/`: Sell panel, item searching, barcode support, and checkout summaries.
  - `Sales/`: Transactions log table and details overlays.
- `src/pages/`: Page-level components corresponding to router entries (Dashboard, POS, Hàng Hóa/Products, Lịch Sử/Sales).
- `supabase/migrations/`: SQL migration files documenting tables, indexes, and RLS (Row Level Security) definitions.

### Development Guidelines
- **Zero-Backend Constraint**: Do not introduce custom backend APIs or microservices. Communicate directly with Supabase.
- **Stock Integrity**: When checkout is confirmed via `useCreateOrder`, order creation, items log insertion, and stock deduction (products subtraction) must run in sequence.
- **Language**: The UI and notifications are in Vietnamese to serve local shops.
- **Styling**: Match the Ant Design design patterns and Tailwind CSS configurations if modifying styles.
