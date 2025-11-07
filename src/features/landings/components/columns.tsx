"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  iconActionGroup as IconActionGroup,
  type iconAction,
} from "@/shared/ui/IconActionGroup";

import type { LandingListItem } from "../server/mappers";

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

export function landingColumns(opts: {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}): ColumnDef<LandingListItem>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      enableSorting: true,
      cell: ({ row }) => (
        <button className="text-left font-medium hover:underline" onClick={() => opts.onEdit(row.original.id)}>
          {row.original.name}
        </button>
      ),
    },
    {
      accessorKey: "merchantId",
      header: "Merchant",
      enableSorting: true,
      cell: ({ row }) => row.original.merchantId || "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      cell: ({ row }) => {
        const status = row.original.status;
        if (status === "published") return <Badge variant="default">Published</Badge>;
        if (status === "archived") return <Badge variant="secondary">Archived</Badge>;
        return <Badge variant="outline">Draft</Badge>;
      },
    },
    {
      accessorKey: "content.layout",
      header: "Layout",
      cell: ({ row }) => row.original.content?.layout ?? "—",
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      enableSorting: true,
      cell: ({ row }) => formatDate(row.original.updatedAt),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <IconActionGroup
            actions={
              [
                {
                  onClick: () => opts.onEdit(row.original.id),
                  icon: <Pencil className="h-4 w-4" />,
                  ariaLabel: "Edit",
                },
                {
                  onClick: () => opts.onDelete(row.original.id),
                  icon: <Trash2 className="h-4 w-4" />,
                  ariaLabel: "Delete",
                  variant: "linkDestructive",
                },
              ].filter(Boolean) as iconAction[]
            }
            condensed
          />
        </div>
      ),
    },
  ];
}
