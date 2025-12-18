# 8. Naming Conventions

**Priority**: STRICT

---

## 8.1 File Naming

<file_naming>
| File Type | Convention | Example |
|-----------|-----------|---------|
| Schema | `<entity>Schema.ts` | `merchantSchema.ts`, `placeSchema.ts` |
| Use Case | `<verb><Entity>UseCase.ts` | `createMerchantUseCase.ts` |
| Repository Interface | `<entity>Repository.ts` | `merchantRepository.ts` |
| Repository Impl | `prisma<Entity>Repository.ts` | `prismaMerchantRepository.ts` |
| Query Repository | `<entity>QueryRepository.ts` | `merchantQueryRepository.ts` |
| DTO | `<action><Entity>Command.ts` | `createMerchantCommand.ts` |
| Selects | `<entity>Selects.ts` | `merchantSelects.ts` |
| Actions | `actions.ts` (or per-action) | `actions.ts`, `createMerchant.ts` |
| Queries | `queries.ts` | `queries.ts` |
| Policy | `policy.ts` | `policy.ts` |
| Where Builder | `buildWhere.ts` | `buildWhere.ts` |
| Mappers | `mappers.ts` | `mappers.ts` |
| Hooks (CRUD) | `use<Entity>Crud.ts` | `useMerchantCrud.ts` |
| Component | `<Entity><Action>.tsx` | `CreateMerchantDialog.tsx` |
| Table Columns | `columns.tsx` | `columns.tsx` |
| Form Fields | `<Entity>FormFields.tsx` | `MerchantFormFields.tsx` |
| Public API | `index.ts` | `index.ts` |
</file_naming>

---

## 8.2 Function Naming

<function_naming>
| Function Type | Convention | Example |
|--------------|-----------|---------|
| Server Actions | `<verb><Entity>Action` | `createMerchantAction`, `updateMerchantAction` |
| Server Queries | `<verb><Entity>Server` or `<verb><Entity>sServer` | `listMerchantsServer`, `getMerchantServer` |
| Client Hooks (list) | `use<Entity>sList` | `useMerchantsList`, `usePlacesList` |
| Client Hooks (item) | `use<Entity>Item` | `useMerchantItem`, `usePlaceItem` |
| Client Hooks (lite) | `use<Entity>sLite` | `useMerchantsLite`, `usePlacesLite` |
| Create Mutation | `use<Entity>CreateAction` | `useMerchantCreateAction` |
| Update Mutation | `use<Entity>UpdateAction` | `useMerchantUpdateAction` |
| Delete Mutation | `use<Entity>DeleteAction` | `useMerchantDeleteAction` |
| Use Cases | `<Verb><Entity>UseCase` (class) | `CreateMerchantUseCase` |
| Mappers | `map<Entity>Row` | `mapMerchantRow`, `mapPlaceRow` |
| Where Builders | `build<Entity>Where` | `buildMerchantWhere`, `buildPlaceWhere` |
| Policies | `<entity>QueryPolicy` | `merchantQueryPolicy`, `placeQueryPolicy` |
| Selects | `<entity><View>Select` | `merchantListSelect`, `placeDetailSelect` |
</function_naming>

---

## 8.3 Type Naming

<type_naming>
| Type | Convention | Example |
|------|-----------|---------|
| Zod Input (create) | `<Entity>CreateInput` | `MerchantCreateInput`, `PlaceCreateInput` |
| Zod Input (update) | `<Entity>UpdateInput` | `MerchantUpdateInput`, `PlaceUpdateInput` |
| Filters | `<Entity>Filters` | `MerchantFilters`, `PlaceFilters` |
| DTO (list) | `<Entity>ListDTO` | `MerchantListDTO`, `PlaceListDTO` |
| DTO (detail) | `<Entity>DetailDTO` | `MerchantDetailDTO`, `PlaceDetailDTO` |
| Command | `<Action><Entity>Command` | `CreateMerchantCommand`, `UpdatePlaceCommand` |
| Prisma Row (list) | `<Entity>ListRow` | `MerchantListRow`, `PlaceListRow` |
| Prisma Row (detail) | `<Entity>DetailRow` | `MerchantDetailRow`, `PlaceDetailRow` |
| Repository Interface | `<Entity>Repository` | `MerchantRepository`, `PlaceRepository` |
| Query Repository | `<Entity>QueryRepository` | `MerchantQueryRepository` |
</type_naming>

---

## 8.4 Component Naming

<component_naming>
| Component Type | Convention | Example |
|---------------|-----------|---------|
| Create Dialog | `Create<Entity>Dialog` | `CreateMerchantDialog`, `CreatePlaceDialog` |
| Edit Sheet | `Edit<Entity>Sheet` | `EditMerchantSheet`, `EditPlaceSheet` |
| Delete Dialog | `Delete<Entity>Dialog` | `DeleteMerchantDialog`, `DeletePlaceDialog` |
| List Component | `<Entity>List` or `<Entity>sTable` | `MerchantsList`, `PlacesTable` |
| Header | `<Entity>Header` | `MerchantHeader`, `PlaceHeader` |
| Details Card | `<Entity>DetailsCard` | `MerchantDetailsCard`, `PlaceDetailsCard` |
| Form Fields | `<Entity>FormFields` | `MerchantFormFields`, `PlaceFormFields` |
| Select/Dropdown | `<Entity>Select` | `MerchantSelect`, `PlaceSelect` |
| Status Badge | `<Entity>Status` | `MerchantStatus`, `PlaceStatus` |
</component_naming>

