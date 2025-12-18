# 4. Multi-Tenant Security Rules

**Priority**: NON-NEGOTIABLE | CRITICAL

---

## 4.1 Tenant Model

<rule priority="CRITICAL">
**Tenant Key**: `merchantId` (foreign key in all tenant-scoped tables)

**Auth Model**: 
- Super admins can query globally (no tenant filter)
- Tenant users ALWAYS scoped to their `merchantId`
- Tenant ID comes from session, NEVER from client

**What is multi-tenant?**
Each organization (merchant) has isolated data. User in Merchant A cannot access data from Merchant B.
</rule>

### Tables with Tenant Scope

```typescript
// Tenant-scoped tables (have merchantId column)
✅ places
✅ campaigns
✅ games
✅ rewards
✅ transactions
✅ players

// Global tables (NO merchantId)
🌐 merchants (the tenants themselves)
🌐 users (can belong to multiple merchants via better-auth)
```

---

## 4.2 Enforcement Layers

<rule priority="CRITICAL">
**MANDATORY**: Enforce tenant isolation at ALL layers:

1. **Repository Layer** - Check tenant ownership before update/delete
2. **Use Case Layer** - Validate tenant access
3. **Query Policy Layer** - Add tenant filter to where clauses
4. **Action/Route Layer** - Validate input tenant matches session
</rule>

### Defense in Depth

```
┌─────────────────────────────────────────┐
│  Client (React)                         │  ← Cannot be trusted
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Server Action / API Route              │  ← Layer 1: Guard validates
│  withTenantGuard("merchantId")          │     input.merchantId === session.tenantId
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Use Case                               │  ← Layer 2: Validates ownership
│  ensureTenantAccess(id, tenantId)       │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Repository                             │  ← Layer 3: Verifies tenant
│  Checks merchantId before update/delete │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Query Policy                           │  ← Layer 4: Enforces in WHERE
│  enforceTenant(where, tenantId, field)  │
└─────────────────────────────────────────┘
```

---

## 4.3 Layer 1: Action/Route Guards

### withTenantGuard

<rule priority="MANDATORY">
**Purpose**: Validate that `merchantId` in input matches session tenant.

**When to use**: ALL tenant-scoped write actions (create/update/delete).

```typescript
// ✅ CORRECT: Validate tenant from input
export const createPlaceAction = withTenantGuard("merchantId")
  .inputSchema(placeCreateSchema.extend({ merchantId: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    // parsedInput.merchantId is guaranteed to match ctx.tenantId
    return await createUseCase.execute({
      ...parsedInput,
      merchantId: ctx.tenantId, // Use session tenant, not input
    });
  });

// ❌ FORBIDDEN: Trust client-provided tenant
export const createPlaceAction = withAuth
  .inputSchema(placeCreateSchema)
  .action(async ({ parsedInput }) => {
    // Attacker could provide any merchantId
    return await createUseCase.execute(parsedInput);
  });
```
</rule>

### withSuperAdmin

<rule priority="STRICT">
**Purpose**: Restrict action to super admins only.

**When to use**: 
- Creating/modifying merchants
- Global admin operations
- Operations that affect multiple tenants

```typescript
export const createMerchantAction = withSuperAdmin
  .inputSchema(merchantCreateSchema)
  .action(async ({ parsedInput, ctx }) => {
    // Only super admins can create merchants
    return await createUseCase.execute(parsedInput);
  });
```
</rule>

### withApiAuth

<rule priority="STRICT">
**Purpose**: Validate API key for external integrations.

**When to use**: Public API routes used by external systems.

```typescript
export const createExternalGameAction = withApiAuth
  .inputSchema(gameCreateSchema)
  .action(async ({ parsedInput, ctx }) => {
    // ctx.tenantId resolved from API key
    return await createUseCase.execute({
      ...parsedInput,
      merchantId: ctx.tenantId,
    });
  });
```
</rule>

---

## 4.4 Layer 2: Use Case Validation

### Tenant Access Check

<rule priority="MANDATORY">
**Pattern**: ALWAYS check tenant ownership before update/delete.

```typescript
// application/usecases/updatePlaceUseCase.ts
export class UpdatePlaceUseCase {
  constructor(private readonly repository: PlaceRepository) {}

  async execute(command: UpdatePlaceCommand) {
    const parsed = placeUpdateSchema.parse(command);

    if (!command.id) {
      throw new Error("ID is required for update");
    }

    // CRITICAL: Verify tenant owns this place
    if (command.merchantId) {
      await this.repository.ensureTenantAccess(
        command.id,
        command.merchantId
      );
    }

    return this.repository.update({
      ...parsed,
      id: command.id,
    });
  }
}
```
</rule>

