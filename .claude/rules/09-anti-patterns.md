# 9. Anti-Patterns (BANNED)

**Priority**: CRITICAL

These patterns are **strictly forbidden** in the codebase. Violations compromise security, maintainability, or architecture.

---

## 9.1 Architecture Violations

### ❌ Cross-Feature Internal Imports

<banned_pattern priority="CRITICAL">
**NEVER** import from another feature's internals.

```typescript
// ❌ BAD - Reaching into another feature's internals
import { MerchantRepository } from '@/features/merchants/server/application/interfaces/merchantRepository'
import { CreateMerchantUseCase } from '@/features/merchants/server/application/usecases/createMerchantUseCase'
import { MerchantFormFields } from '@/features/merchants/components/MerchantFormFields'

// ✅ GOOD - Use public API
import { useMerchantsList, MerchantColumns } from '@/features/merchants'
```

**Why**: Breaks encapsulation, creates tight coupling, makes refactoring impossible.
</banned_pattern>

### ❌ Business Logic in Actions

<banned_pattern priority="CRITICAL">
**NEVER** put business logic in server actions.

```typescript
// ❌ BAD - Business logic in action
export const createPlaceAction = withAuth
  .inputSchema(schema)
  .action(async ({ parsedInput }) => {
    // Validation logic ❌
    if (!parsedInput.email.includes('@')) {
      throw new Error('Invalid email');
    }
    
    // Complex business rules ❌
    if (parsedInput.plan === 'enterprise' && !parsedInput.taxId) {
      throw new Error('Enterprise plan requires tax ID');
    }
    
    // Direct Prisma call ❌
    const place = await prisma.place.create({ data: parsedInput });
    return place;
  });

// ✅ GOOD - Delegate to use case
export const createPlaceAction = withAuth
  .inputSchema(schema)
  .action(async ({ parsedInput, ctx }) => {
    // Only orchestration - delegate to use case
    return await createUseCase.execute({
      ...parsedInput,
      tenantId: ctx.tenantId,
    });
  });
```

**Why**: Actions are interface layer. Business logic belongs in use cases.
</banned_pattern>

### ❌ Business Logic in Repositories

<banned_pattern priority="CRITICAL">
**NEVER** put business logic in repository implementations.

```typescript
// ❌ BAD - Validation in repository
class PrismaPlaceRepository {
  async create(data) {
    // Validation ❌
    if (!data.email.includes('@')) {
      throw new Error('Invalid email');
    }
    
    // Business rules ❌
    if (data.plan === 'enterprise') {
      data.maxPlaces = 1000;
    }
    
    return await this.client.place.create({ data });
  }
}

// ✅ GOOD - Repository is dumb
class PrismaPlaceRepository {
  async create(data) {
    // Just persist data - no logic
    return await this.client.place.create({
      data: {
        localName: data.localName,
        merchantId: data.merchantId,
        // ...
      },
    });
  }
}

// ✅ GOOD - Validation in use case
class CreatePlaceUseCase {
  async execute(command) {
    // Validation here ✅
    const validated = placeCreateSchema.parse(command);
    
    // Business logic here ✅
    if (validated.plan === 'enterprise') {
      validated.maxPlaces = 1000;
    }
    
    // Repository is called with clean data
    return this.repository.create(validated);
  }
}
```

**Why**: Repositories are infrastructure layer. Business logic belongs in use cases.
</banned_pattern>

### ❌ Use Cases Importing Prisma

<banned_pattern priority="CRITICAL">
**NEVER** import Prisma directly in use cases.

```typescript
// ❌ BAD - Use case depends on Prisma
import { prisma } from '@/lib/prisma';

class CreatePlaceUseCase {
  async execute(command) {
    // Direct Prisma access ❌
    const place = await prisma.place.create({ data: command });
    return place;
  }
}

// ✅ GOOD - Use case depends on interface
import type { PlaceRepository } from '../interfaces/placeRepository';

class CreatePlaceUseCase {
  constructor(private readonly repository: PlaceRepository) {}
  
  async execute(command) {
    // Repository abstraction ✅
    return this.repository.create(command);
  }
}
```

**Why**: Violates dependency inversion. Use cases should depend on abstractions, not implementations.
</banned_pattern>

---

## 9.2 Multi-Tenant Security Violations

### ❌ Skipping Tenant Enforcement

<banned_pattern priority="CRITICAL">
**NEVER** query tenant-scoped data without filtering by `merchantId`.

```typescript
// ❌ BAD - No tenant filter
const places = await prisma.place.findMany({
  where: { city: 'Paris' }
});

// ✅ GOOD - Always filter by tenant
const tenantId = await resolveTenantScope();
const where = buildPlaceWhere(filters, tenantId);
const whereWithTenant = placeQueryPolicy.enforceTenant(
  where,
  tenantId,
  "merchantId"
);

const places = await prisma.place.findMany({
  where: whereWithTenant
});
```

**Why**: Data leak - users can access data from other tenants.
</banned_pattern>

### ❌ Trusting Client-Side Tenant ID

