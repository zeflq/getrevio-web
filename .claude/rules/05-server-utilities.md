# 5. Server Core Utilities

**Location**: `src/server/core/`

---

## 5.1 Query Policies

**Location**: `src/server/core/policies/queryPolicy.ts`

### createQueryPolicy

<rule priority="MANDATORY">
**Purpose**: Standardize pagination, sorting, and tenant enforcement.

```typescript
// features/places/server/policy.ts
import { createQueryPolicy } from "@/server/core/policies/queryPolicy";
import type { PlaceFilters } from "../model/placeSchema";

export const placeQueryPolicy = createQueryPolicy<PlaceFilters>({
  defaultPageSize: 10,
  maxPageSize: 100,
  allowedSortFields: ["localName", "city", "country", "createdAt"],
  defaultSort: { field: "createdAt", order: "desc" },
});
```
</rule>

### Query Policy Methods

```typescript
// 1. buildQuery - Get pagination and sort params
const { take, skip, orderBy } = placeQueryPolicy.buildQuery(filters);

await prisma.place.findMany({
  take,    // Limit
  skip,    // Offset
  orderBy, // { field: 'asc' | 'desc' }
});

// 2. enforceTenant - Add tenant filter to where
const where = buildPlaceWhere(filters, tenantId);
const whereWithTenant = placeQueryPolicy.enforceTenant(
  where,
  tenantId,
  "merchantId"
);

// 3. validateSort - Ensure sort field is allowed
const isValid = placeQueryPolicy.validateSort(filters.sort);
```

---

## 5.2 Sort Policies

**Location**: `src/server/core/policies/sortPolicy.ts`

### createSortPolicy

<rule priority="STRICT">
**Purpose**: Define available sort options with Prisma orderBy.

```typescript
// features/places/server/policy.ts
import { createSortPolicy } from "@/server/core/policies/sortPolicy";

export const placeSortPolicy = createSortPolicy({
  localName: { field: "localName", order: "asc" },
  city: { field: "city", order: "asc" },
  country: { field: "country", order: "asc" },
  createdAt: { field: "createdAt", order: "desc" },
  updatedAt: { field: "updatedAt", order: "desc" },
});

// Usage
const orderBy = placeSortPolicy.getOrderBy(filters.sort, filters.order);
```
</rule>

---

## 5.3 createServerQueries

**Location**: `src/server/core/queries/createServerQueries.ts`

<rule priority="MANDATORY">
**Purpose**: Generate list/item/lite server queries with consistent patterns.

**Benefits**:
- ✅ Eliminates boilerplate
- ✅ Consistent tenant enforcement
- ✅ Automatic cache tagging
- ✅ Built-in error handling

```typescript
// features/places/server/queries.ts
import { createServerQueries } from "@/server/core/queries/createServerQueries";
import { placeFiltersSchema } from "../model/placeSchema";
import { placeQueryPolicy } from "./policy";
import { buildPlaceWhere } from "./buildWhere";
import { mapPlaceRow } from "./mappers";
import { placeListSelect } from "./infrastructure/prisma/placeSelects";

export const {
  list: listPlacesServer,
  item: getPlaceServer,
  lite: listPlacesLiteServer,
} = createServerQueries({
  model: "place",                      // Prisma model name
  filtersSchema: placeFiltersSchema,   // Zod schema
  policy: placeQueryPolicy,            // Query policy
  buildWhere: buildPlaceWhere,         // Where builder function
  mapRow: mapPlaceRow,                 // DTO mapper function
  select: placeListSelect,             // Prisma select
  cacheTag: "places",                  // Next.js cache tag
  liteFields: {                        // Fields for lite query
    label: "localName",
    value: "id",
  },
});
```
</rule>

### Generated Functions

```typescript
// 1. list - Paginated list with filters
const result = await listPlacesServer({ 
  q: "Paris",
  page: 1,
  pageSize: 10,
  sort: "localName",
  order: "asc"
});

// Returns:
{
  items: PlaceListDTO[],
  pagination: {
    total: number,
    page: number,
    pageSize: number,
    totalPages: number
  }
}

// 2. item - Single item by ID
const place = await getPlaceServer("place_123");
// Returns: PlaceListDTO | null

// 3. lite - Label/value pairs for dropdowns
const options = await listPlacesLiteServer({ q: "Paris" });
// Returns: Array<{ label: string, value: string }>
```

