"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

import type { iconAction } from "@/shared/ui/IconActionGroup";
import { iconActionGroup as IconActionGroup } from "@/shared/ui/IconActionGroup";
import { lotteryCooldownOptions } from "@/features/lotteries/model/lotterySchema";
import type { LotteryConfigListDTO } from "@/features/lotteries/server/mappers";

const cooldownLabelMap = lotteryCooldownOptions.reduce<Record<string, string>>((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

export function lotteryColumns(opts: {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}): ColumnDef<LotteryConfigListDTO>[] {
  return [
    {
      accessorKey: "name",
      header: "Lottery",
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => (
        <button
          className="text-left font-medium hover:underline"
          onClick={() => opts.onEdit(row.original.id)}
        >
          {row.original.name}
        </button>
      ),
    },
    {
      accessorFn: (row) => row.merchantName ?? row.merchantId,
      id: "merchant",
      header: "Merchant",
      cell: ({ getValue }) => getValue() ?? "—",
    },
    {
      accessorKey: "enabled",
      header: "Enabled",
      cell: ({ row }) => (row.original.enabled ? "Yes" : "No"),
    },
    {
      accessorKey: "cooldown",
      header: "Cooldown",
      cell: ({ getValue }) => cooldownLabelMap[getValue() as string] ?? getValue(),
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
        const record = row.original;
        return (
          <div className="flex justify-end">
            <IconActionGroup
              actions={[
                opts.onEdit && {
                  onClick: () => opts.onEdit(record.id),
                  icon: <Pencil className="h-4 w-4" />,
                  ariaLabel: "Edit",
                },
                opts.onDelete && {
                  onClick: () => opts.onDelete(record.id),
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
