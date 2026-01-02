# API Migration Plan: Server Actions → Direct External API

**Date**: 2025-12-31
**Goal**: Remove all Next.js server actions and call external API directly from client components

---

## 📋 Overview

**Current Architecture:**
```
Client Component → Server Action → Use Case → Repository → Prisma
                                                              ↓
                                                     External Database
```

**Target Architecture:**
```
Client Component → External API (via fetch) → Backend API → Database
                    ↑ credentials: 'include'
```

---

## 🎯 Core Changes

### 1. Update `createCrudBridge()`

**File**: `/src/hooks/createCrudBridge.ts`

**Changes**:
- ✅ Replace `useAction` (next-safe-action) with `useMutation` (React Query)
- ✅ Remove dependency on server actions
- ✅ Accept mutation functions that call external API directly
- ✅ **Flatten mutations** to root level (consistent with `get` and `liteList`)
- ✅ **Rename hooks**: `useCreateAction` → `useCreateMutation` (and same for update/remove)
- ✅ Keep read operations as-is (already using REST)

**Before**:
```typescript
actions?: {
  create?: (...args: any[]) => Promise<any>;  // ❌ Server Action
  update?: (...args: any[]) => Promise<any>;  // ❌ Server Action
  remove?: (...args: any[]) => Promise<any>;  // ❌ Server Action
}

// Returns:
useCreateAction, useUpdateAction, useRemoveAction
```

**After**:
```typescript
// ✅ Flattened at root level (like get and liteList)
create?: (input: any) => Promise<any>;      // ✅ API call function
update?: (input: any) => Promise<any>;      // ✅ API call function
remove?: (input: any) => Promise<any>;      // ✅ API call function

// Returns:
useCreateMutation, useUpdateMutation, useRemoveMutation
```

---

### 2. Use Existing HTTP Client & Endpoints

**Existing Files**:
- ✅ `/src/shared/lib/http.ts` - Already has HTTP client with auth
- ✅ `/src/shared/api/endpoints.json` - Centralized endpoint definitions

**HTTP Client Features** (already implemented):
- ✅ Auto-send cookies (`credentials: 'include'`)
- ✅ Auto-redirect on 401 (unauthorized)
- ✅ Accept-Language header from cookie
- ✅ Proper error handling with `HttpError`
- ✅ Methods: `get()`, `post()`, `patch()`, `delete()`
- ✅ **Auto-unwrap backend envelopes**: `{success: true, data: ...}` → returns `data` directly

**⚠️ Configuration Required**:
Update `BASE_URL` in `/src/shared/lib/http.ts`:
```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
```

**Endpoints.json** (updated with all backend routes):
```json
{
  "merchants": {
    "base": "/api/v1/merchants",
    "byId": "/api/v1/merchants/:id",
    "lite": "/api/v1/merchants/lite"
  },
  "places": {
    "base": "/api/v1/places",
    "byId": "/api/v1/places/:id",
    "lite": "/api/v1/places/lite",
    "first": "/api/v1/places/first"
  },
  // ... all other endpoints
}
```

**Usage**:
```typescript
import { http } from "@/shared/lib/http";
import endpoints from "@/shared/api/endpoints.json";

// GET request
const places = await http.get(endpoints.places.base);

// POST request
const newPlace = await http.post(endpoints.places.base, data);

// PATCH request
const updated = await http.patch(
  endpoints.places.byId.replace(':id', id),
  data
);

// DELETE request
await http.delete(endpoints.places.byId.replace(':id', id));
```

---

## 📦 Features to Migrate (8 Total)

### ✅ Priority 1 - Core CRUD Features

| Feature | CRUD Hook | Server Folder | API Endpoints |
|---------|-----------|---------------|---------------|
| **places** | `usePlaceCrud.ts` | ✅ Has server | `/api/v1/places` |
| **campaigns** | `useCampaignCrud.ts` | ✅ Has server | `/api/v1/campaigns` |
| **merchants** | `useMerchantCrud.ts` | ✅ Has server | `/api/v1/merchants` |
| **landings** | `useLandingCrud.ts` | ✅ Has server | `/api/v1/landings` |
| **lotteries** | `useLotteryCrud.ts` | ✅ Has server | `/api/v1/lotteries` |

### ✅ Priority 2 - Supporting Features

