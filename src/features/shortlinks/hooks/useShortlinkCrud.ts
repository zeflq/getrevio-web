// src/features/shortlinks/hooks/useShortlinkCrud.ts
"use client";

import { createCrudHooks } from '@/hooks/createCrudHooks';
import type { Shortlink } from '@/types/domain';

import type { ShortlinkCreateInput, ShortlinkUpdateInput } from '../model/shortlinkSchema';
import { listShortlinks, type ListShortlinksParams } from '../api/listShortlinks';
import { getShortlinkByCode } from '../api/getShortlinkByCode';
import { createShortlink } from '../api/createShortlink';
import { updateShortlink } from '../api/updateShortlink';
import { deleteShortlink } from '../api/deleteShortlink';

// Build CRUD hooks using the shared utility and shortlinks API
const crud = createCrudHooks<Shortlink, string>({
  keyBase: ["shortlinks"],

  // list should return: { data, total, totalPages }
  list: (params) => listShortlinks(params as ListShortlinksParams),

  // item by code
  get: (code) => getShortlinkByCode(code),

  // create/update/delete use feature API
  create: (input) => createShortlink(input as ShortlinkCreateInput),
  update: (code, input) => updateShortlink(code, input as ShortlinkUpdateInput),
  remove: (code) => deleteShortlink(code),

  staleTimeMs: 30_000,
});

// Export typed hook wrappers for convenient usage
export const useShortlinksList = (params: ListShortlinksParams = {}) => crud.useList!(params);
export const useShortlinkItem = (code?: string) => crud.useItem!(code);
export const useCreateShortlink = () => crud.useCreate!();
export const useUpdateShortlink = () => crud.useUpdate!();
export const useDeleteShortlink = () => crud.useRemove!();
