# 1. Core Architecture Principles

**Priority**: MANDATORY

---

## 1.1 Feature-First Vertical Slices

<architecture_principle>
**Rule**: Every entity/domain concept gets ONE self-contained feature folder.  
**Pattern**: Vertical slices, not horizontal layers.  
**Goal**: High cohesion, low coupling, independent deployability.
</architecture_principle>

### Why Vertical Slices?

Traditional horizontal layering (controllers, services, repositories) spreads a single feature across multiple directories. Vertical slices keep everything related to one entity in one place.

**Benefits**:
- ✅ Easy to understand - all code for "merchants" in one folder
- ✅ Easy to test - clear boundaries
- ✅ Easy to deploy - features are independent
- ✅ Easy to delete - remove entire folder

---

## 1.2 Bounded Contexts

<rule priority="STRICT">
Each feature is a **bounded context** with:
1. **Model**: Own data schemas (Zod)
2. **Server**: Own business logic (use cases, repositories)
3. **Hooks**: Own client-side data fetching
4. **Components**: Own UI elements
5. **Public API**: Controlled exports via `index.ts`
</rule>

### Public API Contract

Every feature MUST export through `index.ts`:

```typescript
// src/features/merchants/index.ts

// ✅ Export public types
export type { MerchantListDTO, MerchantRecord } from "./model/merchantSchema";

// ✅ Export public hooks
export { useMerchantsList, useMerchantItem, useMerchantsLite } from "./hooks/useMerchantCrud";

// ✅ Export public components
export { MerchantColumns } from "./components/columns";
export { MerchantHeader } from "./components/MerchantHeader";

// ❌ Do NOT export internals (use cases, repositories, actions)
```

---

## 1.3 Feature Isolation Rules

<rule priority="CRITICAL">
**NEVER** import from another feature's internals.

**✅ ALLOWED**:
```typescript
// Import from feature's public API
import { useMerchantsList, MerchantColumns } from '@/features/merchants'

// Internal imports within same feature
import { merchantCreateSchema } from '../model/merchantSchema'
```

**❌ FORBIDDEN**:
```typescript
// NEVER reach into another feature's internals
import { MerchantRepository } from '@/features/merchants/server/application/interfaces/merchantRepository'

// NEVER access another feature's components directly
import { MerchantFormFields } from '@/features/merchants/components/MerchantFormFields'

// NEVER use another feature's use cases
import { CreateMerchantUseCase } from '@/features/merchants/server/application/usecases/createMerchantUseCase'
```
</rule>

### When to Share Code

If multiple features need the same functionality:

1. **UI Components** → Move to `src/components/`
2. **Utilities** → Move to `src/lib/`
3. **Server Utilities** → Move to `src/server/core/`
4. **Types** → Move to `src/types/`

---

## 1.4 Dependency Flow

<architecture_principle>
**Clean Architecture Rule**: Dependencies flow INWARD.

```
┌─────────────────────────────────────┐
│  Interface Layer (actions/queries)  │  ← Outermost (frameworks)
└─────────────────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│  Application Layer (use cases)      │  ← Business logic
└─────────────────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│  Infrastructure Layer (Prisma)      │  ← Database adapters
└─────────────────────────────────────┘
```

**Rules**:
- ✅ Actions can import use cases
- ✅ Use cases can import repositories (interfaces only)
- ✅ Repositories implement interfaces from application layer
- ❌ Use cases NEVER import Prisma directly
- ❌ Infrastructure NEVER imports actions
</architecture_principle>

---

## 1.5 High-Level Folder Structure

```
src/features/<entity>/
├─ model/                    # Zod schemas, types, filters
│  ├─ <entity>Schema.ts
│  └─ index.ts
│
├─ server/                   # Backend logic (Clean Architecture)
│  ├─ actions.ts             # Server Actions (writes)
│  ├─ queries.ts             # Server Queries (reads)
│  ├─ policy.ts              # Query policy (pagination, tenant)
│  ├─ buildWhere.ts          # Prisma where builder
│  ├─ mappers.ts             # DTO mappers
│  │
│  ├─ application/           # Use cases + interfaces
│  │  ├─ dto/                # Commands for use cases
│  │  ├─ interfaces/         # Repository contracts
│  │  └─ usecases/           # Business logic
│  │
│  ├─ infrastructure/        # Prisma implementations
│  │  └─ prisma/
│  │
│  └─ interface/             # Alternative: actions/queries separated
│     ├─ actions/
│     └─ queries.ts
│
├─ hooks/                    # Client hooks (CRUD bridge)
│  └─ use<Entity>Crud.ts
│
├─ components/               # React UI for this feature
│  ├─ Create<Entity>Dialog.tsx
│  ├─ Edit<Entity>Sheet.tsx
│  ├─ Delete<Entity>Dialog.tsx
│  ├─ columns.tsx
│  └─ index.ts
│
└─ index.ts                  # Public API (barrel export)
```

---

## 1.6 CQRS-Lite Pattern

<rule priority="STRICT">
Separate **reads** from **writes**:

**Writes** (Commands):
- Handled by **Server Actions** (`actions.ts`)
- Validated with Zod schemas
- Processed by use cases
- Trigger revalidation

**Reads** (Queries):
- Handled by **Server Queries** (`queries.ts`)
- Built with `createServerQueries` helper
- Use query policies for filtering/pagination
- Cached by Next.js

**Benefits**:
- Clear separation of concerns
- Optimized caching strategies
- Easier to scale (separate read/write databases in future)
</rule>

---

## Quick Reference

**Feature Creation Checklist**:
1. ☐ Create `src/features/<entity>/` folder
2. ☐ Define schemas in `model/<entity>Schema.ts`
3. ☐ Define repository interfaces in `server/application/interfaces/`
4. ☐ Implement use cases in `server/application/usecases/`
5. ☐ Implement Prisma repos in `server/infrastructure/prisma/`
6. ☐ Create actions in `server/actions.ts`
7. ☐ Create queries in `server/queries.ts`
8. ☐ Create CRUD bridge in `hooks/use<Entity>Crud.ts`
9. ☐ Create components in `components/`
10. ☐ Export public API via `index.ts`

---

See also:
- **02-feature-structure.md** - Detailed folder structure
- **03-clean-architecture.md** - Use cases and repository patterns
- **04-multi-tenant-security.md** - Tenant enforcement rules
