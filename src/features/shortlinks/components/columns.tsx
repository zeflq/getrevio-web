"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, Copy, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  iconActionGroup as IconActionGroup,
  iconAction,
} from "@/shared/ui/IconActionGroup";
import type { Shortlink } from "@/types/domain";
import { Link } from "@/i18n/navigation";
import * as React from "react";

const DEFAULT_SHORT_URL_BASE = process.env.NEXT_PUBLIC_SHORT_URL_BASE ?? "https://getrevio.app";



const formatTarget = (
  target: Shortlink["target"] | undefined | null
): React.ReactNode => {
  if (!target) return "—";
  switch (target.t) {
    case "campaign":
      return (
        <Link href={`/admin/campaigns/${target.cid}`} className="text-primary underline-offset-4 hover:underline">
          Campaign
        </Link>
      );
    case "place":
      return (
        <Link href={`/admin/places/${target.pid}`} className="text-primary underline-offset-4 hover:underline">
          Place
        </Link>
      );
    default:
      return "Custom URL";
  }
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

export type ShortlinkRow = Pick<
  Shortlink,
  | "id"
  | "code"
  | "merchantId"
  | "channel"
  | "active"
  | "redisStatus"
  | "target"
  | "createdAt"
  | "updatedAt"
>;

export function shortlinkColumns(opts: {
  onEdit: (id: string) => void;
  onDelete: (id: string, code: string) => void;
  onShowQr?: (code: string, shortUrl: string) => void; // optional QR handler
  onCopied?: (what: "code" | "url") => void;           // optional toast hook
  getShortUrl?: (code: string) => string;              // override short URL builder
}): ColumnDef<ShortlinkRow>[] {
  const buildShortUrl =
  opts.getShortUrl ??
  ((code: string) => `${DEFAULT_SHORT_URL_BASE.replace(/\/$/, "")}/${code}`);

  return [
    {
      accessorKey: "code",
      header: "Code",
      enableSorting: true,
      cell: ({ row }) => (
        <button className="text-left font-medium hover:underline">
          {row.original.code}
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
      accessorKey: "target",
      header: "Target",
      cell: ({ row }) => formatTarget(row.original.target),
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
        const status = row.original.redisStatus ?? "unknown";
        if (status === "ok") return <Badge variant="default">OK</Badge>;
        if (status === "missing") return <Badge variant="destructive">Missing</Badge>;
        if (status === "error") return <Badge variant="destructive">Error</Badge>;
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

        const copyUrl = async () => {
          try {
            await navigator.clipboard.writeText(shortUrl);
            opts.onCopied?.("url");
          } catch {}
        };

        return (
          <div className="flex justify-end">
            <IconActionGroup
              actions={
                [
                  // Copy short URL
                  {
                    onClick: copyUrl,
                    icon: <Copy className="h-4 w-4" />,
                    ariaLabel: "Copy short URL",
                    tooltip: "Copy URL",
                  },
                  // Show QR
                  opts.onShowQr && {
                    onClick: () => opts.onShowQr!(sl.code, shortUrl),
                    icon: <QrCode className="h-4 w-4" />,
                    ariaLabel: "Show QR",
                    tooltip: "Show QR",
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
