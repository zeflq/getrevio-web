"use client";

import * as React from "react";

import type { LandingBlockField } from "./useBlocksFieldArray";

export function useSelectedBlock(fields: LandingBlockField[]) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const prevFieldsLengthRef = React.useRef(fields.length);

  React.useEffect(() => {
    const prevLength = prevFieldsLengthRef.current;
    prevFieldsLengthRef.current = fields.length;
    const lengthChanged = fields.length !== prevLength;

    if (!fields.length) {
      setSelectedId(null);
      return;
    }

    if (lengthChanged && fields.length > prevLength) {
      setSelectedId(fields[fields.length - 1].id);
      return;
    }

    if (selectedId && fields.some((field) => field.id === selectedId)) {
      return;
    }

    if (prevLength === 0) {
      setSelectedId(fields[0].id);
    }
  }, [fields, selectedId]);

  const selectedIndex = React.useMemo(() => {
    if (selectedId === null) {
      return -1;
    }
    return fields.findIndex((field) => field.id === selectedId);
  }, [fields, selectedId]);

  const selectById = React.useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const selectByIndex = React.useCallback((index: number) => {
    const field = fields[index];
    if (field) {
      setSelectedId(field.id);
    }
  }, [fields]);

  return {
    selectedId,
    selectedIndex,
    selectById,
    selectByIndex,
  };
}
