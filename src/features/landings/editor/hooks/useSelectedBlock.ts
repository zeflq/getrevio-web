import * as React from "react";
import type { FieldArrayWithId } from "react-hook-form";

import type { LandingFormValues } from "../../model/landingSchema";

export function useSelectedBlock(
  fields: FieldArrayWithId<LandingFormValues, "content.blocks", "id">[]
) {
  const [selectedId, setSelectedId] = React.useState<string | null>(fields[0]?.id ?? null);

  React.useEffect(() => {
    if (!fields.length) {
      setSelectedId(null);
      return;
    }

    if (!selectedId) {
      setSelectedId(fields[0].id);
      return;
    }

    const stillExists = fields.some((block) => block.id === selectedId);
    if (!stillExists) {
      setSelectedId(fields[0].id);
    }
  }, [fields, selectedId]);

  const selectedIndex = selectedId ? fields.findIndex((block) => block.id === selectedId) : -1;

  const selectById = (id: string) => setSelectedId(id);
  const selectByIndex = (index: number) => {
    const field = fields[index];
    if (field) {
      setSelectedId(field.id);
    }
  };

  const selectNext = () => {
    if (!fields.length) return;
    const nextIndex = selectedIndex < fields.length - 1 ? selectedIndex + 1 : 0;
    selectByIndex(nextIndex);
  };

  const selectPrevious = () => {
    if (!fields.length) return;
    const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : fields.length - 1;
    selectByIndex(prevIndex);
  };

  return {
    selectedId,
    selectedIndex,
    selectById,
    selectByIndex,
    selectNext,
    selectPrevious,
  };
}
