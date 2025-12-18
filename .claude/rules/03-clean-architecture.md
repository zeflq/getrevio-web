# 3. Clean Architecture Layers

**Priority**: MANDATORY

---

## 3.1 Layer Overview

<architecture_principle>
```
┌────────────────────────────────────────────────────┐
│  Interface Layer (Next.js Server Actions/Queries)  │  ← Framework
└────────────────────────────────────────────────────┘
                        ↓
┌────────────────────────────────────────────────────┐
│  Application Layer (Use Cases, Interfaces)         │  ← Business Logic
└────────────────────────────────────────────────────┘
                        ↓
┌────────────────────────────────────────────────────┐
│  Infrastructure Layer (Prisma, External Services)  │  ← Adapters
└────────────────────────────────────────────────────┘
```

**Dependency Rule**: Dependencies ONLY point inward.
- Interface depends on Application ✅
- Application depends on nothing (pure business logic) ✅
- Infrastructure implements Application interfaces ✅
- Application NEVER depends on Infrastructure ❌
</architecture_principle>

---

## 3.2 Application Layer (Core Business Logic)

### 3.2.1 Use Cases

<rule priority="MANDATORY">
**Purpose**: Encapsulate ONE business operation.

**Naming**: `<Verb><Entity>UseCase`
- `CreateMerchantUseCase`
- `UpdateMerchantUseCase`
- `DeleteMerchantUseCase`
- `ListMerchantsUseCase`
- `GetMerchantUseCase`

**Structure**:
```typescript
export class CreateMerchantUseCase {
  // 1. Dependency injection through constructor
  constructor(private readonly repository: MerchantRepository) {}

  // 2. Single public method: execute
  async execute(command: CreateMerchantCommand) {
    // 3. Validation
    const parsed = merchantCreateSchema.parse(command);

    // 4. Business logic
    // - Authorization checks
    // - Data transformation
    // - Domain rules

    // 5. Delegate to repository
    return this.repository.create(parsed);
  }
}
```
</rule>

### Use Case Patterns

#### Create Use Case

```typescript
// application/usecases/createPlaceUseCase.ts
import { placeCreateSchema } from "@/features/places/model/placeSchema";
import type { CreatePlaceCommand } from "../dto/createPlaceCommand";
import type { PlaceRepository } from "../interfaces/placeRepository";

export class CreatePlaceUseCase {
  constructor(private readonly repository: PlaceRepository) {}

  async execute(command: CreatePlaceCommand) {
    // Validate input
    const parsed = placeCreateSchema.parse(command);

    // Business logic: ensure tenant is set
    if (!command.merchantId) {
      throw new Error("Tenant ID (merchantId) is required");
    }

    // Delegate to repository
    return this.repository.create({
      ...parsed,
      merchantId: command.merchantId,
    });
  }
}
```

#### Update Use Case

```typescript
// application/usecases/updatePlaceUseCase.ts
export class UpdatePlaceUseCase {
  constructor(private readonly repository: PlaceRepository) {}

  async execute(command: UpdatePlaceCommand) {
    // Validate
    const parsed = placeUpdateSchema.parse(command);

    if (!command.id) {
      throw new Error("ID is required for update");
    }

    // Business logic: check ownership
    if (command.merchantId) {
      // Verify user owns this place
      await this.repository.ensureTenantAccess(command.id, command.merchantId);
    }

    // Delegate to repository
    return this.repository.update({
      ...parsed,
      id: command.id,
    });
  }
}
```

#### Delete Use Case

```typescript
// application/usecases/deletePlaceUseCase.ts
export class DeletePlaceUseCase {
  constructor(private readonly repository: PlaceRepository) {}

  async execute(command: DeletePlaceCommand) {
    if (!command.id) {
      throw new Error("ID is required for delete");
    }

    // Business logic: check if can delete
    // e.g., verify no active campaigns using this place

    // Enforce tenant access
    if (command.merchantId) {
      await this.repository.ensureTenantAccess(command.id, command.merchantId);
    }

    // Delegate to repository
    await this.repository.delete(command.id);
  }
}
```

---

### 3.2.2 Repository Interfaces (Ports)

<rule priority="MANDATORY">
**Purpose**: Define contracts for data access.

**Why interfaces?**
- ✅ Decouple business logic from database
- ✅ Enable testing with mocks
- ✅ Allow database swap without changing use cases
- ✅ Clear separation of concerns

**Pattern**: TWO interfaces per entity
1. Write Repository - mutations
2. Query Repository - reads
</rule>

#### Write Repository