---

## 8.5 Variable Naming

<variable_naming>
| Variable Type | Convention | Example |
|--------------|-----------|---------|
| Single item | `<entity>` | `merchant`, `place`, `campaign` |
| Multiple items | `<entity>s` | `merchants`, `places`, `campaigns` |
| ID | `<entity>Id` | `merchantId`, `placeId`, `campaignId` |
| Count | `<entity>Count` or `total<Entity>s` | `merchantCount`, `totalMerchants` |
| Loading state | `isLoading<Entity>` | `isLoadingMerchant`, `isLoadingPlaces` |
| Error state | `<entity>Error` | `merchantError`, `placesError` |
| Form instance | `form` or `<entity>Form` | `form`, `merchantForm` |
| Mutation | `mutate<Action><Entity>` | `mutateCreatePlace`, `mutateUpdateMerchant` |
| Boolean flags | `is<State>`, `has<State>`, `can<Action>` | `isActive`, `hasPermission`, `canDelete` |
</variable_naming>

---

## 8.6 Constant Naming

<constant_naming>
| Constant Type | Convention | Example |
|--------------|-----------|---------|
| Config | `UPPER_SNAKE_CASE` | `MAX_PAGE_SIZE`, `DEFAULT_LOCALE` |
| Enum-like | `UPPER_SNAKE_CASE` | `USER_ROLES`, `MERCHANT_PLANS` |
| Cache Tags | `lowercase-kebab` | `"merchants"`, `"places"`, `"campaigns"` |
| Query Keys | `lowercase` array | `["merchants", "list"]`, `["places", "item", id]` |
</constant_naming>

---

## 8.7 Enum Naming

<enum_naming>
| Enum Type | Convention | Example |
|-----------|-----------|---------|
| Status | `<Entity>Status` | `MerchantStatus`, `CampaignStatus` |
| Type | `<Entity>Type` | `GameType`, `RewardType` |
| Role | `UserRole` | `UserRole` |
| Plan | `<Entity>Plan` | `MerchantPlan` |

```typescript
// Prefer const objects over enums
export const MerchantStatus = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  PENDING: "pending",
} as const;

export type MerchantStatus = typeof MerchantStatus[keyof typeof MerchantStatus];

// Or use Zod enums
export const merchantStatusEnum = z.enum(["active", "suspended", "pending"]);
export type MerchantStatus = z.infer<typeof merchantStatusEnum>;
```
</enum_naming>

---

## 8.8 Folder Naming

<folder_naming>
| Folder | Convention | Example |
|--------|-----------|---------|
| Feature | `lowercase` | `merchants/`, `places/`, `campaigns/` |
| Layer | `lowercase` | `model/`, `server/`, `hooks/`, `components/` |
| Sublayer | `lowercase` | `application/`, `infrastructure/`, `interface/` |
| Shared | `lowercase` | `dto/`, `interfaces/`, `usecases/`, `prisma/` |
</folder_naming>

---

## 8.9 Naming Patterns by Layer

### Model Layer

```typescript
// Schemas
export const merchantCreateSchema = z.object({ /* ... */ });
export const merchantUpdateSchema = merchantCreateSchema.partial();
export const merchantFiltersSchema = z.object({ /* ... */ });

// Types
export type MerchantCreateInput = z.infer<typeof merchantCreateSchema>;
export type MerchantUpdateInput = z.infer<typeof merchantUpdateSchema>;
export type MerchantFilters = z.output<typeof merchantFiltersSchema>;
export type MerchantListDTO = { /* ... */ };
```

### Application Layer

```typescript
// Commands
export interface CreateMerchantCommand { /* ... */ }
export interface UpdateMerchantCommand { /* ... */ }

// Repository Interfaces
export interface MerchantRepository { /* ... */ }
export interface MerchantQueryRepository { /* ... */ }

// Use Cases
export class CreateMerchantUseCase { /* ... */ }
export class UpdateMerchantUseCase { /* ... */ }
export class DeleteMerchantUseCase { /* ... */ }
```

### Infrastructure Layer

```typescript
// Selects
export const merchantListSelect = { /* ... */ };
export const merchantDetailSelect = { /* ... */ };

// Prisma Types
export type MerchantListRow = Prisma.MerchantGetPayload<{ select: typeof merchantListSelect }>;

// Repository Implementations
export class PrismaMerchantRepository implements MerchantRepository { /* ... */ }
export class PrismaMerchantQueryRepository implements MerchantQueryRepository { /* ... */ }
```

### Interface Layer

