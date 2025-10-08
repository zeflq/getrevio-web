"use client";

import * as React from "react";
import type { FieldErrors } from "react-hook-form";

export function useFlattenErrors(errors: FieldErrors) {
  return React.useMemo(() => {
    const flat: string[] = [];

    const walk = (value: unknown, prefix = "") => {
      if (value && typeof value === "object") {
        for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
          const path = prefix ? `${prefix}.${key}` : key;
          if (child && typeof child === "object" && !("type" in (child as Record<string, unknown>))) {
            walk(child, path);
          } else {
            flat.push(path);
          }
        }
      }
    };

    walk(errors);
    return flat;
  }, [errors]);
}