```typescript
// application/interfaces/placeRepository.ts
import type { Place } from "@prisma/client";
import type { PlaceCreateInput, PlaceUpdateInput } from "../../model/placeSchema";

export interface PlaceRepository {
  /**
   * Create a new place
   * @throws {Error} if merchantId is missing
   */
  create(data: PlaceCreateInput & { merchantId: string }): Promise<Place>;

  /**
   * Update an existing place
   * @throws {Error} if place doesn't exist or tenant doesn't match
   */
  update(data: PlaceUpdateInput & { id: string }): Promise<Place>;

  /**
   * Delete a place
   * @throws {Error} if place doesn't exist or tenant doesn't match
   */
  delete(id: string): Promise<void>;

  /**
   * Verify tenant access to a place
   * @throws {Error} if tenant doesn't own the place
   */
  ensureTenantAccess(id: string, tenantId: string): Promise<void>;
}
```

#### Query Repository

```typescript
// application/interfaces/placeQueryRepository.ts
import type { PlaceListDTO, PlaceFilters } from "../../model/placeSchema";
import type { PaginatedList } from "@/types/lists";

export interface PlaceQueryRepository {
  /**
   * List places with pagination and filters
   * @param filters - search, sort, pagination
   * @param tenantId - ALWAYS filter by tenant
   */
  list(
    filters: PlaceFilters,
    tenantId?: string
  ): Promise<PaginatedList<PlaceListDTO>>;

  /**
   * Get a single place by ID
   * @param id - place ID
   * @param tenantId - ALWAYS filter by tenant
   */
  getById(id: string, tenantId?: string): Promise<PlaceListDTO | null>;

  /**
   * Get lite list for dropdowns (label/value pairs)
   * @param filters - search, limit
   * @param tenantId - ALWAYS filter by tenant
   */
  listLite(
    filters: PlaceFilters,
    tenantId?: string
  ): Promise<Array<{ label: string; value: string }>>;
}
```

---

### 3.2.3 DTOs (Commands)

<rule priority="STRICT">
**Purpose**: Transfer data between layers.

**Pattern**: `<Action><Entity>Command`

```typescript
// application/dto/createPlaceCommand.ts
export interface CreatePlaceCommand {
  // Required fields
  localName: string;
  nameEn?: string;
  addressLine1: string;
  city: string;
  country: string;
  merchantId: string;  // CRITICAL: Always include tenant

  // Optional fields
  addressLine2?: string;
  postalCode?: string;
  region?: string;
  placeCode?: string;
}
```

**Why not use Zod types directly?**
- DTOs are internal to application layer
- Can include additional context (e.g., `userId`, `tenantId`)
- Clear separation from validation schemas
</rule>

---

## 3.3 Infrastructure Layer (Adapters)

### 3.3.1 Prisma Repository Implementation

<rule priority="MANDATORY">
**Purpose**: Implement repository interfaces using Prisma.

**Rules**:
- ✅ Implements interface from application layer
- ✅ Handles database-specific logic
- ✅ Enforces tenant isolation
- ❌ NO business logic (validation, authorization)
- ❌ NO framework-specific code (Next.js)
</rule>

```typescript
// infrastructure/prisma/prismaPlaceRepository.ts
import { PrismaClient } from "@prisma/client";
import type { PlaceRepository } from "../../application/interfaces/placeRepository";
import type { PlaceCreateInput, PlaceUpdateInput } from "../../model/placeSchema";

export class PrismaPlaceRepository implements PlaceRepository {
  constructor(private readonly client: PrismaClient) {}

  async create(data: PlaceCreateInput & { merchantId: string }) {
    // No validation - that's in use case
    // Just persist data
    return this.client.place.create({
      data: {
        localName: data.localName,
        nameEn: data.nameEn ?? null,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 ?? null,
        city: data.city,
        postalCode: data.postalCode ?? null,
        region: data.region ?? null,
        country: data.country,
        placeCode: data.placeCode ?? null,
        merchantId: data.merchantId,
      },
    });
  }

  async update(data: PlaceUpdateInput & { id: string }) {
    // CRITICAL: This should be called AFTER tenant access check in use case
    const { id, ...updateData } = data;
    
    return this.client.place.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    // CRITICAL: This should be called AFTER tenant access check in use case
    await this.client.place.delete({
      where: { id },
    });
  }

  async ensureTenantAccess(id: string, tenantId: string): Promise<void> {
    const place = await this.client.place.findUnique({
      where: { id },
      select: { merchantId: true },
    });

    if (!place) {
      throw new Error(`Place not found: ${id}`);
    }

    if (place.merchantId !== tenantId) {
      throw new Error(`Access denied: Place ${id} does not belong to tenant ${tenantId}`);
    }
  }
}
```

### 3.3.2 Query Repository Implementation

