// features/campaigns/components/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { iconActionGroup as IconActionGroup, iconAction } from "@/shared/ui/IconActionGroup";

type Row = {
  id: string;
  name: string;
  merchantId?: string;
  placeId?: string;
  status: "draft" | "active" | "archived";
  createdAt: string;
};

export function campaignColumns(opts: {
  onView?: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}): ColumnDef<Row>[] {
  const handleView = (id: string) =>
    opts.onView ? opts.onView(id) : (window.location.href = `/admin/campaigns/${id}`);

  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <button className="text-left font-medium hover:underline" onClick={() => handleView(row.original.id)}>
          {row.original.name}
        </button>
      ),
      enableSorting: true,
    },
    { accessorKey: "merchantId", header: "Merchant" },
    { accessorKey: "placeId", header: "Place" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        const variant = s === "active" ? "default" : s === "draft" ? "outline" : "secondary";
        return <Badge variant={variant}>{s}</Badge>;
      },
      enableSorting: true,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
      enableSorting: true,
    },

    // TABLE actions (inline)
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      meta: { forTable: true },
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex justify-end">
            <IconActionGroup
              actions={[
                handleView && {
                  onClick: () => handleView(c.id),
                  icon: <Eye className="h-4 w-4" />, 
                  ariaLabel: "View",
                },
                opts.onEdit && {
                  onClick: () => opts.onEdit(c.id),
                  icon: <Pencil className="h-4 w-4" />, 
                  ariaLabel: "Edit",
                },
                opts.onDelete && {
                  onClick: () => opts.onDelete(c.id),
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