| Feature | CRUD Hook | Server Folder | API Endpoints |
|---------|-----------|---------------|---------------|
| **shortlinks** | `useShortlinkCrud.ts` | ✅ Has server | `/api/v1/shortlinks` |
| **themes** | `useThemeCrud.ts` | ✅ Has server | `/api/v1/themes` |
| **google-places** | `useGooglePlacesCrud.ts` | ✅ Has server | `/api/v1/google-places` |

### ⚠️ Priority 3 - Special Cases

| Feature | Notes |
|---------|-------|
| **merchant-settings** | Has server folder - check if it's just settings |
| **onboarding** | Already migrated! (`useCompleteOnboarding`) |

---

## 🔄 Migration Steps (Per Feature)

### Step 0: Check Type Definitions (SINGLE SOURCE OF TRUTH)

**CRITICAL RULE**: Always use types from `/src/types/domain.ts` (single source of truth)

**Before migrating**:
1. Check if entity type exists in `/src/types/domain.ts`
2. Compare with old DTO from deleted `mappers.ts` (via git history)
3. **If they match** → Use `domain.ts` type
4. **If they DON'T match** → Ask before proceeding

**Example**:
```bash
# Check old DTO structure
git show HEAD:src/features/places/server/mappers.ts

# Compare with domain.ts
cat src/types/domain.ts | grep -A 15 "export interface Place"
```

**✅ CORRECT - Use domain.ts**:
```typescript
import type { Place } from "@/types/domain";

const bridge = createCrudBridge<Place, string, LiteListe>({
  // ...
});
```

**❌ WRONG - Local type definition**:
```typescript
// DON'T define locally if it exists in domain.ts
export type PlaceListItem = {
  id: string;
  // ...
};
```

---

### Step 1: Update Hook File (`use<Entity>Crud.ts`)

**Example**: `/src/features/places/hooks/usePlaceCrud.ts`

**Before** (uses server actions):
```typescript
import { createPlaceAction, updatePlaceAction, deletePlaceAction } from "../server/actions";

const bridge = createCrudBridge({
  keyBase: ["places"],
  list, get, liteList,
  actions: {                          // ❌ Nested
    create: createPlaceAction,
    update: updatePlaceAction,
    remove: deletePlaceAction,
  },
});

export const useCreatePlace = bridge.useCreateAction!;  // ❌ Old name
export const useUpdatePlace = bridge.useUpdateAction!;  // ❌ Old name
export const useDeletePlace = bridge.useRemoveAction!;  // ❌ Old name
```

**After** (uses API calls):
```typescript
import { http } from "@/shared/lib/http";
import endpoints from "@/shared/api/endpoints.json";
import type { Place } from "@/types/domain"; // ✅ Single source of truth

const bridge = createCrudBridge<Place, string, LiteListe>({
  keyBase: ["places"],
  list,
  get,
  liteList,
  // ✅ Flattened at root level (consistent with get/liteList)
  create: (input: any) => http.post(endpoints.places.base, input),
  update: ({ id, ...input }: any) => http.patch(endpoints.places.byId.replace(':id', id), input),
  remove: ({ id }: { id: string }) => http.delete(endpoints.places.byId.replace(':id', id)),
  getIdFromInput: (input) => (input as { id?: string } | undefined)?.id,
});

export const usePlacesList = bridge.useList!;
export const usePlaceItem = bridge.useItem!;
export const usePlacesLite = bridge.useLite!;
export const useCreatePlace = bridge.useCreateMutation!;  // ✅ New name
export const useUpdatePlace = bridge.useUpdateMutation!;  // ✅ New name
export const useDeletePlace = bridge.useRemoveMutation!;  // ✅ New name
```

---

### Step 2: Delete Server Folder

```bash
rm -rf src/features/places/server
```

**What gets deleted**:
- ❌ Server actions (`actions.ts`)
- ❌ Use cases (`application/usecases/`)
- ❌ Repositories (`application/interfaces/`, `infrastructure/prisma/`)
- ❌ DTOs (`application/dto/`)
- ❌ Queries, policies, mappers, selects

**What stays**:
- ✅ Model schemas (`model/<entity>Schema.ts`)
- ✅ Client hooks (`hooks/use<Entity>Crud.ts`)
- ✅ Components (`components/`)

