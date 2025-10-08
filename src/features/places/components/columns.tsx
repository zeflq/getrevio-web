"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Place } from "@/types/domain";
import { Pencil, Trash2 } from "lucide-react";
import { iconActionGroup as IconActionGroup, iconAction } from "@/shared/ui/IconActionGroup";

export function placeColumns(opts: {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}): ColumnDef<Place>[] {
  return [
    {
      accessorKey: "localName",
      header: "Place",
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => (
        <button
          className="text-left font-medium hover:underline"
          onClick={() => opts.onEdit(row.original.id)}
        >
          {row.original.localName}
        </button>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      enableSorting: true,
      cell: ({ row }) => row.original.slug || "—",
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => row.original.address || "—",
    },
    {
      accessorKey: "googlePlaceId",
      header: "Google Place ID",
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => row.original.googlePlaceId || "—",
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      enableSorting: true,
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      meta: { forTable: true },
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex justify-end">
            <IconActionGroup
              actions={[
                opts.onEdit && {
                  onClick: () => opts.onEdit(p.id),
                  icon: <Pencil className="h-4 w-4" />, 
                  ariaLabel: "Edit",
                },
                opts.onDelete && {
                  onClick: () => opts.onDelete(p.id),
                  icon: <Trash2 className="h-4 w-4" />, 
                  ariaLabel: "Delete",
                  variant: "linkDestructive",
                },
              ].filter(Boolean) as iconAction[]}
              condensed
            />
          </div>
        );
      },
    },
  ];
}