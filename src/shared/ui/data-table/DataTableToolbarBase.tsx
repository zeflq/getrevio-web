"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type FilterLabelResolvers = Record<string, (value: unknown) => string>;

interface DataTableToolbarBaseProps<TData> {
  table: Table<TData>;
  searchKey?: string;
  searchPlaceholder?: string;

  /** Filters UI (chips/selects/etc.) */
  leftExtras?: React.ReactNode;
  
  rightExtras?: React.ReactNode;

  serverMode?: boolean;
  condensed?: boolean;
  debounceMs?: number;
  className?: string;

  /** When true, wraps leftExtras in a bottom Sheet on mobile */
  leftCollapsibleOnMobile?: boolean;

  /** Pretty labels for future extensions (kept to avoid breaking) */
  filterLabel?: FilterLabelResolvers;
}

/** tiny debounce */
function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function DataTableToolbarBase<TData>({
  table,
  searchKey,
  searchPlaceholder = "Search…",
  leftExtras,
  rightExtras,
  serverMode,
  condensed,
  debounceMs = 250,
  className,
  leftCollapsibleOnMobile = true,
}: DataTableToolbarBaseProps<TData>) {
  // init from existing filter
  const initial = React.useMemo(() => {
    if (!searchKey) return "";
    const v = table.getColumn(searchKey)?.getFilterValue();
    return (typeof v === "string" ? v : "") ?? "";
  }, [table, searchKey]);

  const [value, setValue] = React.useState(initial);
  const debounced = useDebouncedValue(value, debounceMs);

  // bind search
  React.useEffect(() => {
    if (!searchKey) return;
    table.getColumn(searchKey)?.setFilterValue(debounced);
  }, [debounced, table, searchKey]);

  // keep local in sync
  React.useEffect(() => setValue(initial), [initial]);

  // keyboard helpers
  const searchRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === searchRef.current) {
        setValue("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // compute active filters (exclude searchKey + empty)
  const activeFilters = React.useMemo(() => {
    const { columnFilters } = table.getState();
    return columnFilters.filter(
      (f) =>
        f.id !== searchKey &&
        f.value !== undefined &&
        f.value !== "" &&
        !(Array.isArray(f.value) && f.value.length === 0)
    );
  }, [table, searchKey]);

  const activeCount = activeFilters.length;

  const clearAll = () => {
    table.resetColumnFilters();
    table.resetSorting();
    if (!serverMode) table.resetPagination();
    setValue("");
  };

  const inputClasses = condensed ? "h-8" : "h-9";
  const btnClasses = condensed ? "h-8" : "h-9";

  return (
    <div
      className={cn(
        "w-full p-0",
        // sticky on mobile for quick access
        "sticky top-14 z-30 md:static md:z-auto backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        {/* LEFT (desktop): search + filters */}
        <div className="hidden w-full flex-col gap-2 md:flex md:flex-row md:items-center md:gap-2 md:flex-1">
          {searchKey && (
            <div className="flex w-full items-center gap-2 md:w-auto md:min-w-[260px]">
              <Input
                ref={searchRef}
                type="search"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={searchPlaceholder}
                className={cn("w-full md:w-[260px]", inputClasses)}
                aria-label="Search"
              />
              {value ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={btnClasses}
                  onClick={() => setValue("")}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          )}

          {leftExtras ? (
            <>
              <div className="hidden md:flex md:flex-wrap items-center gap-2">
                {leftExtras}
              </div>
              <Button
                variant="outline"
                size={condensed ? "sm" : "default"}
                className="hidden md:inline-flex"
                onClick={clearAll}
              >
                Reset
              </Button>
            </>
          ) : null}

        </div>

        {/* RIGHT (desktop): actions */}
        <div className="hidden md:flex flex-wrap items-center justify-end gap-2">
          {rightExtras}
        </div>

        {/* MOBILE: inline search (flex-1) + filter + actions (group handles layout) */}
        <div className="md:hidden flex items-center gap-0">
          {searchKey && (
            <div className="flex items-center gap-2 flex-1">
              <Input
                ref={searchRef}
                type="search"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={searchPlaceholder}
                className={cn("w-full", inputClasses)}
                aria-label="Search"
              />
              {value ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={btnClasses}
                  onClick={() => setValue("")}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          )}

          {leftExtras && leftCollapsibleOnMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className={btnClasses} aria-label="Filters">
                  <SlidersHorizontal className="h-4 w-4" />
                  {activeCount ? (
                    <Badge variant="secondary" className="ml-0">
                      {activeCount}
                    </Badge>
                  ) : null}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[80vh] overflow-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-4 flex flex-col gap-3">{leftExtras}</div>
                <SheetFooter className="mt-4">
                  <Button variant="ghost" onClick={clearAll}>
                    Reset
                  </Button>
                  <SheetClose asChild>
                    <Button>Apply</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          ) : null}

          {/* Actions — the group decides how to render on mobile */}
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            {rightExtras}
          </div>
        </div>
      </div>
    </div>
  );
}
