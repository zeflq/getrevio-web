"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type {
  LandingBlockAddonDefinition,
  LandingAddon,
  LandingAddonKind,
} from "@/features/landings/addons";

import { EmptyState } from "../ui/EmptyState";

type AddonsActionsProps = {
  disabled?: boolean;
  label: string;
  addLabel: string;
  empty?: boolean;
  slots: LandingBlockAddonDefinition[];
  activeAddons: LandingAddon[];
  onSelect: (slot: LandingBlockAddonDefinition) => void;
  addOptionDisabled?: (slot: LandingBlockAddonDefinition) => boolean;
};

export function AddonsActions({
  disabled,
  label,
  addLabel,
  empty = false,
  slots,
  activeAddons,
  onSelect,
  addOptionDisabled,
}: AddonsActionsProps) {
  const addonsTranslations = useTranslations("landings.editor.addons.items");

  const optionalSlots = React.useMemo(
    () => slots.filter((s) => s.mode === "optional"),
    [slots]
  );

  const addonCounts = React.useMemo(() => {
    const map = new Map<LandingAddonKind, number>();
    for (const a of activeAddons) {
      map.set(a.kind, (map.get(a.kind) ?? 0) + 1);
    }
    return map;
  }, [activeAddons]);

  const containerClass = empty
    ? "space-y-4 rounded-lg border border-dashed p-4"
    : "";

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{label}</p>

        {optionalSlots.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" disabled={disabled}>
                {addLabel}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {optionalSlots.map((slot, i) => {
                const current = addonCounts.get(slot.kind) ?? 0;
                const reachedLimit =
                  slot.maxInstances != null && current >= slot.maxInstances;

                const disabledByParent = addOptionDisabled?.(slot) ?? false;

                const text =
                  addonsTranslations(`${slot.kind}.label` as any) ??
                  slot.kind;

                return (
                  <DropdownMenuItem
                    key={(slot as any).id ?? `${slot.kind}-${slot.mode}-${i}`}
                    onSelect={() => onSelect(slot)}
                    disabled={disabled || reachedLimit || disabledByParent}
                  >
                    {text}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {empty && <EmptyState />}
    </div>
  );
}
