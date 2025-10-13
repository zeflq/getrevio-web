// src/features/campaigns/components/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  iconActionGroup as IconActionGroup,
  iconAction,
} from "@/shared/ui/IconActionGroup";
import type { CampaignListItem } from "../server/queries";

const statusBadgeVariant = (
  status: CampaignListItem["status"]
): "default" | "secondary" | "outline" => {
  switch (status) {
    case "active":
      return "default";
    case "archived":
      return "secondary";
    default:
      return "outline";
  }
};

export function CampaignColumns(opts: {
  onView?: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}): ColumnDef<CampaignListItem>[] {
  const router = useRouter();

  const goToDetails = (id: string) => {
    if (opts.onView) return opts.onView(id);
    router.push(`/admin/campaigns/${id}`);
  };

  return [
    {
      accessorKey: "name",
      header: "Name",
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => (
        <button
          className="text-left font-medium hover:underline"
          onClick={() => goToDetails(row.original.id)}
        >
          {row.original.name}
        </button>
      ),
    },
    {
      accessorKey: "merchantId",
      header: "Merchant",
      enableColumnFilter: true,
      cell: ({ row }) =>
        row.original.merchantName ?? row.original.merchantId ?? "—",
    },
    {
      accessorKey: "placeId",
      header: "Place",
      enableColumnFilter: true,
      cell: ({ row }) =>
        row.original.placeName ?? row.original.placeId ?? "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => (
        <Badge variant={statusBadgeVariant(row.original.status)}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      enableSorting: true,
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      meta: { forTable: true },
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const campaign = row.original;
        return (
          <div className="flex justify-end">
            <IconActionGroup
              actions={
                [
                  {
                    onClick: () => goToDetails(campaign.id),
                    icon: <Eye className="h-4 w-4" />,
                    ariaLabel: "View",
                  },
                  {
                    onClick: () => opts.onEdit(campaign.id),
                    icon: <Pencil className="h-4 w-4" />,
                    ariaLabel: "Edit",
                  },
                  {
                    onClick: () =>
                      opts.onDelete(campaign.id, campaign.name),
                    icon: <Trash2 className="h-4 w-4" />,
                    ariaLabel: "Delete",
                    variant: "linkDestructive",
                  },
                ].filter(Boolean) as iconAction[]
              }
              condensed
            />
          </div>
        );
      },
    },
  ];
}
