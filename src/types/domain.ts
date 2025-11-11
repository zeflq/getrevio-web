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
export interface Place {
  id: string;
  merchantId: string;
  localName: string;
  address?: string;
  googlePlaceId?: string | null;
  // shortlink integration
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: UUID;               // e.g. "cmp_1"
  merchantId: UUID;       // FK -> merchants.id
  placeId: UUID;          // FK -> places.id
  name: string;
  slug?: string;          // optional human-friendly slug
  status: 'draft' | 'active' | 'archived';
  startAt?: ISODate;
  endAt?: ISODate;
  createdAt: ISODate;
}

// Add a union type for shortlink target
export interface Shortlink {
  id: string;             // short id written to NFC/QR (base62-ish, 7–10 chars)
  code: string;           // canonical code used in public URLs / Redis
  merchantId: UUID;       // FK -> merchants.id

  landingId?: string | null;
  landing?: {
    id: string;
    name?: string | null;
  } | null;
  campaignId?: string | null;
  placeId?: string | null;

  // New channel format (free-form)
  channel?: string;                  // qr | nfc | email | web | print | custom

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
  expiresAt?: Date | null;         // ISO

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
