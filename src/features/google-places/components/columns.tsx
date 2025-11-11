import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { iconActionGroup as IconActionGroup, type iconAction } from "@/shared/ui/IconActionGroup";
import { Link, Plus } from "lucide-react";
import type { GooglePlaceRow } from "../types";

export function googlePlaceColumns(opts: {
  onLink?: (placeId: string) => void;
  onCreate?: (place: GooglePlaceRow) => void;
  canLink?: boolean;
  canCreate?: boolean;
}): ColumnDef<GooglePlaceRow>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => row.original.name,
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => row.original.address,
    },
    {
      accessorKey: "locationName",
      header: "Location",
      cell: ({ row }) => row.original.locationName,
    },
    {
      accessorKey: "isLinked",
      header: "Status",
      cell: ({ row }) =>
        row.original.isLinked ? (
          <Badge>Linked</Badge>
        ) : (
          <Badge variant="outline">Unlinked</Badge>
        ),
    },
    {
      id: "actionsMenu",
      header: () => <div className="text-right">Actions</div>,
      meta: { forTable: true },
      cell: ({ row }) => {
        const place = row.original;
        const actions: iconAction[] = [];

        if (opts.onLink) {
          actions.push({
            onClick: () => opts.onLink?.(place.id),
            icon: <Link className="h-4 w-4" />,
            ariaLabel: "Link place",
            variant: "ghost",
            disabled: place.isLinked || opts.canLink === false,
          });
        }

        if (opts.onCreate) {
          actions.push({
            onClick: () => opts.onCreate?.(place),
            icon: <Plus className="h-4 w-4" />,
            ariaLabel: "Create place",
            variant: "default",
            disabled: place.isLinked || opts.canCreate === false,
          });
        }

        return (
          <div className="flex justify-end">
            <IconActionGroup actions={actions} condensed />
          </div>
        );
      },
    },
  ];
}
