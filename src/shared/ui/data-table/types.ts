/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColumnMeta } from "@tanstack/react-table";

export type DataTableColumnMeta = ColumnMeta<any, any> & {
  forTable?: boolean;
  forCard?: boolean;
  headerText?: string;
  accessorLabel?: string;
};
