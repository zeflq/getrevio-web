# 7. Client-Side Patterns

---

## 7.1 CRUD Bridge

**Location**: `features/<entity>/hooks/use<Entity>Crud.ts`

<rule priority="MANDATORY">
**Purpose**: Single file that exports ALL client hooks for CRUD operations.

**Pattern**: Use `createCrudBridge` helper from `@/hooks/createCrudBridge`

```typescript
// features/places/hooks/usePlaceCrud.ts
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
import type { PlaceFilters } from "../model/placeSchema";

const {
  useList,
  useItem,
  useLite,
  useCreateAction,
  useUpdateAction,
  useDeleteAction,
} = createCrudBridge<PlaceFilters>({
  queryKey: "places",
  listServer: listPlacesServer,
  itemServer: getPlaceServer,
  liteServer: listPlacesLiteServer,
  createAction: createPlaceAction,
  updateAction: updatePlaceAction,
  deleteAction: deletePlaceAction,
});

// Export with entity-specific names
export const usePlacesList = useList;
export const usePlaceItem = useItem;
export const usePlacesLite = useLite;
export const usePlaceCreateAction = useCreateAction;
export const usePlaceUpdateAction = useUpdateAction;
export const usePlaceDeleteAction = useDeleteAction;
```
</rule>

### CRUD Bridge Hooks

```typescript
// 1. useList - Paginated list with filters
const { data, isLoading, error } = usePlacesList({
  q: "Paris",
  page: 1,
  pageSize: 10,
  sort: "localName",
  order: "asc",
});

// data.items: PlaceListDTO[]
// data.pagination: { total, page, pageSize, totalPages }

// 2. useItem - Single item by ID
const { data: place, isLoading } = usePlaceItem("place_123");

// 3. useLite - Dropdown options
const { data: options } = usePlacesLite({ q: "Paris" });
// options: Array<{ label: string, value: string }>

// 4. useCreateAction - Create mutation
const { mutateAsync: create, isPending } = usePlaceCreateAction();

await create({
  localName: "Paris HQ",
  addressLine1: "123 Rue de la Paix",
  city: "Paris",
  country: "France",
  merchantId: tenantId,
});

// 5. useUpdateAction - Update mutation
const { mutateAsync: update } = usePlaceUpdateAction();

await update({
  id: "place_123",
  localName: "Paris Office",
  merchantId: tenantId,
});

// 6. useDeleteAction - Delete mutation
const { mutateAsync: remove } = usePlaceDeleteAction();

await remove({ id: "place_123", merchantId: tenantId });
```

### Automatic Cache Invalidation

<rule priority="STRICT">
**CRUD bridge automatically invalidates cache** after mutations:

- `create` → Invalidates `["places", "list"]`
- `update` → Invalidates `["places", "list"]` and `["places", "item", id]`
- `delete` → Invalidates `["places", "list"]` and `["places", "item", id]`

**No manual cache invalidation needed!**
</rule>

---

## 7.2 Form Components

### Dialog Form Pattern

```typescript
// components/CreatePlaceDialog.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PlaceFormFields } from "./PlaceFormFields";
import { usePlaceCreateAction } from "../hooks/usePlaceCrud";
import { placeCreateSchema } from "../model/placeSchema";
import type { PlaceCreateInput } from "../model/placeSchema";

export function CreatePlaceDialog({ tenantId }: { tenantId: string }) {
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending } = usePlaceCreateAction();

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
    try {
      await mutateAsync({
        ...data,
        merchantId: tenantId,
      });
      
      setOpen(false);
      form.reset();
    } catch (error) {
      // Error handled by CRUD bridge
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Place</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Place</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <PlaceFormFields form={form} />
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### Sheet Form Pattern

```typescript
// components/EditPlaceSheet.tsx
"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { usePlaceItem, usePlaceUpdateAction } from "../hooks/usePlaceCrud";