---

## 4.5 Layer 3: Repository Enforcement

### ensureTenantAccess Method

<rule priority="MANDATORY">
**Purpose**: Verify record belongs to tenant before mutation.

**Required on**: Write Repository interface

```typescript
// application/interfaces/placeRepository.ts
export interface PlaceRepository {
  create(data: PlaceCreateInput & { merchantId: string }): Promise<Place>;
  update(data: PlaceUpdateInput & { id: string }): Promise<Place>;
  delete(id: string): Promise<void>;
  
  /**
   * CRITICAL: Verify tenant owns the record
   * @throws {Error} if record doesn't belong to tenant
   */
  ensureTenantAccess(id: string, tenantId: string): Promise<void>;
}

// infrastructure/prisma/prismaPlaceRepository.ts
export class PrismaPlaceRepository implements PlaceRepository {
  async ensureTenantAccess(id: string, tenantId: string): Promise<void> {
    const place = await this.client.place.findUnique({
      where: { id },
      select: { merchantId: true },
    });

    if (!place) {
      throw new Error(`Place not found: ${id}`);
    }

    if (place.merchantId !== tenantId) {
      throw new Error(
        `Access denied: Place ${id} does not belong to tenant ${tenantId}`
      );
    }
  }
}
```
</rule>

### Repository Create/Update

```typescript
// ALWAYS require merchantId for tenant-scoped creates
async create(data: PlaceCreateInput & { merchantId: string }) {
  // merchantId is REQUIRED in type signature
  return this.client.place.create({
    data: {
      ...data,
      merchantId: data.merchantId, // Explicitly set
    },
  });
}

// Updates and deletes should be called AFTER ensureTenantAccess
async update(data: PlaceUpdateInput & { id: string }) {
  // Assumes ensureTenantAccess was called in use case
  const { id, ...updateData } = data;
  return this.client.place.update({
    where: { id },
    data: updateData,
  });
}

async delete(id: string) {
  // Assumes ensureTenantAccess was called in use case
  await this.client.place.delete({
    where: { id },
  });
}
```

---

## 4.6 Layer 4: Query Policy Enforcement

### Query Policy Pattern

<rule priority="MANDATORY">
**Purpose**: Automatically add tenant filter to ALL read queries.

```typescript
// server/policy.ts
import { createQueryPolicy } from "@/server/core/policies/queryPolicy";
import { createSortPolicy } from "@/server/core/policies/sortPolicy";
import type { PlaceFilters } from "../model/placeSchema";

export const placeQueryPolicy = createQueryPolicy<PlaceFilters>({
  defaultPageSize: 10,
  maxPageSize: 100,
  allowedSortFields: ["localName", "city", "createdAt"],
  defaultSort: { field: "createdAt", order: "desc" },
});

export const placeSortPolicy = createSortPolicy({
  localName: { field: "localName", order: "asc" },
  city: { field: "city", order: "asc" },
  createdAt: { field: "createdAt", order: "desc" },
});
```
</rule>

### enforceTenant Method

<rule priority="CRITICAL">
**Purpose**: Add tenant filter to where clause.

**Usage**: Call BEFORE every tenant-scoped query.

```typescript
// In repository or queries.ts
const where = buildPlaceWhere(filters, tenantId);

// CRITICAL: Add tenant filter
const whereWithTenant = placeQueryPolicy.enforceTenant(
  where,
  tenantId,
  "merchantId" // Field name in table
);

// Now execute query
const places = await prisma.place.findMany({
  where: whereWithTenant,
  // ...
});
```

**What it does**:
```typescript
// Input where
{ localName: { contains: "Paris" } }

// After enforceTenant (tenant user)
{ 
  localName: { contains: "Paris" },
  merchantId: "tenant_123"  // ADDED
}

// After enforceTenant (super admin, tenantId = undefined)
{ localName: { contains: "Paris" } }  // No filter added
```
</rule>

---

## 4.7 Tenant Resolution

### resolveTenantScope

<rule priority="STRICT">
**Purpose**: Get tenant ID from session or allow global for super admins.

```typescript
// server/core/utils/resolveTenantScope.ts
import { getSession } from "@/lib/auth-server";

export async function resolveTenantScope(): Promise<string | undefined> {
  const session = await getSession();
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Super admins can query globally
  if (session.user.role === "super_admin") {
    return undefined; // No tenant filter
  }

  // Regular users must have tenant
  const tenantId = session.user.organizationId; // merchantId in better-auth
  
  if (!tenantId) {
    throw new Error("User has no tenant (organizationId)");
  }

  return tenantId;
}
```
</rule>

