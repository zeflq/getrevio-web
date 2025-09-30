// src/types/domain.ts

export type UUID = string;
export type ISODate = string;
export type Channel = 'QR' | 'NFC' | 'SMS' | 'OTHER';

export interface Merchant {
  id: UUID;
  name: string;
  email?: string;
  locale?: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'suspended';
  createdAt: ISODate;
}

export interface Place {
  id: UUID;               // e.g. "pl_bella_1"
  merchantId: UUID;       // FK -> merchants.id
  localName: string;
  address: string;
  googleUrl: string;      // writereview?placeid=...
  tripadvisorUrl?: string;
  createdAt: ISODate;
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

export interface Shortlink {
  id: string;             // short id written to NFC/QR (base62-ish, 7–10 chars)
  merchantId: UUID;       // FK -> merchants.id
  campaignId: UUID;       // FK -> campaigns.id
  targetSlug: string;     // denormalized Campaign.slug for ultra-fast redirect
  channel: Channel;       // QR | NFC | SMS | OTHER
  status: 'active' | 'paused' | 'retired';
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