<banned_pattern priority="CRITICAL">
**NEVER** trust `merchantId` from client input.

```typescript
// ❌ BAD - Trust client input
export const createPlaceAction = withAuth
  .inputSchema(schema)
  .action(async ({ parsedInput }) => {
    // Attacker can provide any merchantId ❌
    return await repository.create(parsedInput);
  });

// ✅ GOOD - Use session tenant
export const createPlaceAction = withTenantGuard("merchantId")
  .inputSchema(schema.extend({ merchantId: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    // ctx.tenantId from session (validated by guard)
    return await useCase.execute({
      ...parsedInput,
      merchantId: ctx.tenantId, // ✅ From session
    });
  });
```

**Why**: Security breach - users can create data under any tenant.
</banned_pattern>

### ❌ No Tenant Check Before Update/Delete

<banned_pattern priority="CRITICAL">
**NEVER** update or delete without verifying tenant ownership.

```typescript
// ❌ BAD - No ownership check
export const deletePlaceAction = withAuth
  .inputSchema(z.object({ id: z.string() }))
  .action(async ({ parsedInput }) => {
    // Can delete ANY place ❌
    await prisma.place.delete({ where: { id: parsedInput.id } });
  });

// ✅ GOOD - Verify ownership
export const deletePlaceAction = withTenantGuard("merchantId")
  .inputSchema(z.object({ 
    id: z.string(),
    merchantId: z.string() 
  }))
  .action(async ({ parsedInput, ctx }) => {
    // Use case verifies tenant owns this place ✅
    await deleteUseCase.execute({
      id: parsedInput.id,
      merchantId: ctx.tenantId,
    });
  });

// In use case
class DeletePlaceUseCase {
  async execute(command) {
    // Verify ownership ✅
    await this.repository.ensureTenantAccess(
      command.id,
      command.merchantId
    );
    
    // Now safe to delete
    await this.repository.delete(command.id);
  }
}
```

**Why**: Security breach - users can modify/delete other tenants' data.
</banned_pattern>

---

## 9.3 Type Safety Violations

### ❌ Using `any` Without Justification

<banned_pattern priority="STRICT">
**NEVER** use `any` unless absolutely necessary.

```typescript
// ❌ BAD
function processData(data: any) {
  return data.items.map((item: any) => item.name);
}

// ✅ GOOD
function processData(data: { items: Array<{ name: string }> }) {
  return data.items.map((item) => item.name);
}

// ✅ ACCEPTABLE (with comment)
function legacyAdapter(data: any) {
  // TODO: Type this when legacy API is documented
  return data;
}
```

**Why**: Defeats TypeScript's purpose. Hides bugs.
</banned_pattern>

### ❌ Suppressing TypeScript Errors

<banned_pattern priority="STRICT">
**NEVER** use `@ts-ignore` or `@ts-nocheck`.

```typescript
// ❌ BAD
// @ts-ignore
const result = someFunction(invalidArg);

// ✅ GOOD - Fix the underlying issue
const result = someFunction(validArg);

// ✅ ACCEPTABLE - Use @ts-expect-error with explanation
// @ts-expect-error: Legacy API typing issue - will fix in TASK-123
const result = legacyApi.call();
```