---

### Step 3: Update Components to Use React Query API

**IMPORTANT**: Components must use React Query API, not old action API.

**Hook API Changes**:

| Old (next-safe-action) | New (React Query) |
|------------------------|-------------------|
| `{ execute, isExecuting }` | `{ mutateAsync, isPending }` |
| `execute(data)` | `mutateAsync(data)` |
| `isExecuting` | `isPending` |

**Example - CreatePlaceDialog.tsx**:

**Before**:
```typescript
const { execute, isExecuting } = useCreatePlace({
  onSuccess: () => {
    onOpenChange(false);
  },
});

const onSubmit = (data: PlaceCreateInput) => {
  execute(data);  // ❌ Old API
};

return (
  <DialogForm
    isBusy={isExecuting}  // ❌ Old API
    submitLabel={isExecuting ? "Creating..." : "Create"}
  />
);
```

**After**:
```typescript
const { mutateAsync, isPending } = useCreatePlace({
  onSuccess: () => {
    onOpenChange(false);
  },
});

const onSubmit = (data: PlaceCreateInput) => {
  mutateAsync(data);  // ✅ New API
};

return (
  <DialogForm
    isBusy={isPending}  // ✅ New API
    submitLabel={isPending ? "Creating..." : "Create"}
  />
);
```

**Files to Update**:
- `Create<Entity>Dialog.tsx` - Change `execute` → `mutateAsync`, `isExecuting` → `isPending`
- `Edit<Entity>Sheet.tsx` - Same changes
- `Delete<Entity>Dialog.tsx` - Same changes

---

## 🛠️ Implementation Plan

### Phase 1: Core Infrastructure (Day 1)

**Tasks**:
1. ✅ Update `/src/shared/api/endpoints.json` - Add all backend API routes
2. ✅ Update `/src/hooks/createCrudBridge.ts`
   - Replace `useAction` with `useMutation`
   - Update type signatures
   - Add proper error handling
3. ✅ Migrate **places** feature as proof-of-concept
4. ✅ Test CRUD operations
5. ✅ Delete `places/server/` folder

**Files**:
- `src/shared/api/endpoints.json` (✅ already updated)
- `src/shared/lib/http.ts` (✅ already exists - no changes needed)
- `src/hooks/createCrudBridge.ts` (modify)
- `src/features/places/hooks/usePlaceCrud.ts` (modify)
- `src/features/places/server/` (delete)

---

### Phase 2: Migrate Core Features (Week 2)

**Order**:
1. ✅ **places** (already done in Phase 1)
2. ✅ **campaigns**
3. ✅ **merchants**
4. ✅ **landings**
5. ✅ **lotteries**

**For each feature**:
- Update `hooks/use<Entity>Crud.ts`
- Delete `server/` folder
- Test CRUD operations
- Verify no regressions

---

### Phase 3: Migrate Supporting Features (Week 3)

**Order**:
1. ✅ **shortlinks**
2. ✅ **themes**
3. ✅ **google-places**
4. ✅ **merchant-settings** (if applicable)

---

### Phase 4: Cleanup & Verification (Week 4)

**Tasks**:
1. ✅ Remove unused dependencies
   - `next-safe-action`
   - Server-side utilities (if unused)
2. ✅ Update documentation
3. ✅ Full regression testing
4. ✅ Performance testing
5. ✅ Security audit

---

## 🧪 Testing Checklist (Per Feature)

- [ ] **Create** - Can create new entity
- [ ] **Read List** - Can fetch paginated list
- [ ] **Read Item** - Can fetch single item by ID
- [ ] **Read Lite** - Can fetch dropdown options
- [ ] **Update** - Can update existing entity
- [ ] **Delete** - Can delete entity
- [ ] **Error Handling** - Errors display correctly
- [ ] **Loading States** - Loading indicators work
- [ ] **Cache Invalidation** - Data refreshes after mutations
- [ ] **Auth** - Session cookies sent correctly
- [ ] **Tenant Isolation** - Users only see their data

---

## 🚨 Breaking Changes

### Removed Dependencies
```json
{
  "next-safe-action": "REMOVED",
  "zsa": "REMOVED" // if used
}
```

