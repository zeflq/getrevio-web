# 6. Tech Stack Patterns

---

## 6.1 Next.js App Router

**Version**: 14+ with App Router

### Server Actions

<rule priority="MANDATORY">
**Location**: `features/<entity>/server/actions.ts`

**Pattern**:
```typescript
"use server";

import { withTenantGuard } from "@/server/core/guards/authGuards";
import { revalidateTag } from "next/cache";

export const createPlaceAction = withTenantGuard("merchantId")
  .inputSchema(placeCreateSchema.extend({ merchantId: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    const result = await createUseCase.execute({
      ...parsedInput,
      merchantId: ctx.tenantId,
    });
    
    await revalidateTag("places");
    
    return result;
  });
```

**Rules**:
- ✅ Always use `"use server"` directive
- ✅ Return serializable data only
- ✅ Use guards for auth (`withAuth`, `withTenantGuard`, etc.)
- ✅ Revalidate cache after mutations
- ❌ NO React hooks in server actions
- ❌ NO client-side state
</rule>

### Server Components

```typescript
// app/places/page.tsx
import { listPlacesServer } from "@/features/places/server/queries";

export default async function PlacesPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  // Server query - no loading state needed
  const result = await listPlacesServer({
    q: searchParams.q,
    page: Number(searchParams.q) || 1,
  });

  return (
    <div>
      <PlacesList places={result.items} />
      <Pagination {...result.pagination} />
    </div>
  );
}
```

### Cache Tags

<rule priority="STRICT">
**Purpose**: Invalidate cache after mutations.

```typescript
// In server action
await revalidateTag("places");

// In query (uses React cache)
export const listPlacesServer = cache(
  async (filters) => {
    // query logic
  },
  ["places"] // Cache tag
);
```

**Cache tags by entity**:
- `merchants`
- `places`
- `campaigns`
- `games`
- `rewards`
</rule>

---

## 6.2 Prisma

**Version**: 5.x

### Schema Organization

```prisma
// prisma/schema.prisma

model Merchant {
  id        String   @id @default(cuid())
  name      String
  email     String?
  plan      String
  status    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  places    Place[]
  campaigns Campaign[]
  
  @@map("merchants")
}

model Place {
  id           String   @id @default(cuid())
  localName    String
  nameEn       String?
  addressLine1 String
  city         String
  country      String
  merchantId   String   // Tenant key
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  merchant     Merchant @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  
  @@index([merchantId])
  @@map("places")
}
```

### Prisma Client Usage

<rule priority="MANDATORY">
**Location**: `src/lib/prisma.ts`

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

**Rules**:
- ✅ Single instance (singleton pattern)
- ✅ Import from `@/lib/prisma`
- ❌ NO direct Prisma imports in use cases
- ❌ NO `new PrismaClient()` elsewhere
</rule>

### Prisma Selects

<rule priority="STRICT">
**Purpose**: Define reusable select objects for type safety.

```typescript
// infrastructure/prisma/placeSelects.ts
import { Prisma } from "@prisma/client";

export const placeListSelect = {
  id: true,
  localName: true,
  nameEn: true,
  addressLine1: true,
  addressLine2: true,
  city: true,
  postalCode: true,
  region: true,
  country: true,
  placeCode: true,
  merchantId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PlaceSelect;

// Infer type from select
export type PlaceListRow = Prisma.PlaceGetPayload<{
  select: typeof placeListSelect;
}>;

// Detail view with relations
export const placeDetailSelect = {
  ...placeListSelect,
  merchant: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.PlaceSelect;

export type PlaceDetailRow = Prisma.PlaceGetPayload<{
  select: typeof placeDetailSelect;
}>;
```
</rule>

### Query Patterns

```typescript
// List with pagination
const places = await prisma.place.findMany({
  where,
  select: placeListSelect,
  take: 10,
  skip: 0,
  orderBy: { createdAt: "desc" },
});

// Count for pagination
const total = await prisma.place.count({ where });

// Get single item
const place = await prisma.place.findUnique({
  where: { id },
  select: placeDetailSelect,
});

// Create
const newPlace = await prisma.place.create({
  data: {
    localName: "Paris HQ",
    merchantId: "tenant_123",
    // ...
  },
});

// Update
const updated = await prisma.place.update({
  where: { id },
  data: { localName: "Paris Office" },
});

// Delete
await prisma.place.delete({
  where: { id },
});
```

---

## 6.3 Zod Validation

**Version**: 3.x

### Schema Patterns

<rule priority="MANDATORY">
**Location**: `features/<entity>/model/<entity>Schema.ts`

```typescript
import { z } from "zod";

// Base schema for creation
export const placeCreateSchema = z.object({
  localName: z.string().trim().min(1, "Local name required"),
  nameEn: z.string().trim().optional().or(z.literal("")),
  addressLine1: z.string().trim().min(1, "Address required"),
  addressLine2: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().min(1, "City required"),
  postalCode: z.string().trim().optional().or(z.literal("")),
  region: z.string().trim().optional().or(z.literal("")),
  country: z.string().trim().min(1, "Country required"),
  placeCode: z.string().trim().optional().or(z.literal("")),
});

// Update schema (all optional + id)
export const placeUpdateSchema = placeCreateSchema.partial().extend({
  id: z.string().optional(),
});

// Filter schema with transformation
export const placeFiltersSchema = z
  .object({
    q: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    _page: z.coerce.number().int().min(1).optional(),
    _limit: z.coerce.number().int().min(1).max(100).optional(),
    _sort: z.enum(["localName", "city", "createdAt"]).optional(),
    _order: z.enum(["asc", "desc"]).optional(),
  })
  .transform((p) => ({
    q: p.q,
    city: p.city,
    country: p.country,
    page: p._page ?? 1,
    pageSize: p._limit ?? 10,
    sort: p._sort ?? ("createdAt" as const),
    order: p._order ?? ("desc" as const),
  }));

// Infer types
export type PlaceCreateInput = z.infer<typeof placeCreateSchema>;
export type PlaceUpdateInput = z.infer<typeof placeUpdateSchema>;
export type PlaceFilters = z.output<typeof placeFiltersSchema>;
```
</rule>

