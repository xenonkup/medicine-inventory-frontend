# Medicine Inventory — Frontend

เว็บแอปสำหรับระบบบริหารคลังยา — Next.js 15 App Router, แยกตาม feature,
auth ด้วย JWT, จัดการ server state ด้วย React Query

Backend repo: https://github.com/xenonkup/medicine-inventory-backend

## Stack
Next.js 15 · TypeScript · Tailwind CSS · Shadcn (Base UI) · React Query · React Hook Form + Zod · Deploy: Vercel

## Structure
```
src/
  app/
    (auth)/login          # หน้า login (ไม่มี sidebar)
    (dashboard)/          # หน้าใน (มี sidebar) — dashboard, medicines, categories, users, ...
  components/
    ui/                   # Shadcn primitives
    shared/               # AppSidebar, AppHeader
  features/               # api + hooks + components ต่อโดเมน (auth, users, categories, medicines)
  lib/                    # api-client (axios + JWT), auth, constants
  providers/              # QueryProvider, AuthProvider
  middleware.ts           # edge route guard
```

## Run locally
```bash
# .env.local: NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
npm install
npm run dev               # http://localhost:3000
```
> ต้องรัน backend คู่กัน (ดู backend repo) เพื่อให้ login และข้อมูลทำงาน

## Roadmap
- [x] Phase 0/1 — Setup + Auth & Users
- [x] Phase 2 — Master data (Category, Medicine)
- [x] Phase 3 — Inventory (Stock In/Out **FEFO**, Return; allocation result view)
- [x] Phase 4a — Dashboard (real KPIs, near-expiry + low-stock tables, stock-by-category chart)
- [x] Phase 5a — Reports page (movement + stock charts via Recharts) + Settings page
- [ ] Phase 4b LINE · Phase 5b Excel export · Phase 6 Deploy
