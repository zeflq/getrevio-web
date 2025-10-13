Product & Data Spec — Admin + Merchant (Final)
==============================================

0) Core Principles
------------------

*   **Place** = one canonical public page → https://app.com/{placeSlug}
    
*   **Campaign** = time-bound overrides on a Place (copy/CTA/theme)
    
*   **Theme** = reusable merchant-scoped visual preset
    
*   **Shortlink (Redis)** = ultra-fast redirect layer with channel/UTM attribution
    
*   **Default shortlink** is auto-created for every **Place** by the API
    

1) Admin: Data Model (Authoritative Schemas)
--------------------------------------------

### Merchant

```js
type Merchant = {
  id: string;
  name: string;
  defaultThemeId?: string;           // reference to Theme
  email?: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
};
```

### Theme (reusable visual preset; no slug)

```js
type Theme = {
  id: string;
  merchantId: string;
  name: string;
  logoUrl?: string;
  brandColor?: string;
  accentColor?: string;
  textColor?: string;
  meta?: Record;        // extensible tokens (fonts, radii, etc.)
  createdAt: string;
  updatedAt: string;
};
```

### Place (canonical page)

```js
type Place = {
  id: string;
  merchantId: string;
  localName: string;
  slug: string;                      // globally unique
  address?: string;
  // visuals
  themeId?: string;                  // overrides merchant default
  // landing defaults (when no campaign override)
  landingDefaults?: {
    title?: string;
    subtitle?: string;
    primaryCtaLabel?: string;
    primaryCtaUrl?: string;
    secondaryCtaLabel?: string;
    secondaryCtaUrl?: string;
  };
  // optional platform reference (kept for future integrations)
  googlePlaceId?: string;
  // shortlink integration
  createdAt: string;
  updatedAt: string;
};
```

### Campaign (time-bound customization on a Place)

```js
type Campaign = {
  id: string;
  merchantId: string;
  placeId: string;
  name: string;
  status: "draft" | "active" | "archived";
  // optional override of visuals
  themeId?: string;
  // optional override of landing content & CTAs
  landingOverride?: {
    title?: string;
    subtitle?: string;
    primaryCtaLabel?: string;
    primaryCtaUrl?: string;
    secondaryCtaLabel?: string;
    secondaryCtaUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
};
```

### Shortlink (DB mirror; Redis is the source for redirect)

```js
// Optional DB table to list & audit shortlinks in UI (not required to redirect)
type Shortlink = {
  code: string;                      // matches sl:{code}
  merchantId: string;
  target:
    | { t: "campaign"; cid: string; pid: string }
    | { t: "place"; pid: string }
    | { t: "url" };
  channel?: string;                  // qr | nfc | email | web | print | custom
  active: boolean;                   // mirror of Redis a=1/0
  redisStatus?: "ok" | "missing" | "error"; // computed field (not stored permanently)
  utm?: { source?: string; medium?: string; campaign?: string; term?: string; content?: string };
  expiresAt?: string | null;         // ISO
  createdAt: string;
  updatedAt: string;
};
```
### Admin sync semantics
---------------------------

| **Action**            | **Description**                                                                 |
|------------------------|---------------------------------------------------------------------------------|
| **Create / Update**    | Always writes Redis first, then DB (`ShortlinkDoc`).                            |
| **List in Admin UI**   | Reads from DB + checks Redis existence for each code.                           |
| **redisStatus field**  | Computed on fetch (`ok` / `missing` / `error`) and shown via an icon in the UI. |
| **Sync endpoint**      | `POST /admin/shortlinks/:code/sync` → recreates missing Redis key from DB.      |
| **Delete**             | `DELETE /admin/shortlinks/:code` → sets `a=0` or purges Redis + marks inactive in DB. |


### Shortlink (Redis contract)

**Key:** sl:{code}**Value (JSON):**

```json
{
  "v": 1,
  "a": 1,
  "u": "https://app.com/{placeSlug}?c={campaignId}",
  "ea": 1767225600,
  "mid": "mer_123",
  "tgt": { "t": "campaign", "cid": "camp_123" },
  "utm": { "campaign": "summer25", "medium": "offline" },
  "cm": {
    "qr":  { "utm": { "source": "qr" } },
    "nfc": { "utm": { "source": "nfc" } }
  },
  "th": "theme_holiday",
  "cc": 1240,
  "lc": 1767200000
}
```

2) Redirect Semantics (Edge/Worker)
-----------------------------------

Input: /s/{code}?ch=qr

