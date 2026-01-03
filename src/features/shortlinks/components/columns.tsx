"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  iconActionGroup as IconActionGroup,
  iconAction,
} from "@/shared/ui/IconActionGroup";
import type { Shortlink } from "@/types/domain";
import { Link } from "@/i18n/navigation";

const DEFAULT_SHORT_URL_BASE = process.env.NEXT_PUBLIC_SHORT_URL_BASE ?? "https://getrevio.app";

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

export type ShortlinkRow = Pick<
  Shortlink,
  "id" | "code" | "merchantId" | "channel" | "active" | "redisStatus" | "landingId" | "landingName" | "createdAt" | "updatedAt"
>;

export function shortlinkColumns(opts: {
  onEdit: (id: string) => void;
  onDelete: (id: string, code: string) => void;
  onShowQr?: (code: string, shortUrl: string) => void; // optional QR handler
  getShortUrl?: (code: string) => string;              // override short URL builder
  showMerchantColumn?: boolean;
  mode?: "admin" | "merchant";
}): ColumnDef<ShortlinkRow>[] {
  const buildShortUrl =
    opts.getShortUrl ?? ((code: string) => `${DEFAULT_SHORT_URL_BASE.replace(/\/$/, "")}/${code}`);
  const showMerchantColumn = opts.showMerchantColumn ?? true;
  const mode = opts.mode ?? "admin";

  return [
    {
      accessorKey: "code",
      header: "Code",
      enableSorting: true,
      cell: ({ row }) => (
        <button className="text-left font-medium hover:underline" onClick={() => opts.onEdit(row.original.id)}>
          {row.original.code}
        </button>
      ),
    },
    ...(showMerchantColumn
      ? [
          {
            accessorKey: "merchantId",
            header: "Merchant",
            enableSorting: true,
            cell: ({ row }) => row.original.merchantId || "—",
          } as ColumnDef<ShortlinkRow>,
        ]
      : []),
    {
      accessorKey: "landingName",
      header: "Landing",
      cell: ({ row }) => {
        const { landingId, landingName } = row.original;

        if (!landingId) return "—";

        const displayText = landingName || landingId;

        return mode === "admin" ? (
          <Link
            href={`/admin/landings/${landingId}/edit`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {displayText}
          </Link>
        ) : (
          <Link
            href={`/m/landings/${landingId}/edit`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {displayText}
          </Link>
        );
      },
    },
    {
      accessorKey: "channel",
      header: "Channel",
      enableSorting: true,
      cell: ({ row }) => row.original.channel?.toUpperCase() ?? "—",
    },
    {
      accessorKey: "redisStatus",
      header: "Redis",
      cell: ({ row }) => {
        const status = row.original.redisStatus;
        if (status === "synced") return <Badge variant="default">Synced</Badge>;
        if (status === "not_synced") return <Badge variant="destructive">Not Synced</Badge>;
        return <Badge variant="outline">Unknown</Badge>;
      },
    },
    {
      accessorKey: "active",
      header: "Status",
      enableSorting: true,
      cell: ({ row }) =>
        row.original.active ? (
          <Badge variant="default">Active</Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      enableSorting: true,
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      meta: { forTable: true },
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const sl = row.original;
        const shortUrl = buildShortUrl(sl.code);

        return (
          <div className="flex justify-end">
            <IconActionGroup
              actions={
                [
                  opts.onShowQr && {
                    onClick: () => opts.onShowQr?.(sl.code, shortUrl),
                    icon: <Eye className="h-4 w-4" />,
                    ariaLabel: "View QR code",
                    tooltip: "View QR",
                  },
                  // Edit
                  {
                    onClick: () => opts.onEdit(sl.id),
                    icon: <Pencil className="h-4 w-4" />,
                    ariaLabel: "Edit",
                  },
                  // Delete
                  {
                    onClick: () => opts.onDelete(sl.id, sl.code),
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