---

## 5.4 Auth Guards

**Location**: `src/server/core/guards/authGuards.ts`

### withAuth

<rule priority="MANDATORY">
**Purpose**: Base guard - ensures user is authenticated.

```typescript
import { createServerActions } from "@/server/core/actions/createServerActions";

export const withAuth = createServerActions({
  name: "withAuth",
  requireAuth: true,
});

// Usage
export const someAction = withAuth
  .inputSchema(schema)
  .action(async ({ parsedInput, ctx }) => {
    // ctx.user is available
    // ctx.tenantId is available (if user has organizationId)
  });
```
</rule>

### withTenantGuard

<rule priority="CRITICAL">
**Purpose**: Validate input tenant matches session tenant.

**Parameters**: Field name containing merchantId in input schema.

```typescript
export const createPlaceAction = withTenantGuard("merchantId")
  .inputSchema(placeCreateSchema.extend({ merchantId: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    // parsedInput.merchantId === ctx.tenantId (guaranteed)
  });

// With nested field
export const createCampaignAction = withTenantGuard("place.merchantId")
  .inputSchema(campaignCreateSchema)
  .action(async ({ parsedInput, ctx }) => {
    // parsedInput.place.merchantId === ctx.tenantId
  });
```
</rule>

### withSuperAdmin

<rule priority="STRICT">
**Purpose**: Restrict to super admin users only.

```typescript
export const createMerchantAction = withSuperAdmin
  .inputSchema(merchantCreateSchema)
  .action(async ({ parsedInput, ctx }) => {
    // ctx.user.role === "super_admin" (guaranteed)
  });
```
</rule>

### withApiAuth

<rule priority="STRICT">
**Purpose**: Validate API key from external requests.

```typescript
export const createExternalGameAction = withApiAuth
  .inputSchema(gameCreateSchema)
  .action(async ({ parsedInput, ctx }) => {
    // ctx.tenantId resolved from API key
    // ctx.apiKey available
  });
```
</rule>

---

## 5.5 Where Builders

**Pattern**: `build<Entity>Where.ts`

<rule priority="STRICT">
**Purpose**: Build Prisma where clause from filters.

```typescript
// features/places/server/buildWhere.ts
import type { Prisma } from "@prisma/client";
import type { PlaceFilters } from "../model/placeSchema";

export function buildPlaceWhere(
  filters: PlaceFilters,
  tenantId?: string
): Prisma.PlaceWhereInput {
  const where: Prisma.PlaceWhereInput = {};

  // Search query
  if (filters.q) {
    where.OR = [
      { localName: { contains: filters.q, mode: "insensitive" } },
      { nameEn: { contains: filters.q, mode: "insensitive" } },
      { city: { contains: filters.q, mode: "insensitive" } },
      { addressLine1: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  // Specific filters
  if (filters.city) {
    where.city = { equals: filters.city, mode: "insensitive" };
  }

  if (filters.country) {
    where.country = { equals: filters.country, mode: "insensitive" };
  }

  // DO NOT add tenant here - use policy.enforceTenant()

  return where;
}
```

**Important**: Where builders should NOT add tenant filters. Use `policy.enforceTenant()` instead.
</rule>

---

## 5.6 DTO Mappers

**Pattern**: `map<Entity>Row.ts`

<rule priority="STRICT">
**Purpose**: Transform Prisma rows to DTOs.

```typescript
// features/places/server/mappers.ts
import type { PlaceListRow } from "./infrastructure/prisma/placeSelects";
import type { PlaceListDTO } from "../model/placeSchema";

export function mapPlaceRow(row: PlaceListRow): PlaceListDTO {
  return {
    id: row.id,
    localName: row.localName,
    nameEn: row.nameEn,
    addressLine1: row.addressLine1,
    addressLine2: row.addressLine2,
    city: row.city,
    postalCode: row.postalCode,
    region: row.region,
    country: row.country,
    placeCode: row.placeCode,
    merchantId: row.merchantId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
```

**Why mappers?**
- ✅ Type safety (Prisma → DTO)
- ✅ Data transformation (Date → ISO string)
- ✅ Hide internal fields
- ✅ Consistent API responses
</rule>

