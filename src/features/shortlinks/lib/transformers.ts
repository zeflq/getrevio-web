// lib/transformers.ts
import type { Shortlink } from "@/types/domain";
import type { ShortlinkCreateInput, ShortlinkUpdateInput } from "../model/shortlinkSchema";
import { shortlinkTargetSchema, type ShortlinkFormValues } from "../model/shortlinkSchema";
import type { z } from "zod";

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
  target: ShortlinkFormValues["target"] = null,
): ShortlinkFormValues => ({
  code: undefined,
  merchantId,
  target,
  channel: undefined,
  themeId: undefined,
  active: true,
  expiresAt: undefined,
  utm: ensureUtmForForm(),
});

export const shortlinkToFormValues = (s: Shortlink): ShortlinkFormValues => {
  const t = s.target;
  const formTarget =
  t?.t === "campaign"
    ? ({ t: "campaign", cid: t.cid } as const)
    : t?.t === "place"
    ? ({ t: "place", pid: t.pid } as const)
    : null;

  return {
    code: s.code,
    merchantId: s.merchantId,
    target: formTarget,                          // union | null
    channel: asChannel(s.channel),
    themeId: trimOrUndefined(s.themeId),
    active: s.active,
    expiresAt: s.expiresAt ? new Date(s.expiresAt):undefined,
    utm: ensureUtmForForm(s.utm),
  };
};

// === Sanitize Form → DTO (Create/Update payloads) ===
function assertTargetNonNull(t: ShortlinkFormValues["target"]): asserts t is z.infer<typeof shortlinkTargetSchema> {
  if (t === null) throw new Error("Target is required");
}

export const buildCreateShortlinkPayload = (values: ShortlinkFormValues): ShortlinkCreateInput => {
  // refuse submit si target null (au cas où la validation UI est bypassée)
  assertTargetNonNull(values.target);

  const expiresAtSan = values.expiresAt ? values.expiresAt : undefined;

  const payload: ShortlinkCreateInput = {
    code: (values.code ?? "").trim() || undefined,
    merchantId: values.merchantId.trim(),
    target:
      values?.target?.t === "campaign"
        ? { t: "campaign", cid: values.target.cid.trim() }
        : { t: "place",    pid: values?.target?.pid.trim() },
    channel: values.channel,
    themeId: values.themeId?.trim() || undefined,
    active: !!values.active,
    expiresAt: expiresAtSan,
    utm: values.utm,
  };

  if (!payload.code) delete payload.code;
  if (payload.channel === undefined) delete payload.channel;
  if (payload.themeId === undefined) delete payload.themeId;
  if (payload.expiresAt === undefined) delete payload.expiresAt;
  if (!payload.utm) delete payload.utm;

  return payload;
};

export const buildUpdateShortlinkPayload = (values: ShortlinkFormValues): ShortlinkUpdateInput => {
  // pour update, on garde la même règle: target doit être choisi
  assertTargetNonNull(values.target);

  const partial: ShortlinkUpdateInput = {
    code: (values.code ?? "").trim() || undefined, // optionnel en update
    merchantId: values.merchantId.trim(),
    target:
      values.target.t === "campaign"
        ? { t: "campaign", cid: values.target.cid.trim() }
        : { t: "place",    pid: values.target.pid.trim() },
    channel: values.channel,
    themeId: values.themeId?.trim() || undefined,
    active: !!values.active,
    expiresAt: values.expiresAt,
    utm: values.utm,
  };

  if (!partial.code) delete (partial as { code?: string }).code;
  if (partial.channel === undefined) delete partial.channel;
  if (partial.themeId === undefined) delete partial.themeId;
  if (partial.expiresAt === undefined) delete partial.expiresAt;
  if (!partial.utm) delete partial.utm;

  return partial;
};
