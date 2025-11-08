"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  iconActionGroup as IconActionGroup,
  type iconAction,
} from "@/shared/ui/IconActionGroup";

import type { LandingListItem } from "../server/mappers";

type LandingColumnLabels = {
  nameHeader: string;
  merchantHeader: string;
  statusHeader: string;
  attachedHeader: string;
  updatedHeader: string;
  actionsHeader: string;
  statusDraft: string;
  statusPublished: string;
  statusArchived: string;
  attachedCampaignPrefix: string;
  attachedPlacePrefix: string;
  emptyValue: string;
};

const DEFAULT_LABELS: LandingColumnLabels = {
  nameHeader: "Name",
  merchantHeader: "Merchant",
  statusHeader: "Status",
  attachedHeader: "Attached To",
  updatedHeader: "Updated",
  actionsHeader: "Actions",
  statusDraft: "Draft",
  statusPublished: "Published",
  statusArchived: "Archived",
  attachedCampaignPrefix: "Campaign · ",
  attachedPlacePrefix: "Place · ",
  emptyValue: "—",
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

type LandingColumnOptions = {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  showMerchantColumn?: boolean;
  labels?: Partial<LandingColumnLabels>;
};

const mergeLabels = (labels?: Partial<LandingColumnLabels>): LandingColumnLabels => ({
  ...DEFAULT_LABELS,
  ...labels,
});

export function landingColumns(opts: LandingColumnOptions): ColumnDef<LandingListItem>[] {
  const labels = mergeLabels(opts.labels);
  const columns: ColumnDef<LandingListItem>[] = [
    {
      accessorKey: "name",
      header: labels.nameHeader,
      enableSorting: true,
      cell: ({ row }) => (
        <button className="text-left font-medium hover:underline" onClick={() => opts.onEdit(row.original.id)}>
          {row.original.name}
        </button>
      ),
    },
    {
      accessorKey: "status",
      header: labels.statusHeader,
      enableSorting: true,
      cell: ({ row }) => {
        const status = row.original.status;
        if (status === "published") return <Badge variant="default">{labels.statusPublished}</Badge>;
        if (status === "archived") return <Badge variant="secondary">{labels.statusArchived}</Badge>;
        return <Badge variant="outline">{labels.statusDraft}</Badge>;
      },
    },
    {
      accessorKey: "belongsTo",
      header: labels.attachedHeader,
      cell: ({ row }) => {
        const target = row.original.belongsTo;
        if (!target) return labels.emptyValue;
        const label = target.label ?? target.id;
        return target.type === "campaign"
          ? `${labels.attachedCampaignPrefix}${label}`
          : `${labels.attachedPlacePrefix}${label}`;
      },
    },
    {
      accessorKey: "updatedAt",
      header: labels.updatedHeader,
      enableSorting: true,
      cell: ({ row }) => formatDate(row.original.updatedAt),
    },
    {
      id: "actions",
      header: () => <div className="text-right">{labels.actionsHeader}</div>,
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

  if (opts.showMerchantColumn !== false) {
    columns.splice(1, 0, {
      accessorKey: "merchantId",
      header: labels.merchantHeader,
      enableSorting: true,
      cell: ({ row }) => row.original.merchantId || labels.emptyValue,
    });
  }

  return columns;
}