---

## 5.7 Tenant Resolution

**Location**: `src/server/core/utils/resolveTenantScope.ts`

```typescript
import { getSession } from "@/lib/auth-server";

export async function resolveTenantScope(): Promise<string | undefined> {
  const session = await getSession();
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Super admins can query globally
  if (session.user.role === "super_admin") {
    return undefined;
  }

  // Regular users must have tenant
  const tenantId = session.user.organizationId;
  
  if (!tenantId) {
    throw new Error("User has no tenant");
  }

  return tenantId;
}
```

---

## 5.8 User Context

**Location**: `src/server/core/utils/createUserContext.ts`

```typescript
export async function createUserContext() {
  const session = await getSession();
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return {
    user: session.user,
    tenantId: session.user.organizationId,
    isSuperAdmin: session.user.role === "super_admin",
  };
}
```

---

## 5.9 Complete Query Example

```typescript
// features/places/server/queries.ts
import { cache } from "react";
import { resolveTenantScope } from "@/server/core/utils/resolveTenantScope";
import { prisma } from "@/lib/prisma";
import { placeFiltersSchema } from "../model/placeSchema";
import { placeQueryPolicy } from "./policy";
import { buildPlaceWhere } from "./buildWhere";
import { mapPlaceRow } from "./mappers";
import { placeListSelect } from "./infrastructure/prisma/placeSelects";

export const listPlacesServer = cache(
  async (rawFilters: unknown) => {
    // 1. Parse filters
    const filters = placeFiltersSchema.parse(rawFilters);
    
    // 2. Get tenant from session
    const tenantId = await resolveTenantScope();
    
    // 3. Build where clause
    const where = buildPlaceWhere(filters, tenantId);
    
    // 4. Enforce tenant (CRITICAL)
    const whereWithTenant = placeQueryPolicy.enforceTenant(
      where,
      tenantId,
      "merchantId"
    );
    
    // 5. Get pagination and sort
    const { take, skip, orderBy } = placeQueryPolicy.buildQuery(filters);
    
    // 6. Execute queries
    const [items, total] = await Promise.all([
      prisma.place.findMany({
        where: whereWithTenant,
        select: placeListSelect,
        take,
        skip,
        orderBy,
      }),
      prisma.place.count({ where: whereWithTenant }),
    ]);
    
    // 7. Map to DTOs
    const mappedItems = items.map(mapPlaceRow);
    
    // 8. Return paginated result
    return {
      items: mappedItems,
      pagination: {
        total,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    };
  },
  ["places"] // Cache tag
);
```

---

## 5.10 Complete Action Example

```typescript
// features/places/server/actions.ts
import { withTenantGuard } from "@/server/core/guards/authGuards";
import { placeCreateSchema } from "../model/placeSchema";
import { revalidateTag } from "next/cache";
import { CreatePlaceUseCase } from "./application/usecases/createPlaceUseCase";
import { PrismaPlaceRepository } from "./infrastructure/prisma/prismaPlaceRepository";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Instantiate dependencies
const repository = new PrismaPlaceRepository(prisma);
const createUseCase = new CreatePlaceUseCase(repository);

export const createPlaceAction = withTenantGuard("merchantId")
  .inputSchema(
    placeCreateSchema.extend({
      merchantId: z.string().min(1, "Merchant ID required"),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    // Execute use case
    const result = await createUseCase.execute({
      ...parsedInput,
      merchantId: ctx.tenantId, // From session, not input
    });

    // Invalidate cache
    await revalidateTag("places");

    return result;
  });
```

---

## Quick Reference

**Core Utilities**:
- ✅ `createQueryPolicy` - Pagination, sorting, tenant enforcement
- ✅ `createSortPolicy` - Sort field definitions
- ✅ `createServerQueries` - Generate list/item/lite queries
- ✅ `withAuth` / `withTenantGuard` / `withSuperAdmin` - Auth guards
- ✅ `resolveTenantScope` - Get tenant from session
- ✅ `build<Entity>Where` - Build Prisma where
- ✅ `map<Entity>Row` - Transform to DTOs

---

See also:
- **03-clean-architecture.md** - Use case patterns
- **04-multi-tenant-security.md** - Tenant enforcement
- **06-tech-stack.md** - Prisma and Zod usage
