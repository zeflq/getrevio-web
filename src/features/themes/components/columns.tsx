// src/features/themes/components/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, Star } from "lucide-react";
import { iconActionGroup as IconActionGroup, iconAction } from "@/shared/ui/IconActionGroup";

export type ThemeRow = {
  id: string;
  merchantId?: string;
  name: string;
  logoUrl?: string;
  brandColor?: string;
  accentColor?: string;
  textColor?: string;
  createdAt: string;
};

function ColorSwatch({ color }: { color?: string }) {
  const c = color ?? "#ccc";
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block h-4 w-4 rounded-sm border"
        style={{ backgroundColor: c }}
        aria-label={c}
      />
      <span className="font-mono text-xs text-muted-foreground">{c}</span>
    </div>
  );
}

export function themeColumns(opts: {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string, ) => void;
  defaultThemeId?: string;
}): ColumnDef<ThemeRow>[] {

  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <button
          className="text-left font-medium hover:underline"
        >
          {row.original.name}
        </button>
      ),
      enableSorting: true,
    },
    { accessorKey: "merchantId", header: "Merchant" },
    {
      accessorKey: "brandColor",
      header: "Brand",
      cell: ({ row }) => <ColorSwatch color={row.original.brandColor} />,
    },
    {
      accessorKey: "accentColor",
      header: "Accent",
      cell: ({ row }) => <ColorSwatch color={row.original.accentColor} />,
    },
    {
      accessorKey: "textColor",
      header: "Text",
      cell: ({ row }) => <ColorSwatch color={row.original.textColor} />,
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
              displayMode="mobile"
              actions={[
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
                opts.onSetDefault && c.id !== opts.defaultThemeId && {
                  onClick: () => opts.onSetDefault(c.id),
                  icon: <Star className="h-4 w-4" />,
                  ariaLabel: "Set as default",
                  variant: "ghost",
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