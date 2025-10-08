import type { Shortlink } from "@/types/domain";
import type { ShortlinkCreateInput, ShortlinkUpdateInput } from "../model/shortlinkSchema";

const trimOrUndefined = (value?: string | null) => {
  if (value === undefined || value === null) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const trimOrNull = (value?: string | null) => {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const ensureUtmForForm = (utm?: ShortlinkCreateInput["utm"]) => ({
  source: utm?.source ?? "",
  medium: utm?.medium ?? "",
  campaign: utm?.campaign ?? "",
  term: utm?.term ?? "",
  content: utm?.content ?? "",
});

const sanitizeUtm = (utm?: ShortlinkCreateInput["utm"]) => {
  if (!utm) return undefined;

  const source = trimOrUndefined(utm.source);
  const medium = trimOrUndefined(utm.medium);
  const campaign = trimOrUndefined(utm.campaign);
  const term = trimOrUndefined(utm.term);
  const content = trimOrUndefined(utm.content);

  if (!source && !medium && !campaign && !term && !content) {
    return undefined;
  }

  return {
    source,
    medium,
    campaign,
    term,
    content,
  };
};

export const createInitialShortlinkValues = (
  merchantId = "",
): ShortlinkCreateInput => ({
  code: undefined,
  merchantId,
  target: { t: "campaign", cid: "", pid: "" },
  channel: undefined,
  themeId: "",
  active: true,
  expiresAt: "",
  utm: ensureUtmForForm(),
});

export const shortlinkToFormValues = (shortlink: Shortlink): ShortlinkCreateInput => {
  const target = shortlink.target;

  return {
    code: shortlink.code,
    merchantId: shortlink.merchantId,
    target:
      target.t === "campaign"
        ? { t: "campaign", cid: target.cid, pid: target.pid }
        : { t: "place", pid: target.pid },
    channel: shortlink.channel ?? undefined,
    themeId: shortlink.themeId ?? "",
    active: shortlink.active,
    expiresAt: shortlink.expiresAt ?? "",
    utm: ensureUtmForForm(shortlink.utm),
  };
};

export const sanitizeShortlinkCreateInput = (
  values: ShortlinkCreateInput,
): ShortlinkCreateInput => {
  const target = values.target;

  const sanitizedTarget =
    target.t === "campaign"
      ? {
          t: "campaign" as const,
          cid: target.cid.trim(),
          pid: target.pid.trim(),
        }
      : {
          t: "place" as const,
          pid: target.pid.trim(),
        };

  const sanitized: ShortlinkCreateInput = {
    code: trimOrUndefined(values.code),
    merchantId: values.merchantId.trim(),
    target: sanitizedTarget,
    channel: trimOrUndefined(values.channel) ?? undefined,
    themeId: trimOrUndefined(values.themeId),
    active: !!values.active,
    expiresAt: trimOrNull(values.expiresAt),
    utm: sanitizeUtm(values.utm),
  };

  if (sanitized.channel === undefined) {
    delete sanitized.channel;
  }

  if (sanitized.themeId === undefined) {
    delete sanitized.themeId;
  }

  if (sanitized.expiresAt === null) {
    // keep null explicitly to clear the expiration; remove if undefined
    sanitized.expiresAt = null;
  } else if (sanitized.expiresAt === undefined) {
    delete sanitized.expiresAt;
  }

  if (!sanitized.utm) {
    delete sanitized.utm;
  }

  return sanitized;
};

export const buildCreateShortlinkPayload = (
  values: ShortlinkCreateInput,
): ShortlinkCreateInput => {
  const sanitized = sanitizeShortlinkCreateInput(values);
  // Ensure code is omitted if empty
  if (!sanitized.code) {
    delete sanitized.code;
  }
  return sanitized;
};

export const buildUpdateShortlinkPayload = (
  values: ShortlinkCreateInput,
): ShortlinkUpdateInput => {
  const sanitized = sanitizeShortlinkCreateInput(values);
  return {
    ...sanitized,
    code: values.code ? values.code.trim() : "",
  };
};