```typescript
// infrastructure/prisma/prismaPlaceQueryRepository.ts
import { PrismaClient } from "@prisma/client";
import type { PlaceQueryRepository } from "../../application/interfaces/placeQueryRepository";
import type { PlaceFilters } from "../../model/placeSchema";
import { buildPlaceWhere } from "../../server/buildWhere";
import { placeQueryPolicy } from "../../server/policy";
import { mapPlaceRow } from "../../server/mappers";
import { placeListSelect } from "./placeSelects";

export class PrismaPlaceQueryRepository implements PlaceQueryRepository {
  constructor(private readonly client: PrismaClient) {}

  async list(filters: PlaceFilters, tenantId?: string) {
    // Build where clause
    const where = buildPlaceWhere(filters, tenantId);
    
    // Enforce tenant (CRITICAL)
    const whereWithTenant = placeQueryPolicy.enforceTenant(
      where,
      tenantId,
      "merchantId"
    );

    // Apply pagination and sorting
    const { take, skip, orderBy } = placeQueryPolicy.buildQuery(filters);

    // Execute queries
    const [items, total] = await Promise.all([
      this.client.place.findMany({
        where: whereWithTenant,
        select: placeListSelect,
        take,
        skip,
        orderBy,
      }),
      this.client.place.count({ where: whereWithTenant }),
    ]);

    // Map to DTOs
    const mappedItems = items.map(mapPlaceRow);

    return {
      items: mappedItems,
      pagination: {
        total,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    };
  }

  async getById(id: string, tenantId?: string) {
    const where: any = { id };
    
    // Enforce tenant
    if (tenantId) {
      where.merchantId = tenantId;
    }

    const place = await this.client.place.findFirst({
      where,
      select: placeListSelect,
    });

    return place ? mapPlaceRow(place) : null;
  }

  async listLite(filters: PlaceFilters, tenantId?: string) {
    const where = buildPlaceWhere(filters, tenantId);
    const whereWithTenant = placeQueryPolicy.enforceTenant(
      where,
      tenantId,
      "merchantId"
    );

    const places = await this.client.place.findMany({
      where: whereWithTenant,
      select: { id: true, localName: true },
      take: filters.pageSize,
      orderBy: { localName: "asc" },
    });

    return places.map((p) => ({
      label: p.localName,
      value: p.id,
    }));
  }
}
```

---

## 3.4 Interface Layer (Next.js Integration)

### Server Actions (Writes)

```typescript
// server/actions.ts or interface/actions/createPlace.ts
import { withTenantGuard } from "@/server/core/guards/authGuards";
import { placeCreateSchema } from "../model/placeSchema";
import { revalidateTag } from "next/cache";
import { CreatePlaceUseCase } from "./application/usecases/createPlaceUseCase";
import { PrismaPlaceRepository } from "./infrastructure/prisma/prismaPlaceRepository";
import { prisma } from "@/lib/prisma";

// Instantiate dependencies
const repository = new PrismaPlaceRepository(prisma);
const createUseCase = new CreatePlaceUseCase(repository);

export const createPlaceAction = withTenantGuard("merchantId")
  .inputSchema(placeCreateSchema.extend({ merchantId: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    // Validate tenant from session matches input
    if (parsedInput.merchantId !== ctx.tenantId) {
      throw new Error("Tenant mismatch");
    }

    // Delegate to use case
    const result = await createUseCase.execute({
      ...parsedInput,
      merchantId: ctx.tenantId,
    });

    // Revalidate cache
    await revalidateTag("places");

    return result;
  });
```

### Server Queries (Reads)

```typescript
// server/queries.ts
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
  model: "place",
  filtersSchema: placeFiltersSchema,
  policy: placeQueryPolicy,
  buildWhere: buildPlaceWhere,
  mapRow: mapPlaceRow,
  select: placeListSelect,
  cacheTag: "places",
  liteFields: { label: "localName", value: "id" },
});
```

---

## Quick Reference

**Dependency Flow Checklist**:
- ☐ Actions import use cases ✅
- ☐ Use cases import repository interfaces ✅
- ☐ Repositories implement interfaces ✅
- ☐ Use cases NEVER import Prisma ❌
- ☐ Repositories NEVER import Next.js ❌
- ☐ Application layer is framework-agnostic ✅

**Clean Architecture Benefits**:
- ✅ Testable (mock repositories)
- ✅ Maintainable (clear responsibilities)
- ✅ Portable (swap Prisma for another ORM)
- ✅ Scalable (add features without breaking existing)

---

See also:
- **02-feature-structure.md** - Folder organization
- **04-multi-tenant-security.md** - Tenant enforcement patterns
- **09-anti-patterns.md** - What NOT to do