1.  GET sl:{code}
    
2.  Validate a=1 and ea not expired
    
3.  Start with base u
    
4.  Merge base utm
    
5.  If cm\[ch\] exists → override u and/or merge utm, set channel th if provided
    
6.  Append th as ?th= if present
    
7.  Optionally preserve ch in final URL
    
8.  **302** to final URL
    
9.  Emit async event { code, mid, pid?, cid?, ch?, ts } to stream/queue
    

3) Rendering Precedence
-----------------------

*   **Theme (visuals):** Shortlink.theme → Campaign.theme → Place.theme → Merchant.defaultTheme
    
*   **Landing copy:** Campaign.landingOverride → Place.landingDefaults
    
*   **Canonical URL:** Always https://app.com/{placeSlug} (+ ?c=... for campaigns)
    

4) Admin API (CRUD + shortlinks)
--------------------------------

### Places

*   POST /admin/places
    
    *   Validates slug uniqueness
        
    *   Creates Place
        
-    *   Auto-creates default shortlink in Redis (sl:{slug})
        
*   PATCH /admin/places/:id (updates + re-hydrate shortlink if slug changed)
    
*   DELETE /admin/places/:id (soft delete; disable shortlink a=0)
    
*   GET /admin/places?merchantId=...
    
*   GET /admin/places/:id
    

### Campaigns

*   POST /admin/campaigns (no shortlink references stored; shortlinks managed separately)
    
*   PATCH /admin/campaigns/:id (status: draft→active toggles Redis a on linked shortlinks)
    
*   GET /admin/campaigns?merchantId=...
    
*   GET /admin/campaigns/:id
    

### Themes

*   POST /admin/themes
    
*   PATCH /admin/themes/:id
    
*   GET /admin/themes?merchantId=...
    
*   DELETE /admin/themes/:id (validate not used)
    

### Shortlinks (Admin convenience; Redis still source for redirect)

*   POST /admin/shortlinks → writes Redis + upserts ShortlinkDoc
    
*   PATCH /admin/shortlinks/:code → updates Redis + doc
    
*   DELETE /admin/shortlinks/:code → a=0 or delete+purge
    
*   GET /admin/shortlinks?merchantId=...&target=campaign|place&pid=...&cid=...
    

5) Analytics Model (Events & Aggregation)
-----------------------------------------

**Events**

*   scan — from redirect worker (includes code, mid, pid?, cid?, ch?, ts)
    
*   cta\_click — from landing page CTA click (includes mid, pid, cid?, ch?, ts)
    

**Daily aggregates**

```js
type DailyStats = {
  date: string;         // YYYY-MM-DD
  merchantId: string;
  placeId?: string;
  campaignId?: string;
  channel?: string;
  scans: number;
  ctaClicks: number;
  ctr: number;          // derived
};
```

**Admin analytics endpoints**

*   GET /admin/analytics/summary?merchantId=...&from=...&to=...
    
*   GET /admin/analytics/places/:placeId?from=...&to=...
    
*   GET /admin/analytics/campaigns/:campaignId?from=...&to=...
    

**Response shape (example)**

```json
{
  "summary": { "scans": 1280, "ctaClicks": 640, "ctr": 50.0 },
  "daily": [
    { "date": "2025-10-01", "scans": 120, "ctaClicks": 58 },
    { "date": "2025-10-02", "scans": 96, "ctaClicks": 44 }
  ],
  "channels": [
    { "channel": "qr", "visits": 720 },
    { "channel": "nfc", "visits": 480 }
  ],
  "topCampaigns": [
    { "id": "camp_1", "name": "Autumn Push", "scans": 512, "ctr": 47.0 }
  ]
}
```

6) Merchant Web App — UX/Flows (Mobile-first)
---------------------------------------------

### Bottom Nav

1.  **Dashboard**
    
2.  **Places**
    
3.  **Campaigns**
    
4.  **Themes**
    
5.  **Settings**
    

### 6.1 Dashboard

**KPI cards:** Total Scans · CTA Clicks · CTR · Active Campaigns**Charts:**

*   **Daily Scans vs CTA Clicks** (30d dual line)
    
*   **Channel Distribution** (donut: qr/nfc/email/…)
    
*   **Top Campaigns** (bars with scans & CTR tooltip)
    
*   _(Optional)_ Peak Hours heatmap (scans per hour)
    

**Endpoint**GET /analytics/dashboard?merchantId=...&from=...&to=...

**Payload**

