"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash2, Pencil } from "lucide-react";

import type { iconAction } from "@/shared/ui/IconActionGroup";
import { iconActionGroup as IconActionGroup } from "@/shared/ui/IconActionGroup";
import { lotteryCooldownOptions } from "@/features/lotteries/model/lotterySchema";
import type { LotteryConfigListDTO } from "@/features/lotteries/server/mappers";

const cooldownLabelMap = lotteryCooldownOptions.reduce<Record<string, string>>((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

type LotteryTranslations = ReturnType<typeof import("next-intl").useTranslations>;

type LotteryColumnsOptions = {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  t: LotteryTranslations;
};

export function lotteryColumns(opts: LotteryColumnsOptions): ColumnDef<LotteryConfigListDTO>[] {
  const { t } = opts;

  return [
    {
      accessorKey: "name",
      header: t("columns.name"),
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
      header: t("columns.merchant"),
      cell: ({ getValue }) => getValue() ?? "—",
    },
    {
      accessorKey: "enabled",
      header: t("columns.enabled"),
      cell: ({ row }) => (row.original.enabled ? t("columns.yes") : t("columns.no")),
    },
    {
      accessorKey: "cooldown",
      header: t("columns.cooldown"),
      cell: ({ getValue }) => cooldownLabelMap[getValue() as string] ?? getValue(),
    },
    {
      accessorKey: "createdAt",
      header: t("columns.createdAt"),
      enableSorting: true,
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: "actions",
      header: () => <div className="text-right">{t("columns.actions")}</div>,
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
                  ariaLabel: t("actions.edit"),
                },
                opts.onDelete && {
                  onClick: () => opts.onDelete(record.id),
                  icon: <Trash2 className="h-4 w-4" />,
                  ariaLabel: t("actions.delete"),
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
