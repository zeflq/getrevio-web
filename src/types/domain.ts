// src/types/domain.ts

export type UUID = string;
export type ISODate = string;
export type Channel = 'QR' | 'NFC' | 'SMS' | 'OTHER';

export interface Merchant {
  id: UUID;
  name: string;
  email?: string;
  locale?: string;
  defaultThemeId?: string
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'suspended';
  createdAt: ISODate;
}
export type Theme = {
  id: string;
  merchantId: string;
  name: string;
  logoUrl?: string;
  brandColor?: string;
  accentColor?: string;
  textColor?: string;
  meta?: Record<string, string | number>;
  createdAt: string;
  updatedAt: string;
};
export type LandingDefaults = {
  title?: string;
  subtitle?: string;
  primaryCtaLabel?: string;
  primaryCtaUrl?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
};

export interface Place {
  id: string;
  merchantId: string;
  localName: string;
  slug: string;                      // globally unique
  address?: string;
  // visuals
  themeId?: string;                  // overrides merchant default
  // landing defaults (when no campaign override)
  landingDefaults?: LandingDefaults;
  // optional platform reference (kept for future integrations)
  googlePlaceId?: string;
  // shortlink integration
  defaultShortlinkCode?: string;     // FK → Shortlink.code, code of sl:{code} in Redis, created by API
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: UUID;               // e.g. "cmp_1"
  merchantId: UUID;       // FK -> merchants.id
  placeId: UUID;          // FK -> places.id
  name: string;
  slug: string;           // landing slug, e.g. "bella-pizza-sept-2025"
  primaryCtaUrl: string;  // Google/Tripadvisor review URL
  theme?: { brandColor?: string; logoUrl?: string };
  status: 'draft' | 'active' | 'archived';
  startAt?: ISODate;
  endAt?: ISODate;
  createdAt: ISODate;
}

// Add a union type for shortlink target
export type ShortlinkTarget =
  | { t: "campaign"; cid: string; pid: string }
  | { t: "place"; pid: string }
  | { t: "url" };

export interface Shortlink {
  id: string;             // short id written to NFC/QR (base62-ish, 7–10 chars)
  code: string;           // canonical code used in public URLs / Redis
  merchantId: UUID;       // FK -> merchants.id

  // New targeting model
  target: ShortlinkTarget;

  // New channel format (free-form)
  channel?: string;                  // qr | nfc | email | web | print | custom

  // Optional overrides
  themeId?: string | null;           // enforce theme for this shortlink

  // New runtime/redis status fields
  active: boolean;                   // mirror of Redis a=1/0
  redisStatus?: "ok" | "missing" | "error"; // computed field (not stored permanently)

  // Optional UTM params
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };

  // Optional expiry
  expiresAt?: string | null;         // ISO

  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface EventRow {
  id: UUID;
  ts: ISODate;
  type: 'scan' | 'visit' | 'cta_click' | 'review_snapshot';
  merchantId: UUID;       // FK -> merchants.id
  campaignId: UUID;       // FK -> campaigns.id
  shortLinkId?: string;   // FK -> shortlinks.id (string)
  channel?: Channel;      // optional, copied from shortlink at emit time
  sid?: UUID;             // session correlation
  payload?: Record<string, unknown>;
}

export interface CampaignStatsDaily {
  id: UUID;
  day: string;            // YYYY-MM-DD
  campaignId: UUID;       // FK -> campaigns.id
  visits: number;
  ctaClicks: number;
  reviewDelta?: number;
}