```json
{
  "summary": { "scans": 2100, "ctaClicks": 980, "ctr": 46.7, "activeCampaigns": 5 },
  "scansDaily": [{ "date": "2025-09-22", "scans": 80, "ctaClicks": 34 }, ...],
  "channels": [{ "channel": "qr", "visits": 1200 }, { "channel": "nfc", "visits": 700 }],
  "topCampaigns": [{ "id": "camp_1", "name": "Autumn Push", "scans": 512, "ctr": 47.0 }]
}
```

### 6.2 Places

**List:** search + rows/cards: localName · address · theme badge**Row actions:** **QR** (default shortlink) · **Edit** · **Copy Link**

**Detail:**

*   Info (localName, address, theme select)
    
*   Landing Defaults (title, subtitle, primary/secondary CTA label+url)
    
*   Default Shortlink (code, https://s.app/{code}, QR, copy button)
    
*   Mini analytics (place-level scans vs CTA clicks, optional)
    

**API**

*   GET /places?merchantId=...
    
*   GET /places/:id
    
*   PATCH /places/:id (edits)
    

### 6.3 Campaigns

**List columns:** Name · Place · Status · Scans · CTR · **Actions****Actions:** **QR** (opens shortlink manager at QR filter) · **Edit** · **Manage Shortlinks** · Archive

**Create/Edit fields:**

*   name, placeId, status
    
*   optional themeId
    
*   optional landingOverride (title, subtitle, primaryCTA label/url, secondaryCTA label/url)
    

**Detail:**

*   Stats (scans, CTA clicks, CTR)
    
*   Daily chart (scans vs clicks)
    
*   Card: **Manage Shortlinks** button
    

**APIs**

*   POST /campaigns
    
*   PATCH /campaigns/:id
    
*   GET /campaigns?merchantId=...
    
*   GET /campaigns/:id
    

### 6.4 Shortlink Manager (modal/sheet)

**Purpose:** manage many shortlinks per campaign (or the place default + variants).

**List columns:** Channel · Code · Short URL (copy) · Theme · Status · Updated · Actions (QR, Edit, Delete)

**Create/Edit shortlink:**

*   Target (read-only): campaign {cid,pid} or place {pid}
    
*   Channel: qr | nfc | email | web | print | custom
    
*   Code: text (URL-safe, unique)
    
*   Theme override (th): optional
    
*   Base UTM: optional
    
*   Preview final URL
    
*   Save → writes Redis sl:{code} + optional DB mirror
    

**APIs**

*   GET /shortlinks?merchantId=...&tgt=campaign&cid=... (or place)
    
*   POST /shortlinks → create Redis + doc
    
*   PATCH /shortlinks/:code → update Redis + doc
    
*   DELETE /shortlinks/:code → a=0 (or purge)
    

### 6.5 Themes

**List:** cards with preview; actions: Edit / Delete / Set Default**Create/Edit:** name, logoUrl, brandColor, accentColor, textColor, meta (optional)

### 6.6 Settings

*   Merchant name, email (if applicable)
    
*   Default theme picker
    
*   Locale/timezone (optional)
    
*   Logout
    

7) Validation & Business Rules (recap)
--------------------------------------

*   Place.slug is **globally unique**
    

    
*   Campaign.status:
    
    *   draft → associated shortlinks typically a=0
        
    *   active → a=1
        
    *   archived → a=0
        
*   **Shortlink code** must be URL-safe and unique
    
*   u must be absolute and already resolved (canonical + ?c=... when campaign)
    
*   mid/theme ownership must match merchant
    
*   Optional ea must be in the future
    

8) Figma-style JSON (Merchant screens)
--------------------------------------

