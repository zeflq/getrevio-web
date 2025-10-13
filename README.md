This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## DEV

### Feature module layout (per entity)
```
    src/features/<entity>/
    ├─ model/
    │  ├─ <entity>Schema.ts            # zod: create/update + filter schemas, DTOs, types
    │  └─ index.ts                     # re-export types/schemas for easy imports
    │
    ├─ server/
    │  ├─ queries.ts                   # server-only reads (Prisma). No auth yet (guard later).
    │  ├─ actions.ts                   # server actions (create/update/delete). "use server"
    │  └─ index.ts                     # re-export server APIs
    │
    ├─ hooks/
    │  ├─ use<Entity>Crud.ts           # wraps createCrudBridge: useList/useItem/useLite + use*Action
    │  └─ index.ts
    │
    ├─ components/                     # client UI for this feature only
    │  ├─ <Entity>Header.tsx
    │  ├─ <Entity>DetailsCard.tsx
    │  ├─ Create<Entity>Dialog.tsx
    │  ├─ Edit<Entity>Sheet.tsx
    │  ├─ Delete<Entity>Dialog.tsx
    │  ├─ columns.tsx                  # table columns
    │  └─ index.ts
    │
    ├─ routes/                         # colocated “source of truth” for handlers
    │  └─ app/
    │     └─ api/
    │        └─ <entity>/
    │           ├─ route.ts            # GET list (server-cached, taggable)
    │           ├─ [id]/route.ts       # GET item (optional)
    │           └─ lite/route.ts       # GET lite (label/value) for comboboxes
    │
    └─ index.ts                        # public API of the feature (barrel)

```
### Responsibilities (at a glance)

    model/

Owns validation & typing:

create/update schemas (zod)

filters schema (coerce query → defaults & normalized shape)

lightweight DTOs (e.g., { value, label })

No IO (no Prisma/fetch here).

server/queries.ts

Pure read logic (Prisma): list, get, lite.

Build where from parsed filters; add tenant later via guard.

Return serializable payloads ({data,total,totalPages} or arrays).

No UI, no React, no fetch—just functions.

server/actions.ts

"use server" file. Only mutations.

Constructed by your createServerActions helper + actionUser middleware.

Validate input (zod), enforce tenant/role, write via Prisma, revalidateTag('…').

Return small success payloads (e.g., { ok: true, id }).

hooks/use<Entity>Crud.ts

Client-only wrapper that centralizes data access for the UI:

Reads: useList/useItem/useLite → React Query calling /api/... routes (GET).

Writes: useCreateAction/useUpdateAction/useRemoveAction → next-safe-action’s useAction bound to server actions.

Cache keys and invalidation (list/item/lite).

Export entity-named hooks for simple imports in components.

components/

Feature-scoped UI only (dialogs, sheets, cards, tables).

Controlled by the hooks above; no direct Prisma or fetch.

routes/app/api/<entity>/**

Public GET surface (internal-to-app but URL-addressable):

GET /api/<entity> → list (taggable, cacheable).

GET /api/<entity>/<id> → item (optional).

GET /api/<entity>/lite → { value, label }[].

Route handlers call server/queries.ts.

Parse query via model filter schema; attach next: { tags: ['<entity>'] } as needed.

index.ts (barrels)

Re-export the intended public surface of the feature for cleaner imports.

Naming conventions

Schemas/DTOs: <entity>CreateSchema, <entity>UpdateSchema, <entity>FiltersSchema, <entity>Lite

Server: list<Entity>Server, get<Entity>Server, list<Entity>LiteServer
and create<Entity>Action, update<Entity>Action, delete<Entity>Action

Hooks: use<Entities>List, use<Entity>Item, use<Entities>Lite, useCreate<Entity>, useUpdate<Entity>, useDelete<Entity>

Data flow summary

Tables/comboboxes → useList/useLite (React Query) → GET /api/... → server/queries → Prisma.

Mutations → use*Action(...).execute(input) (next-safe-action) → server/actions → Prisma → revalidateTag + React Query invalidate in the hook.

Why this works well

Reads are cacheable GETs; writes are secure server actions.

Clear boundaries (validation in model, DB in server, UI in components).

Easy to scale: add a new entity by copying the layout and swapping schemas/queries.

Compatible with RSC: pages can import server/queries directly for SSR data, while client components consume hooks.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.npm

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Prisma

pnpm run prisma migrate dev --name init
pnpm run prisma generate
pnpm run prisma studio