export function EditPlaceSheet({
  placeId,
  tenantId,
  open,
  onOpenChange,
}: {
  placeId: string;
  tenantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: place, isLoading } = usePlaceItem(placeId);
  const { mutateAsync, isPending } = usePlaceUpdateAction();

  const form = useForm<PlaceUpdateInput>({
    resolver: zodResolver(placeUpdateSchema),
    values: place ? {
      localName: place.localName,
      nameEn: place.nameEn ?? "",
      addressLine1: place.addressLine1,
      addressLine2: place.addressLine2 ?? "",
      city: place.city,
      postalCode: place.postalCode ?? "",
      region: place.region ?? "",
      country: place.country,
      placeCode: place.placeCode ?? "",
    } : undefined,
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await mutateAsync({
      ...data,
      id: placeId,
      merchantId: tenantId,
    });
    
    onOpenChange(false);
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Place</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4 mt-4">
            <PlaceFormFields form={form} />
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
```

### Form Fields Component

<rule priority="STRICT">
**Purpose**: Reusable form fields for create/edit forms.

```typescript
// components/PlaceFormFields.tsx
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { UseFormReturn } from "react-hook-form";
import type { PlaceCreateInput } from "../model/placeSchema";

export function PlaceFormFields({
  form,
}: {
  form: UseFormReturn<PlaceCreateInput>;
}) {
  return (
    <>
      <FormField
        control={form.control}
        name="localName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Local Name *</FormLabel>
            <FormControl>
              <Input placeholder="Enter local name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="nameEn"
        render={({ field }) => (
          <FormItem>
            <FormLabel>English Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter English name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="addressLine1"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address Line 1 *</FormLabel>
            <FormControl>
              <Input placeholder="Enter address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Additional fields */}
    </>
  );
}
```
</rule>

---

## 7.3 Table Columns

### Column Definition Pattern

<rule priority="STRICT">
**Location**: `features/<entity>/components/columns.tsx`

```typescript
// components/columns.tsx
"use client";

import { createColumnHelper } from "@tanstack/react-table";
import type { PlaceListDTO } from "../model/placeSchema";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const columnHelper = createColumnHelper<PlaceListDTO>();

export const PlaceColumns = [
  columnHelper.accessor("localName", {
    header: "Local Name",
    cell: (info) => info.getValue(),
  }),

  columnHelper.accessor("city", {
    header: "City",
    cell: (info) => info.getValue(),
  }),

  columnHelper.accessor("country", {
    header: "Country",
    cell: (info) => info.getValue(),
  }),

  columnHelper.accessor("addressLine1", {
    header: "Address",
    cell: (info) => info.getValue(),
  }),

  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(row.original.id)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(row.original.id)}
            className="text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  }),
];
```
</rule>

### Data Table Component

```typescript
// Using tanstack/react-table
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function PlacesTable({
  data,
  columns,
}: {
  data: PlaceListDTO[];
  columns: any[];
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

---

## 7.4 Delete Confirmation

```typescript
// components/DeletePlaceDialog.tsx
"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { usePlaceDeleteAction } from "../hooks/usePlaceCrud";

export function DeletePlaceDialog({
  placeId,
  placeName,
  tenantId,
  open,
  onOpenChange,
}: {
  placeId: string;
  placeName: string;
  tenantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { mutateAsync, isPending } = usePlaceDeleteAction();

  const handleDelete = async () => {
    await mutateAsync({
      id: placeId,
      merchantId: tenantId,
    });
    
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Place</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{placeName}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

---

## 7.5 Dropdown/Combobox with Lite Query

```typescript
// Using lite query for dropdown options
"use client";

import { Combobox } from "@/components/ui/combobox";
import { usePlacesLite } from "../hooks/usePlaceCrud";

export function PlaceSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [search, setSearch] = useState("");
  const { data: options = [], isLoading } = usePlacesLite({ q: search });

  return (
    <Combobox
      value={value}
      onChange={onChange}
      options={options}
      searchValue={search}
      onSearchChange={setSearch}
      placeholder="Select a place"
      isLoading={isLoading}
    />
  );
}
```

---

## 7.6 Feature Page Structure

```typescript
// app/places/page.tsx
import { PlacesHeader } from "@/features/places/components/PlacesHeader";
import { PlacesList } from "@/features/places/components/PlacesList";
import { listPlacesServer } from "@/features/places/server/queries";

export default async function PlacesPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const result = await listPlacesServer({
    q: searchParams.q,
    page: Number(searchParams.page) || 1,
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PlacesHeader />
      <PlacesList 
        initialData={result}
        searchParams={searchParams}
      />
    </div>
  );
}
```

```typescript
// components/PlacesList.tsx (client component)
"use client";

import { usePlacesList } from "../hooks/usePlaceCrud";
import { PlacesTable } from "./PlacesTable";
import { PlaceColumns } from "./columns";

export function PlacesList({
  initialData,
  searchParams,
}: {
  initialData: any;
  searchParams: any;
}) {
  // Client-side query with server-side initial data
  const { data = initialData } = usePlacesList({
    q: searchParams.q,
    page: Number(searchParams.page) || 1,
  });

  return (
    <div>
      <PlacesTable data={data.items} columns={PlaceColumns} />
      {/* Pagination */}
    </div>
  );
}
```

---

## Quick Reference

**Client Patterns**:
- ✅ CRUD bridge - Single source of hooks per feature
- ✅ Dialog forms - Create operations
- ✅ Sheet forms - Edit operations
- ✅ Alert dialogs - Delete confirmations
- ✅ Reusable form fields - Shared between create/edit
- ✅ Table columns - TanStack Table
- ✅ Lite queries - Dropdowns/combobox options

**Automatic Features**:
- ✅ Cache invalidation after mutations
- ✅ Loading states
- ✅ Error handling
- ✅ Optimistic updates (optional)

---

See also:
- **06-tech-stack.md** - React Hook Form and React Query
- **08-naming-conventions.md** - Component naming
- **02-feature-structure.md** - Feature folder structure
