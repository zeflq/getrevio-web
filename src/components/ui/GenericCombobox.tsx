// genericCombobox.tsx
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandDialog,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function useIsMobile(bp = 640) {
  const [m, setM] = React.useState(false);
  React.useEffect(() => {
    const q = window.matchMedia(`(max-width:${bp}px)`);
    const cb = () => setM(q.matches);
    cb(); q.addEventListener("change", cb);
    return () => q.removeEventListener("change", cb);
  }, [bp]);
  return m;
}

export type genericComboboxProps<TOption> = {
  options: TOption[];
  value?: string | null;
  onChange?: (value: string | null, option: TOption | null) => void;
  getOptionValue: (opt: TOption) => string;
  getOptionLabel: (opt: TOption) => string;
  optionDisabled?: (opt: TOption) => boolean;
  optionIcon?: (opt: TOption) => React.ReactNode;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  contentClassName?: string;
  clearOnReselect?: boolean;
  loading?: boolean;
  mobileDialog?: boolean; // default true
};

export function GenericCombobox<TOption>({
  options,
  value,
  onChange,
  getOptionValue,
  getOptionLabel,
  optionDisabled,
  optionIcon,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No results.",
  disabled,
  className,
  buttonClassName,
  contentClassName,
  clearOnReselect = true,
  loading = false,
  mobileDialog = true,
}: genericComboboxProps<TOption>) {
  const isMobile = useIsMobile();
  const useDialog = mobileDialog && isMobile;

  const [open, setOpen] = React.useState(false);
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState<string | null>(value ?? null);
  React.useEffect(() => {
    if (isControlled) setInternal(value ?? null);
  }, [isControlled, value]);

  const selected =
    internal != null ? options.find((o) => getOptionValue(o) === internal) : undefined;

  const handleSelect = (v: string) => {
    const same = internal === v;
    const next = clearOnReselect && same ? null : v;
    if (!isControlled) setInternal(next);
    const opt = next == null ? null : options.find((o) => getOptionValue(o) === next) ?? null;
    onChange?.(next, opt);
    setOpen(false);
  };

  const list = (
    <Command>
      <CommandInput placeholder={searchPlaceholder} className="h-9" />
      <CommandList className="max-h-[min(60vh,360px)] overflow-auto overscroll-contain">
        {loading ? (
          <CommandEmpty>
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </span>
          </CommandEmpty>
        ) : (
          <CommandEmpty>{emptyText}</CommandEmpty>
        )}
        <CommandGroup>
          {options.map((opt) => {
            const v = getOptionValue(opt);
            const label = getOptionLabel(opt);
            const dis = optionDisabled?.(opt) ?? false;
            const icon = optionIcon?.(opt);
            const isSel = internal === v;
            return (
              <CommandItem
                key={v}
                value={label}
                disabled={dis}
                onSelect={() => handleSelect(v)}
                className="gap-2 h-11"
              >
                {icon}
                <span className="truncate">{label}</span>
                <Check className={cn("ml-auto h-4 w-4", isSel ? "opacity-100" : "opacity-0")} />
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  return (
    <div className={cn("w-full", className)}>
      {useDialog ? (
        <>
          <Button
            variant="outline"
            role="combobox"
            disabled={!!disabled}
            onClick={() => setOpen(true)}
            className={cn("w-full justify-between", buttonClassName)}
          >
            {selected ? getOptionLabel(selected) : placeholder}
            {loading ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin opacity-70" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
            )}
          </Button>
          <CommandDialog open={open} onOpenChange={setOpen}>{list}</CommandDialog>
        </>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            {/* ✅ single child */}
            <Button
              variant="outline"
              role="combobox"
              disabled={!!disabled}
              className={cn("w-full justify-between", buttonClassName)}
            >
              {selected ? getOptionLabel(selected) : placeholder}
              {loading ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin opacity-70" />
              ) : (
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            side="bottom"
            sideOffset={4}
            collisionPadding={8}
            className={cn(
              "z-50 p-0 w-[var(--radix-popover-trigger-width)]",
              contentClassName
            )}
          >
            {list}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