```typescript
// Server Actions
export const createMerchantAction = withSuperAdmin.inputSchema(/* ... */).action(/* ... */);
export const updateMerchantAction = withTenantGuard("merchantId").inputSchema(/* ... */).action(/* ... */);
export const deleteMerchantAction = withTenantGuard("merchantId").inputSchema(/* ... */).action(/* ... */);

// Server Queries
export const listMerchantsServer = cache(/* ... */, ["merchants"]);
export const getMerchantServer = cache(/* ... */, ["merchants"]);
export const listMerchantsLiteServer = cache(/* ... */, ["merchants"]);

// Policies
export const merchantQueryPolicy = createQueryPolicy({ /* ... */ });
export const merchantSortPolicy = createSortPolicy({ /* ... */ });

// Where Builders
export function buildMerchantWhere(filters: MerchantFilters, tenantId?: string) { /* ... */ }

// Mappers
export function mapMerchantRow(row: MerchantListRow): MerchantListDTO { /* ... */ }
```

### Client Layer

```typescript
// CRUD Hooks
export const useMerchantsList = useList;
export const useMerchantItem = useItem;
export const useMerchantsLite = useLite;
export const useMerchantCreateAction = useCreateAction;
export const useMerchantUpdateAction = useUpdateAction;
export const useMerchantDeleteAction = useDeleteAction;

// Components
export function CreateMerchantDialog() { /* ... */ }
export function EditMerchantSheet() { /* ... */ }
export function DeleteMerchantDialog() { /* ... */ }
export function MerchantFormFields() { /* ... */ }
export function MerchantHeader() { /* ... */ }
export const MerchantColumns = [ /* ... */ ];
```

---

## 8.10 Pluralization Rules

<pluralization>
**Singular** for:
- File names (except `queries.ts`, `actions.ts`)
- Type names
- Component names (except lists)
- Single items

**Plural** for:
- Multiple items
- List operations
- Collection names

**Examples**:
```typescript
// ✅ CORRECT
export const merchantListSelect = { /* ... */ };
export const useMerchantsList = useList;
export function listMerchantsServer() { /* ... */ }
export const MerchantsList = ({ merchants }) => { /* ... */ };

// ❌ WRONG
export const merchantsListSelect = { /* ... */ };  // Don't pluralize entity in compound names
export const useMerchantList = useList;  // Plural for list operations
export function listMerchantServer() { /* ... */ };  // Plural for list operations
```
</pluralization>

---

## 8.11 Abbreviations

<abbreviations>
**Avoid abbreviations** except for well-known ones:

**✅ ALLOWED**:
- `DTO` - Data Transfer Object
- `ID` - Identifier
- `API` - Application Programming Interface
- `URL` - Uniform Resource Locator
- `HTTP` - HyperText Transfer Protocol

**❌ AVOID**:
- `usr` → Use `user`
- `msg` → Use `message`
- `btn` → Use `button`
- `ctx` → Use `context` (except in action handlers where it's standard)
- `repo` → Use `repository`
</abbreviations>

---

## 8.12 Consistency Checklist

<checklist>
When creating a new feature, ensure:

- ☐ Schema file: `<entity>Schema.ts`
- ☐ Types match: `<Entity>CreateInput`, `<Entity>UpdateInput`, `<Entity>Filters`
- ☐ Use cases: `Create<Entity>UseCase`, `Update<Entity>UseCase`, etc.
- ☐ Repositories: `<Entity>Repository`, `<Entity>QueryRepository`
- ☐ Implementations: `Prisma<Entity>Repository`, `Prisma<Entity>QueryRepository`
- ☐ Actions: `create<Entity>Action`, `update<Entity>Action`, `delete<Entity>Action`
- ☐ Queries: `list<Entity>sServer`, `get<Entity>Server`, `list<Entity>sLiteServer`
- ☐ Hooks: `use<Entity>sList`, `use<Entity>Item`, `use<Entity>CreateAction`, etc.
- ☐ Components: `Create<Entity>Dialog`, `Edit<Entity>Sheet`, `Delete<Entity>Dialog`
- ☐ All names follow conventions from tables above
</checklist>

---

## Quick Reference

**Common Patterns**:
```typescript
// Schemas
<entity>CreateSchema, <entity>UpdateSchema, <entity>FiltersSchema

// Types
<Entity>CreateInput, <Entity>UpdateInput, <Entity>Filters, <Entity>ListDTO

// Use Cases
Create<Entity>UseCase, Update<Entity>UseCase, Delete<Entity>UseCase

// Repositories
<Entity>Repository, <Entity>QueryRepository, Prisma<Entity>Repository

// Actions
create<Entity>Action, update<Entity>Action, delete<Entity>Action

// Queries
list<Entity>sServer, get<Entity>Server, list<Entity>sLiteServer

// Hooks
use<Entity>sList, use<Entity>Item, use<Entity>CreateAction

// Components
Create<Entity>Dialog, Edit<Entity>Sheet, Delete<Entity>Dialog
```

---

See also:
- **02-feature-structure.md** - File organization
- **07-client-patterns.md** - Component patterns
- **09-anti-patterns.md** - What to avoid