---

## 4.8 Common Patterns

### Pattern 1: List Query with Tenant

```typescript
// server/queries.ts
export const listPlacesServer = cache(
  async (rawFilters: unknown) => {
    const filters = placeFiltersSchema.parse(rawFilters);
    const tenantId = await resolveTenantScope(); // Get from session

    const where = buildPlaceWhere(filters, tenantId);
    const whereWithTenant = placeQueryPolicy.enforceTenant(
      where,
      tenantId,
      "merchantId"
    );

    const places = await prisma.place.findMany({
      where: whereWithTenant,
      // ...
    });

    return places;
  },
  ["places"]
);
```

### Pattern 2: Get Single Item with Tenant

```typescript
export const getPlaceServer = cache(
  async (id: string) => {
    const tenantId = await resolveTenantScope();

    const where: any = { id };
    
    // Super admins can access any place
    if (tenantId) {
      where.merchantId = tenantId;
    }

    const place = await prisma.place.findFirst({
      where,
      select: placeListSelect,
    });

    if (!place) {
      throw new Error(`Place not found: ${id}`);
    }

    return mapPlaceRow(place);
  },
  ["places"]
);
```

### Pattern 3: Create with Tenant

```typescript
export const createPlaceAction = withTenantGuard("merchantId")
  .inputSchema(placeCreateSchema.extend({ merchantId: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    // ctx.tenantId from session
    // parsedInput.merchantId validated to match session
    
    const result = await createUseCase.execute({
      ...parsedInput,
      merchantId: ctx.tenantId, // ALWAYS use session, not input
    });

    await revalidateTag("places");
    return result;
  });
```

### Pattern 4: Update with Tenant Check

```typescript
export const updatePlaceAction = withTenantGuard("merchantId")
  .inputSchema(placeUpdateSchema.extend({ 
    id: z.string(),
    merchantId: z.string() 
  }))
  .action(async ({ parsedInput, ctx }) => {
    // Use case will call repository.ensureTenantAccess
    const result = await updateUseCase.execute({
      ...parsedInput,
      merchantId: ctx.tenantId,
    });

    await revalidateTag("places");
    return result;
  });
```

---

## 4.9 Security Checklist

<checklist priority="CRITICAL">
**Before deploying ANY tenant-scoped feature**:

- ☐ Create actions use `withTenantGuard("merchantId")`
- ☐ Update actions use `withTenantGuard("merchantId")`
- ☐ Delete actions use `withTenantGuard("merchantId")`
- ☐ Use cases call `repository.ensureTenantAccess()` before mutations
- ☐ Repository `create()` requires `merchantId` in type signature
- ☐ All queries use `resolveTenantScope()` to get tenant
- ☐ All where clauses pass through `policy.enforceTenant()`
- ☐ List queries filter by `merchantId`
- ☐ Get-by-id queries filter by `merchantId`
- ☐ NO hardcoded tenant IDs anywhere
- ☐ NO tenant IDs from client-side (always from session)
</checklist>

---

## 4.10 Testing Tenant Isolation

```typescript
// Test that tenant A cannot access tenant B's data
describe("Tenant Isolation", () => {
  it("should not allow cross-tenant access", async () => {
    // Create place for tenant A
    const placeA = await createPlace({ merchantId: "tenant_A" });

    // Try to access as tenant B
    const tenantB = { tenantId: "tenant_B" };
    
    await expect(
      getPlaceServer(placeA.id, tenantB.tenantId)
    ).rejects.toThrow("Place not found");
  });

  it("should enforce tenant in list queries", async () => {
    // Create places for different tenants
    await createPlace({ merchantId: "tenant_A", name: "Place A" });
    await createPlace({ merchantId: "tenant_B", name: "Place B" });

    // Query as tenant A
    const result = await listPlacesServer({}, "tenant_A");
    
    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe("Place A");
  });
});
```

---

## Quick Reference

**Tenant Enforcement Layers**:
1. ✅ Action guards (`withTenantGuard`)
2. ✅ Use case validation (`ensureTenantAccess`)
3. ✅ Repository checks (before update/delete)
4. ✅ Query policies (`enforceTenant`)

**Golden Rules**:
- ❌ NEVER trust `merchantId` from client
- ✅ ALWAYS get `tenantId` from session
- ✅ ALWAYS filter queries by `merchantId`
- ✅ ALWAYS check ownership before mutations

---

See also:
- **03-clean-architecture.md** - Use case patterns
- **05-server-utilities.md** - Query policy details
- **09-anti-patterns.md** - Tenant security violations
