// lib/transformers.ts
import type { Shortlink } from "@/types/domain";
import type { ShortlinkCreateInput, ShortlinkUpdateInput } from "../model/shortlinkSchema";
import type { ShortlinkFormValues } from "../model/shortlinkSchema";

// helpers identiques à ceux que tu as déjà
const CHANNELS = ["qr", "nfc", "email", "web", "print", "custom"] as const;
type Channel = typeof CHANNELS[number];
const asChannel = (v: unknown): Channel | undefined =>
  CHANNELS.includes(v as Channel) ? (v as Channel) : undefined;

const trimOrUndefined = (v?: string | null) => {
  if (v == null) return undefined;
  const t = v.trim();
  return t ? t : undefined;
};

const ensureUtmForForm = (utm?: ShortlinkFormValues["utm"]) => ({
  source: utm?.source ?? "",
  medium: utm?.medium ?? "",
  campaign: utm?.campaign ?? "",
  term: utm?.term ?? "",
  content: utm?.content ?? "",
});

// === Defaults / mapping vers Form ===
export const createInitialShortlinkValues = (
  merchantId = "",
  landingId = "",
): ShortlinkFormValues => ({
  code: undefined,
  merchantId,
  landingId,
  channel: undefined,
  active: true,
  expiresAt: undefined,
  utm: ensureUtmForForm(),
});

export const shortlinkToFormValues = (s: Shortlink): ShortlinkFormValues => ({
  code: s.code,
  merchantId: s.merchantId,
  landingId: s.landingId ?? "",
  channel: asChannel(s.channel),
  active: s.active,
  expiresAt: s.expiresAt ? new Date(s.expiresAt) : undefined,
  utm: ensureUtmForForm(s.utm),
});

// === Sanitize Form → DTO (Create/Update payloads) ===
export const buildCreateShortlinkPayload = (values: ShortlinkFormValues): ShortlinkCreateInput => {
  const expiresAtSan = values.expiresAt ? values.expiresAt : undefined;

  const payload: ShortlinkCreateInput = {
    code: (values.code ?? "").trim() || undefined,
    merchantId: values.merchantId.trim(),
    landingId: values.landingId.trim(),
    channel: values.channel,
    active: !!values.active,
    expiresAt: expiresAtSan,
    utm: values.utm,
  };

  if (!payload.code) delete payload.code;
  if (payload.channel === undefined) delete payload.channel;
  if (payload.expiresAt === undefined) delete payload.expiresAt;
  if (!payload.utm) delete payload.utm;

  return payload;
};

export const buildUpdateShortlinkPayload = (values: ShortlinkFormValues): ShortlinkUpdateInput => {
  const partial: ShortlinkUpdateInput = {
    code: (values.code ?? "").trim() || undefined, // optionnel en update
    merchantId: values.merchantId.trim(),
    landingId: values.landingId.trim(),
    channel: values.channel,
    active: !!values.active,
    expiresAt: values.expiresAt,
    utm: values.utm,
  };

  if (!partial.code) delete (partial as { code?: string }).code;
  if (partial.channel === undefined) delete partial.channel;
  if (partial.expiresAt === undefined) delete partial.expiresAt;
  if (!partial.utm) delete partial.utm;

  return partial;
};
