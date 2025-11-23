"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LandingBlockAddonDefinition,
  LandingAddon,
  LandingAddonKind,
  landingAddonPluginMap,
} from "@/features/landings/addons";

type AddonsActionsProps = {
  disabled?: boolean;
  buttonLabel: string;
  slots: LandingBlockAddonDefinition[];
  activeAddons: LandingAddon[];
  onSelect: (slot: LandingBlockAddonDefinition) => void;
};

export function AddonsActions({
  disabled,
  buttonLabel,
  slots,
  activeAddons,
  onSelect,
}: AddonsActionsProps) {
  const optionalSlots = slots.filter((slot) => slot.mode === "optional");
  const addonCounts = React.useMemo(() => {
    const map = new Map<LandingAddonKind, number>();
    activeAddons.forEach((addon) => {
      map.set(addon.kind, (map.get(addon.kind) ?? 0) + 1);
    });
    return map;
  }, [activeAddons]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" disabled={disabled}>
          {buttonLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {optionalSlots.map((slot) => {
          const currentCount = addonCounts.get(slot.kind) ?? 0;
          const reachedLimit = slot.maxInstances !== undefined && currentCount >= slot.maxInstances;
          const label = slot.label ?? landingAddonPluginMap[slot.kind]?.label ?? slot.kind;
          return (
            <DropdownMenuItem
              key={`${slot.kind}-${slot.mode}`}
              onSelect={() => onSelect(slot)}
              disabled={disabled || reachedLimit}
            >
              {label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