### Removed Patterns
- ❌ Server Actions (`"use server"`)
- ❌ Use Cases (Clean Architecture)
- ❌ Repositories (Infrastructure layer)
- ❌ DTOs (Command objects)

### New Dependencies
```json
{
  "@tanstack/react-query": "^5.x" // Already installed
}
```

---

## 📊 Migration Progress

### Completed ✅
- [x] Onboarding (`useCompleteOnboarding`)
- [x] **Places** (Phase 1) - ✅ Hook migrated, types from domain.ts, EditPlaceSheet fixed
- [x] **Campaigns** (Phase 2) - ✅ Hook migrated, types from domain.ts, all components updated, server folder deleted, API routes deleted
- [x] **Lotteries** (Phase 2) - ✅ Hook migrated, types added to domain.ts (LotteryConfig, LotteryGift, LotteryCooldown), components updated, server folder deleted
- [x] **Landings** (Phase 2) - ✅ Hook migrated, types added to domain.ts (Landing, LandingContent, LandingStatus), components updated (CreateLandingDialog, DeleteLandingDialog), server folder deleted

### In Progress 🔄
- [ ] None currently

### Pending ⏳
- [ ] Merchants
- [ ] Shortlinks
- [ ] Themes
- [ ] Google Places
- [ ] Merchant Settings

---

## 🎓 Lessons Learned (Places Migration)

### Issue 1: Backend Response Wrapping
**Problem**: Backend returns `{success: true, data: {...}}` but frontend expected unwrapped data.

**Solution**: Updated HTTP client to auto-unwrap (lines 76-83 in `http.ts`):
```typescript
const json = await response.json();

// Unwrap backend response envelope
if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
  return json.data as T;
}

return json;
```

**Impact**: All endpoints now work correctly without manual unwrapping.

---

### Issue 2: React Hook Form Empty Forms
**Problem**: `EditPlaceSheet` form was empty even though data loaded.

**Root Cause**: Using old pattern (`defaultValues` + `useEffect` + `reset()`)

**Solution**: Use modern React Hook Form v7+ `values` prop:
```typescript
const form = useForm<PlaceUpdateInput>({
  resolver: zodResolver(placeUpdateSchema),
  mode: "onChange",
  values: place ? {              // ✅ Auto-syncs when place changes
    localName: place.localName ?? "",
    address: place.address ?? "",
    merchantId: merchantId ?? place.merchantId ?? "",
  } : undefined,
  defaultValues: {               // Fallback
    localName: "",
    address: "",
    merchantId: merchantId ?? "",
  },
});
```

**Impact**: Forms populate automatically when data arrives, no manual `useEffect` needed.

---

### Issue 3: Unnecessary API Calls
**Problem**: Queries fetching even when dialogs/sheets closed.

**Solution**: Conditional fetching:
```typescript
// ❌ BAD - Always fetches
const { data } = usePlaceItem(id);

// ✅ GOOD - Only fetches when open
const { data } = usePlaceItem(open && id ? id : undefined);
```

**Impact**: Reduced unnecessary API calls, better performance.

---

### Issue 4: Type Duplication
**Problem**: Defining types locally in hooks instead of using single source of truth.

**Solution**: Always import from `/src/types/domain.ts`:
```typescript
// ❌ BAD - Local duplication
export type PlaceListItem = { id: string; ... };

// ✅ GOOD - Import from domain.ts
import type { Place } from "@/types/domain";
```

**Impact**: Single source of truth, easier to maintain.

---

## 📐 Type Management

### Single Source of Truth: `/src/types/domain.ts`

**Rule**: All domain entity types live in `/src/types/domain.ts`

**Current entities defined**:
- ✅ `Merchant` - Merchant/tenant
- ✅ `Place` - Physical locations
- ✅ `Campaign` - Marketing campaigns
- ✅ `Shortlink` - Short URLs for NFC/QR
- ✅ `Theme` - UI themes
- ✅ `EventRow` - Analytics events
- ✅ `CampaignStatsDaily` - Daily stats

**When migrating a feature**:
1. Check if type exists in `domain.ts`
2. Compare with old DTO (check git history of deleted `mappers.ts`)
3. If they match → Import from `domain.ts`
4. If they don't match → **Ask before proceeding** (may need to update `domain.ts` or backend)

