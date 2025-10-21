export type LiteDTO = { value: string; label: string };

/**
 * Default mapper for lite combo-box style payloads.
 * Converts common id/name fields into the expected { value, label } shape.
 */
export const defaultLiteMapper = (row: any): LiteDTO => ({
  value: String(row?.id ?? row?.value ?? ""),
  label: String(row?.name ?? row?.label ?? row?.id ?? ""),
});
