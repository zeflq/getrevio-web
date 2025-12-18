# 2. Feature Module Structure

**Priority**: STRICT

---

## 2.1 Model Layer (`model/`)

<rule priority="MANDATORY">
**Purpose**: Define all Zod schemas, TypeScript types, and filter schemas.

**Files**:
- `<entity>Schema.ts` - All schemas for this entity
- `index.ts` - Re-export types and schemas

**Contents**:
1. **Create schema** - Required fields for creation
2. **Update schema** - Partial of create schema
3. **Filter schema** - Query parameters with transformation
4. **Inferred types** - Export TypeScript types from schemas
</rule>

### Schema Pattern

```typescript
// src/features/merchants/model/merchantSchema.ts
import { z } from "zod";

// 1. CREATE SCHEMA (required fields)
export const merchantCreateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email().optional().or(z.literal("")),
  locale: z.string().optional(),
  plan: z.enum(["free", "pro", "enterprise"]),
  status: z.enum(["active", "suspended"]),
});

// 2. UPDATE SCHEMA (all optional + id)
export const merchantUpdateSchema = merchantCreateSchema.partial().extend({
  id: z.string().optional(),
});

// 3. FILTER SCHEMA (with transformation)
export const merchantFiltersSchema = z
  .object({
    q: z.string().optional(),
    plan: z.enum(["free", "pro", "enterprise"]).optional(),
    status: z.enum(["active", "suspended"]).optional(),
    _page: z.coerce.number().int().min(1).optional(),
    _limit: z.coerce.number().int().min(1).max(100).optional(),
    _sort: z.enum(["name", "createdAt", "plan", "status"]).optional(),
    _order: z.enum(["asc", "desc"]).optional(),
  })
  .transform((p) => ({
    q: p.q,
    plan: p.plan,
    status: p.status,
    page: p._page ?? 1,
    pageSize: p._limit ?? 10,
    sort: p._sort ?? ("createdAt" as const),
    order: p._order ?? ("desc" as const),
  }));

// 4. EXPORT INFERRED TYPES
export type MerchantCreateInput = z.infer<typeof merchantCreateSchema>;
export type MerchantUpdateInput = z.infer<typeof merchantUpdateSchema>;
export type MerchantFilters = z.output<typeof merchantFiltersSchema>;
```

### Filter Schema Rules

<rule priority="STRICT">
**Always** use `.transform()` to:
1. Remove underscore prefix from pagination params (`_page` → `page`)
2. Provide default values
3. Convert types (e.g., `z.coerce.number()` for page numbers)

**Why**: URL search params are always strings. Transform handles conversion and defaults.
</rule>

---

## 2.2 Server Layer Structure

### Option 1: Flat Structure (Simple Features)

```
server/
├─ actions.ts                # All write operations
├─ queries.ts                # All read operations (uses createServerQueries)
├─ policy.ts                 # Query policy
├─ buildWhere.ts             # Where builder
├─ mappers.ts                # DTO mappers
│
├─ application/
│  ├─ dto/                   # Command DTOs
│  ├─ interfaces/            # Repository contracts
│  └─ usecases/              # Business logic
│
└─ infrastructure/
   └─ prisma/                # Prisma implementations
```

### Option 2: Nested Structure (Complex Features)

```
server/
├─ policy.ts
├─ buildWhere.ts
├─ mappers.ts
│
├─ application/
│  ├─ dto/
│  ├─ interfaces/
│  └─ usecases/
│
├─ infrastructure/
│  └─ prisma/
│
└─ interface/                # Actions/queries separated
   ├─ actions/
   │  ├─ createMerchant.ts
   │  ├─ updateMerchant.ts
   │  └─ deleteMerchant.ts
   └─ queries.ts
```

---

## 2.3 Application Layer (`application/`)

### 2.3.1 DTOs (Data Transfer Objects)

<rule priority="MANDATORY">
**Purpose**: Command objects passed to use cases.

**Pattern**: `<Action><Entity>Command.ts`

```typescript
// application/dto/createMerchantCommand.ts
export interface CreateMerchantCommand {
  name: string;
  email?: string | null;
  locale?: string | null;
  plan: "free" | "pro" | "enterprise";
  status: "active" | "suspended";
}
```

**Why separate from Zod schemas?**
- DTOs are used internally in application layer
- Zod schemas are for validation at boundaries
- DTOs can include additional fields (e.g., `tenantId`)
</rule>

### 2.3.2 Repository Interfaces (Ports)

<rule priority="MANDATORY">
**Pattern**: Define TWO repository interfaces per entity.

1. **Write Repository** (`<Entity>Repository`)
2. **Read Repository** (`<Entity>QueryRepository`)

```typescript
// application/interfaces/merchantRepository.ts
import type { Merchant } from "@prisma/client";
import type { MerchantCreateInput, MerchantUpdateInput } from "../../model/merchantSchema";

export interface MerchantRepository {
  create(data: MerchantCreateInput): Promise<Merchant>;
  update(data: MerchantUpdateInput & { id: string }): Promise<Merchant>;
  delete(id: string): Promise<void>;
}

// application/interfaces/merchantQueryRepository.ts
import type { MerchantListDTO, MerchantFilters } from "../../model/merchantSchema";

export interface MerchantQueryRepository {
  list(filters: MerchantFilters, tenantId?: string): Promise<{
    items: MerchantListDTO[];
    pagination: { total: number; page: number; pageSize: number; totalPages: number };
  }>;
  
  getById(id: string, tenantId?: string): Promise<MerchantListDTO | null>;
  
  listLite(filters: MerchantFilters, tenantId?: string): Promise<Array<{
    label: string;
    value: string;
  }>>;
}
```

**Why separate read and write?**
- CQRS-lite pattern
- Different optimization strategies
- Clear intent
</rule>