**Maintaining domain.ts**:
- ✅ Keep in sync with backend API responses
- ✅ Use simple types (no Prisma, no Zod)
- ✅ Export as interfaces or types
- ✅ Use `ISODate = string` for dates (not Date objects)

---

## 🔒 Security Considerations

1. **CORS Configuration**
   - Ensure backend API has CORS enabled
   - Whitelist frontend URL: `http://localhost:3000`, production domain

2. **Cookie Handling**
   - `credentials: 'include'` must be set on all fetch calls
   - Backend must set `Access-Control-Allow-Credentials: true`

3. **Error Messages**
   - Don't expose internal errors to client
   - Backend should return user-friendly messages

4. **Rate Limiting**
   - Implement rate limiting on backend API
   - Prevent abuse of public endpoints

---

## 📝 Notes

### Why Remove Clean Architecture?

**Before**: Clean Architecture on frontend (overkill)
- Use Cases, Repositories, DTOs
- Complex folder structure
- Maintained 2 data layers (Next.js + External API)

**After**: Simple client-server architecture
- Frontend = UI + API calls
- Backend = Business logic + Database
- Single source of truth (external API)

### Benefits

1. ✅ **Simpler codebase** - Less code to maintain
2. ✅ **Faster development** - Direct API calls
3. ✅ **Better performance** - No intermediate layers
4. ✅ **Clearer responsibility** - Frontend = UI, Backend = Logic
5. ✅ **Easier debugging** - See exact API calls in Network tab

### Risks

1. ⚠️ **No server-side validation** - Must rely on backend
2. ⚠️ **API exposed to browser** - Already the case with `NEXT_PUBLIC_API_URL`
3. ⚠️ **CORS complexity** - Must configure backend correctly

---

## 🎯 Success Criteria

- [ ] All 8+ features migrated
- [ ] All server folders deleted
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No runtime errors
- [ ] Performance maintained or improved
- [ ] Security audit passed
- [ ] Documentation updated

---

## 📚 Resources

- **React Query Docs**: https://tanstack.com/query/latest
- **Fetch API**: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- **CORS Guide**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

---

---

## 📝 Key Changes from Original Plan

### ✅ Using Existing Infrastructure

**Original Plan**: Create new `api-client.ts`
**Updated Plan**: Use existing `/src/shared/lib/http.ts` + `/src/shared/api/endpoints.json`

**Benefits**:
- ✅ No duplicate code
- ✅ HTTP client already battle-tested
- ✅ Consistent error handling already implemented
- ✅ Auto-redirect on 401 already working
- ✅ Accept-Language header already configured

### ✅ Centralized Endpoint Management

**All API URLs** now defined in `/src/shared/api/endpoints.json`:
- Merchants: `/api/v1/merchants`, `/api/v1/merchants/:id`, `/api/v1/merchants/lite`
- Places: `/api/v1/places`, `/api/v1/places/:id`, `/api/v1/places/lite`, `/api/v1/places/first`
- Campaigns: `/api/v1/campaigns`, `/api/v1/campaigns/:id`, `/api/v1/campaigns/lite`
- Landings: `/api/v1/landings`, `/api/v1/landings/:id`, `/api/v1/landings/lite`
- Lotteries: `/api/v1/lottery/configs`, `/api/v1/lottery/configs/:id`, `/api/v1/lottery/configs/lite`
- Themes: `/api/v1/themes`, `/api/v1/themes/:id`
- Shortlinks: `/api/v1/shortlinks`, `/api/v1/shortlinks/:id`
- Onboarding: `/api/v1/onboarding/complete`
- Auth: `/api/v1/auth/me`, `/api/v1/auth/session`

**Usage**:
```typescript
import { http } from "@/shared/lib/http";
import endpoints from "@/shared/api/endpoints.json";

// Dynamic route params
const url = endpoints.places.byId.replace(':id', placeId);
const place = await http.get(url);
```

### 🔧 Next Steps

**Phase 1 starts with**:
1. Update `BASE_URL` in `http.ts`
2. Update `createCrudBridge()` to use `useMutation`
3. Migrate `places` feature
4. Delete `places/server/` folder

**Then repeat** for 7 remaining features.

---

**Last Updated**: 2025-12-31
**Status**: ✅ Planning Complete - Ready for Phase 1 Implementation