```json
{
  "project": "Merchant Web App",
  "screens": [
    {
      "name": "Dashboard",
      "components": [
        { "type": "Header", "props": { "title": "Hi, {{merchantName}}" } },
        {
          "type": "StatsRow",
          "items": [
            { "icon": "scan", "label": "Total Scans", "value": "2.1K" },
            { "icon": "click", "label": "CTA Clicks", "value": "980" },
            { "icon": "percent", "label": "CTR", "value": "46.7%" },
            { "icon": "megaphone", "label": "Active Campaigns", "value": "5" }
          ]
        },
        { "type": "ChartLineDual", "label": "Daily Scans vs CTA Clicks", "props": { "range": "30d" } },
        { "type": "ChartDonut", "label": "Traffic by Channel" },
        { "type": "TopList", "label": "Top Campaigns", "columns": ["Campaign", "Scans", "CTR"] }
      ]
    },
    {
      "name": "Places List",
      "components": [
        { "type": "SearchBar", "placeholder": "Search places..." },
        {
          "type": "List",
          "items": [
            {
              "title": "Caffè Blanc - Paris",
              "subtitle": "21 Rue de Lyon, Paris",
              "badge": "Theme: Classic",
              "actions": [ "QR", "Edit", "Copy" ]
            }
          ]
        }
      ]
    },
    {
      "name": "Place Detail",
      "components": [
        { "type": "Header", "props": { "title": "Caffè Blanc - Paris" } },
        { "type": "SectionTitle", "text": "Info" },
        { "type": "Input", "label": "Local Name" },
        { "type": "Input", "label": "Address" },
        { "type": "Select", "label": "Theme" },
        { "type": "SectionTitle", "text": "Landing Defaults" },
        { "type": "Input", "label": "Title" },
        { "type": "Input", "label": "Subtitle" },
        { "type": "Input", "label": "Primary CTA Label" },
        { "type": "Input", "label": "Primary CTA URL" },
        { "type": "Input", "label": "Secondary CTA Label" },
        { "type": "Input", "label": "Secondary CTA URL" },
        { "type": "ShortlinkCard", "props": { "url": "https://s.app/caffe_blanc_paris", "actions": ["Copy", "QR"] } },
        { "type": "ChartLineDual", "label": "Daily Scans vs CTA Clicks", "props": { "range": "14d" } }
      ]
    },
    {
      "name": "Campaigns List",
      "components": [
        { "type": "ListHeader", "title": "Campaigns", "actions": ["Add Campaign"] },
        {
          "type": "Table",
          "columns": ["Name", "Place", "Status", "Scans", "CTR", "Actions"],
          "rows": [
            { "Name": "Autumn Push", "Place": "Caffè Blanc - Paris", "Status": "Active", "Scans": "512", "CTR": "47%", "Actions": ["QR", "Edit", "Manage Shortlinks"] }
          ]
        }
      ]
    },
    {
      "name": "Campaign Detail",
      "components": [
        { "type": "Header", "props": { "title": "Autumn Push", "chips": ["Active", "Caffè Blanc - Paris"] } },
        { "type": "StatsRow", "items": [
          { "icon": "scan", "label": "Scans", "value": "512" },
          { "icon": "click", "label": "CTA Clicks", "value": "240" },
          { "icon": "percent", "label": "CTR", "value": "46.9%" }
        ]},
        { "type": "ChartLineDual", "label": "Daily Scans vs CTA Clicks", "props": { "range": "30d" } },
        { "type": "Card", "title": "Shortlinks", "actions": [{ "label": "Manage Shortlinks", "action": "openShortlinkManager" }] }
      ]
    },
    {
      "name": "Shortlink Manager (Modal)",
      "kind": "modal",
      "components": [
        { "type": "Header", "props": { "title": "Shortlinks for Autumn Push" } },
        { "type": "Toolbar", "actions": [{ "label": "Create Shortlink", "icon": "plus" }] },
        {
          "type": "Table",
          "columns": ["Channel", "Code", "Short URL", "Theme", "Status", "Updated", "Actions"],
          "rows": [
            { "Channel": "qr", "Code": "autumn25", "Short URL": "https://s.app/autumn25", "Theme": "classic", "Status": "Active", "Updated": "2d ago", "Actions": ["Copy", "QR", "Edit", "Delete"] },
            { "Channel": "nfc", "Code": "autumn25nfc", "Short URL": "https://s.app/autumn25nfc", "Theme": "", "Status": "Active", "Updated": "5d ago", "Actions": ["Copy", "QR", "Edit", "Delete"] }
          ]
        }
      ]
    },
    {
      "name": "Themes",
      "components": [
        { "type": "Grid", "items": [
          { "name": "Classic", "logo": "/classic.png", "color": "#FF6600", "actions": ["Edit", "Set Default"] },
          { "name": "Holiday", "logo": "/holiday.png", "color": "#0099FF", "actions": ["Edit", "Delete"] }
        ]},
        { "type": "Button", "label": "Add Theme", "variant": "primary" }
      ]
    },
    {
      "name": "Settings",
      "components": [
        { "type": "Input", "label": "Merchant Name" },
        { "type": "Select", "label": "Default Theme" },
        { "type": "Button", "label": "Save", "variant": "primary" }
      ]
    }
  ]
}
```