### Zod Refinements

```typescript
// Custom validation
export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Conditional validation
export const campaignSchema = z.object({
  type: z.enum(["instant", "scheduled"]),
  startDate: z.date().optional(),
}).refine(
  (data) => {
    if (data.type === "scheduled") {
      return !!data.startDate;
    }
    return true;
  },
  {
    message: "Start date required for scheduled campaigns",
    path: ["startDate"],
  }
);
```

### Zod with React Hook Form

```typescript
import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm<PlaceCreateInput>({
  resolver: zodResolver(placeCreateSchema),
  defaultValues: {
    localName: "",
    addressLine1: "",
    city: "",
    country: "",
  },
});
```

---

## 6.4 React Hook Form

**Version**: 7.x

### Form Setup

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { placeCreateSchema } from "@/features/places/model/placeSchema";
import type { PlaceCreateInput } from "@/features/places/model/placeSchema";

export function CreatePlaceForm() {
  const form = useForm<PlaceCreateInput>({
    resolver: zodResolver(placeCreateSchema),
    defaultValues: {
      localName: "",
      nameEn: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      postalCode: "",
      region: "",
      country: "",
      placeCode: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const result = await createPlaceAction({
      ...data,
      merchantId: tenantId,
    });
    
    if (result.success) {
      form.reset();
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        {/* Fields */}
      </form>
    </Form>
  );
}
```

### Form Fields

```typescript
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

<FormField
  control={form.control}
  name="localName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Local Name</FormLabel>
      <FormControl>
        <Input placeholder="Enter local name" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Form Submission with Server Actions

```typescript
const { mutateAsync, isPending } = usePlaceCreateAction();

const onSubmit = form.handleSubmit(async (data) => {
  try {
    const result = await mutateAsync({
      ...data,
      merchantId: tenantId,
    });

    if (result.success) {
      toast({ title: "Place created" });
      form.reset();
      onSuccess?.();
    }
  } catch (error) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  }
});
```

---

## 6.5 React Query

**Version**: 5.x

### Query Keys

<rule priority="STRICT">
**Pattern**: `["entity", operation, ...params]`

```typescript
// List queries
["places", "list", { page: 1, pageSize: 10 }]

// Single item
["places", "item", id]

// Lite queries (dropdowns)
["places", "lite", { q: "Paris" }]
```
</rule>

### CRUD Bridge Pattern

```typescript
// hooks/usePlaceCrud.ts
import { createCrudBridge } from "@/hooks/createCrudBridge";
import {
  listPlacesServer,
  getPlaceServer,
  listPlacesLiteServer,
} from "../server/queries";
import {
  createPlaceAction,
  updatePlaceAction,
  deletePlaceAction,
} from "../server/actions";

const {
  useList: usePlacesList,
  useItem: usePlaceItem,
  useLite: usePlacesLite,
  useCreateAction: usePlaceCreateAction,
  useUpdateAction: usePlaceUpdateAction,
  useDeleteAction: usePlaceDeleteAction,
} = createCrudBridge({
  queryKey: "places",
  listServer: listPlacesServer,
  itemServer: getPlaceServer,
  liteServer: listPlacesLiteServer,
  createAction,
  updateAction,
  deleteAction,
});

export {
  usePlacesList,
  usePlaceItem,
  usePlacesLite,
  usePlaceCreateAction,
  usePlaceUpdateAction,
  usePlaceDeleteAction,
};
```

---

## 6.6 TypeScript

**Version**: 5.x

### Type Safety Rules

<rule priority="STRICT">
- ✅ Use `type` for object shapes
- ✅ Use `interface` for contracts (repositories)
- ✅ Infer types from Zod schemas
- ✅ Use `satisfies` for Prisma selects
- ❌ NO `any` without justification
- ❌ NO `@ts-ignore` (use `@ts-expect-error` with comment)
</rule>

### Type Patterns

```typescript
// Zod inference
export type PlaceCreateInput = z.infer<typeof placeCreateSchema>;

// Prisma inference
export type PlaceListRow = Prisma.PlaceGetPayload<{
  select: typeof placeListSelect;
}>;

// Function types
type MapperFn<T, R> = (row: T) => R;
type BuildWhereFn<F> = (filters: F, tenantId?: string) => Prisma.PlaceWhereInput;

// Utility types
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };
```

---

## Quick Reference

**Tech Stack**:
- Next.js 14+ (App Router, Server Actions, Server Components)
- Prisma 5.x (ORM, migrations, type generation)
- Zod 3.x (Runtime validation, type inference)
- React Hook Form 7.x (Form state management)
- React Query 5.x (Server state management)
- TypeScript 5.x (Type safety)

**Patterns**:
- ✅ Server Actions for writes
- ✅ Server Queries (cached) for reads
- ✅ Zod schemas for validation
- ✅ Prisma selects for type safety
- ✅ React Hook Form + Zod resolver
- ✅ CRUD bridge for client hooks

---

See also:
- **02-feature-structure.md** - Schema patterns
- **05-server-utilities.md** - Query utilities
- **07-client-patterns.md** - CRUD bridge details
