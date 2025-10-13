"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { CalendarIcon } from "lucide-react";

import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type ValueKind = "iso" | "date" | "string";

type RHFDateInputProps = {
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  requiredStar?: boolean;
  className?: string;
  valueKind?: ValueKind; // how to store back into RHF
  displayFormat?: (d: Date | undefined) => string; // for input display
  min?: string | Date;
  max?: string | Date;
};

function toISODate(d?: Date): string | undefined {
  if (!d || Number.isNaN(d.getTime())) return undefined;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function parseLooseDate(input?: string): Date | undefined {
  if (!input) return undefined;
  const d = new Date(input);
  if (!Number.isNaN(d.getTime())) return d;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  if (m) {
    const dd = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    if (!Number.isNaN(dd.getTime())) return dd;
  }
  return undefined;
}
function defaultDisplayFormat(d?: Date) {
  if (!d || Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" });
}
function coerceToDate(v: unknown): Date | undefined {
  if (!v) return undefined;
  if (v instanceof Date) return v;
  if (typeof v === "string") return parseLooseDate(v);
  return undefined;
}
function inBounds(date: Date | undefined, min?: string | Date, max?: string | Date) {
  if (!date) return true;
  const minD = typeof min === "string" ? parseLooseDate(min) : min;
  const maxD = typeof max === "string" ? parseLooseDate(max) : max;
  if (minD && date < minD) return false;
  if (maxD && date > maxD) return false;
  return true;
}

export function RHFDateInput({
  name,
  label,
  placeholder = "June 01, 2025",
  description,
  disabled,
  requiredStar,
  className,
  valueKind = "date",
  displayFormat = defaultDisplayFormat,
  min,
  max,
}: RHFDateInputProps) {
  const { control } = useFormContext();
  const [open, setOpen] = React.useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedDate = coerceToDate(field.value);
        const selectedIso = toISODate(selectedDate) ?? "";

        const [month, setMonth] = React.useState<Date | undefined>(selectedDate);
        const [text, setText] = React.useState<string>(displayFormat(selectedDate));

        // Track last applied ISO to prevent loops
        const lastIsoRef = React.useRef<string>(selectedIso);

        // ✅ Sync only when the ISO day actually changes
        React.useEffect(() => {
          if (lastIsoRef.current !== selectedIso) {
            lastIsoRef.current = selectedIso;
            const d = selectedIso ? parseLooseDate(selectedIso) : undefined;
            setMonth(d);
            setText(displayFormat(d));
          }
        }, [selectedIso, displayFormat]);

        const commitDate = (d?: Date) => {
          if (!d || Number.isNaN(d.getTime()) || !inBounds(d, min, max)) return;

          if (valueKind === "date") field.onChange(d);
          else if (valueKind === "string") field.onChange(displayFormat(d));
          else field.onChange(toISODate(d)); // iso

          // Update local UI immediately
          const iso = toISODate(d) ?? "";
          lastIsoRef.current = iso;
          setMonth(d);
          setText(displayFormat(d));
        };

        return (
          <FormItem className={className}>
            <FormLabel>
              {label} {requiredStar ? <span className="text-destructive">*</span> : null}
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  value={text}
                  placeholder={placeholder}
                  disabled={disabled}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setText(raw);
                    const maybe = parseLooseDate(raw);
                    if (maybe && inBounds(maybe, min, max)) {
                      setMonth(maybe);
                      commitDate(maybe);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setOpen(true);
                    }
                    if (e.key === "Escape") {
                      setOpen(false);
                    }
                  }}
                />

                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="absolute right-2 top-1/2 size-6 -translate-y-1/2"
                      disabled={disabled}
                      onClick={() => setOpen((v) => !v)}
                      tabIndex={-1}
                    >
                      <CalendarIcon className="size-3.5" />
                      <span className="sr-only">Select date</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="end"
                    alignOffset={-8}
                    sideOffset={10}
                  >
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      captionLayout="dropdown"
                      month={month}
                      onMonthChange={setMonth}
                      disabled={(d) => !inBounds(d, min, max)}
                      onSelect={(d) => {
                        if (d) commitDate(d);
                        setOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </FormControl>
            {description ? <FormDescription>{description}</FormDescription> : null}
            <FormMessage className="text-xs" />
          </FormItem>
        );
      }}
    />
  );
}