### 2.3.3 Use Cases

<rule priority="MANDATORY">
**Pattern**: Each operation gets ONE use case class.

**Standard use cases**:
- `Create<Entity>UseCase`
- `Update<Entity>UseCase`
- `Delete<Entity>UseCase`
- `List<Entity>sUseCase`
- `Get<Entity>UseCase`
- `List<Entity>sLiteUseCase`

```typescript
// application/usecases/createMerchantUseCase.ts
import { merchantCreateSchema } from "@/features/merchants/model/merchantSchema";
import type { CreateMerchantCommand } from "../dto/createMerchantCommand";
import type { MerchantRepository } from "../interfaces/merchantRepository";

export class CreateMerchantUseCase {
  constructor(private readonly repository: MerchantRepository) {}

  async execute(command: CreateMerchantCommand) {
    // 1. Validate with Zod
    const parsed = merchantCreateSchema.parse(command);

    // 2. Business logic (if any)
    // e.g., check permissions, transform data

    // 3. Call repository
    return this.repository.create({
      name: parsed.name,
      email: parsed.email ?? null,
      locale: parsed.locale ?? null,
      plan: parsed.plan,
      status: parsed.status,
    });
  }
}
```

**Use Case Rules**:
- ✅ Contains business logic
- ✅ Validates with Zod
- ✅ Orchestrates repository calls
- ❌ NEVER imports Prisma directly
- ❌ NEVER imports Next.js-specific code
- ❌ NEVER imports React
</rule>

---

## 2.4 Infrastructure Layer (`infrastructure/`)

### Prisma Selects

```typescript
// infrastructure/prisma/merchantSelects.ts
import { Prisma } from "@prisma/client";

export const merchantListSelect = {
  id: true,
  name: true,
  email: true,
  plan: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.MerchantSelect;

export const merchantDetailSelect = {
  ...merchantListSelect,
  locale: true,
  // Additional fields for detail view
} satisfies Prisma.MerchantSelect;

export type MerchantListRow = Prisma.MerchantGetPayload<{
  select: typeof merchantListSelect;
}>;
```

### Repository Implementation

```typescript
// infrastructure/prisma/prismaMerchantRepository.ts
import { PrismaClient } from "@prisma/client";
import type { MerchantRepository } from "../../application/interfaces/merchantRepository";
import type { MerchantCreateInput, MerchantUpdateInput } from "../../model/merchantSchema";

export class PrismaMerchantRepository implements MerchantRepository {
  constructor(private readonly client: PrismaClient) {}

  async create(data: MerchantCreateInput) {
    return this.client.merchant.create({
      data: {
        name: data.name,
        email: data.email ?? null,
        locale: data.locale ?? null,
        plan: data.plan,
        status: data.status,
      },
    });
  }

  async update(data: MerchantUpdateInput & { id: string }) {
    // CRITICAL: Tenant enforcement (see 04-multi-tenant-security.md)
    return this.client.merchant.update({
      where: { id: data.id },
      data,
    });
  }

  async delete(id: string) {
    await this.client.merchant.delete({ where: { id } });
  }
}
```

---

## 2.5 Interface Layer

### Server Actions

```typescript
// server/actions.ts (or interface/actions/createMerchant.ts)
import { withSuperAdmin } from "@/server/core/guards/authGuards";
import { merchantCreateSchema } from "../model/merchantSchema";
import { revalidateTag } from "next/cache";
import { CreateMerchantUseCase } from "./application/usecases/createMerchantUseCase";
import { PrismaMerchantRepository } from "./infrastructure/prisma/prismaMerchantRepository";
import { prisma } from "@/lib/prisma";

const repository = new PrismaMerchantRepository(prisma);
const createUseCase = new CreateMerchantUseCase(repository);

export const createMerchantAction = withSuperAdmin
  .inputSchema(merchantCreateSchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await createUseCase.execute({
      ...parsedInput,
      tenantId: ctx.tenantId,
    });
    
    await revalidateTag("merchants");
    
    return result;
  });
```

### Server Queries

```typescript
// server/queries.ts
import { createServerQueries } from "@/server/core/queries/createServerQueries";
import { merchantFiltersSchema } from "../model/merchantSchema";
import { merchantQueryPolicy } from "./policy";
import { buildMerchantWhere } from "./buildWhere";
import { mapMerchantRow } from "./mappers";
import { merchantListSelect } from "./infrastructure/prisma/merchantSelects";

export const {
  list: listMerchantsServer,
  item: getMerchantServer,
  lite: listMerchantsLiteServer,
} = createServerQueries({
  model: "merchant",
  filtersSchema: merchantFiltersSchema,
  policy: merchantQueryPolicy,
  buildWhere: buildMerchantWhere,
  mapRow: mapMerchantRow,
  select: merchantListSelect,
  cacheTag: "merchants",
  liteFields: { label: "name", value: "id" },
});
```

---

## Quick Reference

**File Checklist**:
- ☐ `model/<entity>Schema.ts` - Create, update, filter schemas
- ☐ `server/policy.ts` - Query policy
- ☐ `server/buildWhere.ts` - Where builder
- ☐ `server/mappers.ts` - DTO mappers
- ☐ `server/application/dto/` - Command DTOs
- ☐ `server/application/interfaces/` - Repository contracts
- ☐ `server/application/usecases/` - Use cases
- ☐ `server/infrastructure/prisma/` - Prisma implementations
- ☐ `server/actions.ts` - Server actions
- ☐ `server/queries.ts` - Server queries

---

See also:
- **03-clean-architecture.md** - Detailed use case patterns
- **04-multi-tenant-security.md** - Tenant enforcement in repositories
- **06-tech-stack.md** - Zod and Prisma best practices
