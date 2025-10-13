"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Merchant } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { iconActionGroup as IconActionGroup, iconAction } from "@/shared/ui/IconActionGroup";

function planBadgeVariant(plan: Merchant["plan"]) {
  switch (plan) {
    case "enterprise":
      return "default" as const;
    case "pro":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

function statusBadgeVariant(status: Merchant["status"]) {
  return status === "active" ? ("default" as const) : ("destructive" as const);
}

export function MerchantColumns(opts: {
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onView?: (id: string) => void;
}): ColumnDef<Merchant>[] {
  const router = useRouter();

  const goToDetails = (id: string) => {
    if (opts.onView) return opts.onView(id);
    router.push(`/admin/merchants/${id}`);
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
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email || "—",
    },
    {
      accessorKey: "plan",
      header: "Plan",
      enableColumnFilter: true,
      cell: ({ row }) => <Badge variant={planBadgeVariant(row.original.plan)}>{row.original.plan}</Badge>,
    },
    {
      accessorKey: "status",
      header: "Status",
      enableColumnFilter: true,
      cell: ({ row }) => <Badge variant={statusBadgeVariant(row.original.status)}>{row.original.status}</Badge>,
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
        const m = row.original;
        return (
          <div className="flex justify-end">
            <IconActionGroup
              actions={[
                goToDetails && {
                  onClick: () => goToDetails(m.id),
                  icon: <Eye className="h-4 w-4" />, 
                  ariaLabel: "View",
                },
                opts.onEdit && {
                  onClick: () => opts.onEdit(m.id),
                  icon: <Pencil className="h-4 w-4" />, 
                  ariaLabel: "Edit",
                },
                opts.onDelete && {
                  onClick: () => opts.onDelete(m.id, m.name),
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