**Why**: Hides real problems. Use `@ts-expect-error` if you must (documents that it's intentional).
</banned_pattern>

---

## 9.4 React Violations

### ❌ API Calls in Components

<banned_pattern priority="STRICT">
**NEVER** make API calls directly in components.

```typescript
// ❌ BAD - API call in component
export function PlacesList() {
  const [places, setPlaces] = useState([]);
  
  useEffect(() => {
    fetch('/api/places')
      .then(res => res.json())
      .then(setPlaces);
  }, []);
  
  return <div>{/* ... */}</div>;
}

// ✅ GOOD - Use hooks
export function PlacesList() {
  const { data: places } = usePlacesList({ page: 1 });
  
  return <div>{/* ... */}</div>;
}
```

**Why**: Harder to test, no caching, duplicated logic, error handling inconsistent.
</banned_pattern>

### ❌ Index Keys in Lists

<banned_pattern priority="STRICT">
**NEVER** use array index as React key.

```typescript
// ❌ BAD
places.map((place, index) => (
  <PlaceCard key={index} place={place} />
))

// ✅ GOOD
places.map((place) => (
  <PlaceCard key={place.id} place={place} />
))
```

**Why**: Causes rendering bugs when list order changes.
</banned_pattern>

---

## 9.5 Security Violations

### ❌ Hardcoded Credentials or IDs

<banned_pattern priority="CRITICAL">
**NEVER** hardcode credentials, API keys, or tenant IDs.

```typescript
// ❌ BAD
const merchantId = "merchant_abc123";
const apiKey = "sk_live_xyz789";

// ✅ GOOD
const merchantId = ctx.tenantId;
const apiKey = process.env.API_KEY;
```

**Why**: Security breach, makes code non-portable.
</banned_pattern>

### ❌ Leaking Secrets to Client

<banned_pattern priority="CRITICAL">
**NEVER** expose server-side secrets to client.

```typescript
// ❌ BAD - Exposes secret
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// ✅ GOOD - Server-side only
// In server action or API route
const stripeKey = process.env.STRIPE_SECRET_KEY;
```

**Why**: Security breach - credentials exposed in client bundle.
</banned_pattern>

### ❌ SQL Injection Risks

<banned_pattern priority="CRITICAL">
**NEVER** build SQL queries with string concatenation.

```typescript
// ❌ BAD - SQL injection
const query = `SELECT * FROM places WHERE city = '${userInput}'`;

// ✅ GOOD - Use Prisma (handles escaping)
const places = await prisma.place.findMany({
  where: { city: userInput }
});
```

**Why**: Security breach - SQL injection attack.
</banned_pattern>

---

## 9.6 Performance Violations

### ❌ N+1 Query Problems

<banned_pattern priority="STRICT">
**NEVER** fetch relations in loops.

```typescript
// ❌ BAD - N+1 queries
const places = await prisma.place.findMany();
for (const place of places) {
  place.merchant = await prisma.merchant.findUnique({
    where: { id: place.merchantId }
  });
}

// ✅ GOOD - Include relations
const places = await prisma.place.findMany({
  include: { merchant: true }
});
```

**Why**: Performance - causes N+1 query problem.
</banned_pattern>

### ❌ Caching User Data Without Tenant Scope

<banned_pattern priority="CRITICAL">
**NEVER** cache tenant-scoped data without including tenant in cache key.

```typescript
// ❌ BAD - Cache not scoped to tenant
export const listPlacesServer = cache(
  async (filters) => {
    const places = await prisma.place.findMany();
    return places;
  },
  ["places"] // ❌ All tenants share cache
);

// ✅ GOOD - Tenant-scoped cache
export const listPlacesServer = cache(
  async (filters) => {
    const tenantId = await resolveTenantScope();
    const where = buildPlaceWhere(filters, tenantId);
    const whereWithTenant = policy.enforceTenant(where, tenantId, "merchantId");
    const places = await prisma.place.findMany({ where: whereWithTenant });
    return places;
  },
  ["places"] // Cache is per-tenant via query policy
);
```

**Why**: Data leak - users see cached data from other tenants.
</banned_pattern>

---

## 9.7 Error Handling Violations

### ❌ Swallowing Errors

<banned_pattern priority="STRICT">
**NEVER** catch errors without handling them.

```typescript
// ❌ BAD - Silent failure
try {
  await createPlace(data);
} catch (error) {
  // Swallowed ❌
}

// ✅ GOOD - Log and/or rethrow
try {
  await createPlace(data);
} catch (error) {
  console.error('Failed to create place:', error);
  throw error;
}
```

**Why**: Bugs go unnoticed. Hard to debug.
</banned_pattern>

### ❌ Generic Error Messages

<banned_pattern priority="STRICT">
**NEVER** show generic errors without context.

```typescript
// ❌ BAD
throw new Error("Something went wrong");

// ✅ GOOD
throw new Error(`Failed to create place: ${error.message}`);
```

**Why**: Impossible to debug. Poor user experience.
</banned_pattern>

---

## 9.8 Code Smell Summary

<code_smells>
Additional patterns to avoid:

❌ **Magic numbers** - Use named constants
❌ **Duplicate code** - Extract to functions/hooks
❌ **Long functions** (>50 lines) - Split into smaller functions
❌ **Deep nesting** (>3 levels) - Early returns, extract functions
❌ **Comments explaining what** - Code should be self-documenting
❌ **Commented-out code** - Delete it (version control exists)
❌ **console.log in production** - Use proper logging
❌ **TODO without ticket** - Create ticket or fix immediately
</code_smells>

---

## 9.9 Quick Anti-Pattern Checklist

Before committing code, check:

- ☐ No cross-feature internal imports
- ☐ No business logic in actions or repositories
- ☐ No use cases importing Prisma directly
- ☐ All tenant-scoped queries filter by `merchantId`
- ☐ Tenant ID from session, not client
- ☐ Update/delete operations verify tenant ownership
- ☐ No `any` without justification
- ☐ No `@ts-ignore` (use `@ts-expect-error` with comment)
- ☐ No API calls in components (use hooks)
- ☐ No array index as React key
- ☐ No hardcoded credentials or IDs
- ☐ No secrets exposed to client
- ☐ No string concatenation for SQL
- ☐ No N+1 queries (use `include` or `select`)
- ☐ Tenant-scoped caching
- ☐ Proper error handling (no swallowing)

---

## Consequences of Violations

**Security violations** → Data breaches, unauthorized access
**Architecture violations** → Technical debt, impossible refactoring
**Type safety violations** → Runtime bugs, poor developer experience
**Performance violations** → Slow app, high costs

**When in doubt**: Ask for code review. Better to catch anti-patterns early.

---

See also:
- **04-multi-tenant-security.md** - Security patterns
- **03-clean-architecture.md** - Architecture patterns
- **08-naming-conventions.md** - Correct naming
