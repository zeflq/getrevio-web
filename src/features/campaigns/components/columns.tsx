"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Campaign } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function campaignColumns(opts: {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}): ColumnDef<Campaign>[] {
  const router = useRouter();

  return [
    {
      accessorKey: "name",
      header: "Name",
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => (
        <button
          className="text-left font-medium hover:underline"
          onClick={() => router.push(`/admin/campaigns/${row.original.id}`)}
        >
          {row.original.name}
        </button>
      ),
    },
    {
      accessorKey: "merchantId",
      header: "Merchant",
      enableColumnFilter: true,
      cell: ({ row }) => row.original.merchantId, // MVP: ID; later inject name map
    },
    {
      accessorKey: "placeId",
      header: "Place",
      enableColumnFilter: true,
      cell: ({ row }) => row.original.placeId, // MVP: ID; later inject localName
    },
    {
      accessorKey: "status",
      header: "Status",
      enableColumnFilter: true,
      cell: ({ row }) => {
        const s = row.original.status;
        const variant = s === "active" ? "default" : s === "draft" ? "outline" : "secondary";
        return <Badge variant={variant}>{s}</Badge>;
      },
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
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/campaigns/${c.id}`)} title="View">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => opts.onEdit(c.id)} title="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => opts.onDelete(c.id)} title="Delete">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
