Here’s your **full, final Merchant Web App spec** — complete with the **Dashboard**, updated **Campaigns + Shortlink Manager**, analytics model, UX flows, and a **Figma-style JSON wireframe** you can hand to design.

Merchant Web App — Final Spec
=============================

Goals
-----

*   Mobile-first portal for merchants to manage **Places, Campaigns, Themes** and **Shortlinks**.
    
*   Show **traffic performance** (scans) and **engagement** (CTA clicks) with simple, actionable charts.
    
*   Keep redirects ultra-fast via **Redis shortlinks** (created by the API).
    

> This spec aligns with your Admin/Product data model:**Place = canonical page**, **Campaign = temporary overrides**, **Theme = reusable preset**, **Shortlink = fast redirect**.

Information Architecture (bottom nav)
-------------------------------------

1.  **Dashboard**
    
2.  **Places**
    
3.  **Campaigns**
    
4.  **Themes**
    
5.  **Settings**
    

Entities (merchant scope)
-------------------------

*   **Merchant**: owns Places, Campaigns, Themes, Shortlinks.
    
*   **Place**: has slug (canonical URL), landingDefaults, themeId, platform links (Google/Tripadvisor), and **auto-created default shortlink** (sl:{placeSlug}).
    
*   **Campaign**: targets a Place; can override theme/copy; can have **multiple shortlinks** (per channel).
    
*   **Theme**: reusable visual tokens; precedence: Shortlink.theme → Campaign.theme → Place.theme → Merchant.defaultTheme.
    
*   **Shortlink** (DB registry + Redis key): independent entries targeting a Campaign/Place/custom URL.
    

Events & Analytics Model
------------------------

### Tracked events

*   scan — shortlink redirect hit (from edge/worker).
    
*   cta\_click — landing page main CTA clicked (frontend event).
    

> **No review\_done in this version.** Funnel stops at CTA click.

### Aggregation (daily)

*   Store per merchant/place/campaign/day:
    
    *   scans (count of scan)
        
    *   ctaClicks (count of cta\_click)
        
    *   ctr = ctaClicks / scans
        

### API (examples)

*   GET /analytics/dashboard?merchantId=...
    
*   GET /analytics/places/:placeId?from=...&to=...
    
*   GET /analytics/campaigns/:campaignId?from=...&to=...
    

Return shapes:

```json
{
  "summary": { "scans": 1280, "ctaClicks": 640, "ctr": 50.0, "activeCampaigns": 4 },
  "scansDaily": [ { "date": "2025-09-22", "scans": 80, "ctaClicks": 34 }, ... ],
  "channels": [ { "channel": "qr", "visits": 720 }, { "channel": "nfc", "visits": 480 } ],
  "topCampaigns": [ { "id": "camp_1", "name": "Summer Launch", "scans": 512, "ctr": 47.0 } ]
}
```

Screens & UX
------------

### 1) Dashboard

**KPIs (cards):**

*   Total Scans, CTA Clicks, CTR %, Active Campaigns
    

**Charts:**

*   **Daily Scans vs CTA Clicks** (dual line, last 30 days)
    
*   **Channel Distribution** (donut: qr/nfc/email/…)
    
*   **Top Campaigns** (bars: scans; show CTR tooltip)
    
*   _(Optional)_ **Peak Hours Heatmap** (scans by hour)
    

**Quick actions:** Add Campaign, Manage Themes, Manage Places.

### 2) Places

#### List

*   Search + cards/rows: localName, address, theme badge
    
*   Actions: **QR**, **Edit**, **Copy Link**
    

**QR action:**

*   Shows QR for the **default shortlink** (https://s.app/{placeSlug})
    
*   Copy short URL, download PNG
    

**Copy Link:**

*   Copies canonical shortlink (https://s.app/{placeSlug})
    

#### Detail

*   **Info**: localName, address (edit)
    
*   **Landing Defaults**: title, subtitle, primary CTA label/url (edit)
    
*   **Theme**: picker (use merchant default or override)
    
*   **Default Shortlink**: code, short URL, QR
    
*   **Mini Analytics** (optional): place-level daily scans vs CTA clicks
    

> The Place’s default shortlink is created by the API on Place creation.

### 3) Campaigns

#### List

Columns: Name · Place · Status · Scans · CTR · **Actions**Actions:

*   **QR** → opens **Shortlink Manager** focused on the primary/QR link (or prompts to create one)
    
*   **Edit**
    
*   **Manage Shortlinks** (opens Shortlink Manager)
    
*   **Archive** (menu)
    

> **Removed:** inline “Copy Link” (now per-shortlink inside the manager).

#### Create/Edit

Fields:

*   name (required)
    
*   placeId (required)
    
*   status (default draft)
    
*   themeId (optional)
    
*   landingOverride (optional): title, subtitle, primaryCtaLabel, primaryCtaUrl
    

**On Create:**

*   Backend creates a campaign shortlink (code suggestion) → Redis (tgt={t:"campaign", cid, pid})
    
*   Return shortlinkCode (or none if you prefer only channel variants)
    

#### Detail

*   Header: name, status, place chip
    
*   **Analytics:** scans, CTA clicks, CTR + **daily scans vs clicks chart**
    
*   **Shortlinks card:** “Manage Shortlinks” button (opens manager)
    

### 4) Shortlink Manager (Modal/Sheet)

**Purpose:** Manage all shortlinks **for this Campaign** (or for a Place when opened from Place detail).

**Toolbar:** ➕ Create Shortlink

**List/Table (one per shortlink):**

*   Channel: qr / nfc / email / web / print / custom
    
*   Code: summer25, summer25\_nfc, …
    
*   Short URL: https://s.app/{code} **\[Copy\]**
    
*   Theme: optional override name/slug
    
*   Status: Active toggle (maps to Redis a=1/0)
    
*   Updated: relative time
    
*   Actions: **QR**, **Edit**, **Delete**
    

**Create/Edit Shortlink form:**

*   Target: read-only (campaign with {cid,pid} or place with {pid})
    
*   Channel: select (qr/nfc/email/web/print/custom)
    
*   Code: text (unique, URL-safe; suggest)
    
*   Theme override: select (optional)
    
*   UTM base: optional fields (source/medium/campaign/term/content)
    
*   Preview: final destination URL computed (place URL + ?c={cid} for campaigns)
    
*   Save → write to Redis (sl:{code}), upsert DB registry
    

### 5) Themes

#### List

*   Cards: name, preview (brand strip + logo), “Set default” badge (if chosen), actions (Edit/Delete).
    

#### Create/Edit

*   name, logoUrl, brandColor, accentColor, textColor
    
*   Live preview card
    

Used by Merchant (default), Place (override), Campaign (override), Shortlink (forced theme via th).

### 6) Settings

*   Merchant name, email
    
*   Default theme selector
    
*   Locale/timezone (optional)
    
*   Logout
    

Status & Permissions
--------------------

*   All operations scoped by merchantId.
    
*   **Campaign status → Redis**:
    
    *   draft → a=0 (not public)
        
    *   active → a=1
        
    *   archived → a=0
        
*   Place slug is global unique; **default shortlink** is sl:{slug}.
    

Reliability & Performance
-------------------------

*   Redirect path is Redis-only.
    
*   Events (scan) emitted from edge/worker to stream/queue.
    
*   cta\_click sent from landing frontend to API (debounced).
    
*   Nightly or rolling aggregations build daily analytics tables.
    
*   If Redis is down during creation: store Place/Campaign, flag the shortlink job for retry; UI falls back to canonical URL temporarily.
    

Figma-Style JSON (wireframes)
-----------------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {    "project": "Merchant Web App",    "screens": [      {        "name": "Dashboard",        "components": [          { "type": "Header", "props": { "title": "Hi, {{merchantName}}" } },          {            "type": "StatsRow",            "items": [              { "icon": "scan", "label": "Total Scans", "value": "1.2K" },              { "icon": "click", "label": "CTA Clicks", "value": "620" },              { "icon": "percent", "label": "CTR", "value": "51.6%" },              { "icon": "megaphone", "label": "Active Campaigns", "value": "4" }            ]          },          { "type": "ChartLineDual", "label": "Daily Scans vs CTA Clicks", "props": { "range": "30d" } },          { "type": "ChartDonut", "label": "Traffic by Channel" },          { "type": "TopList", "label": "Top Campaigns", "columns": ["Campaign", "Scans", "CTR"] },          { "type": "Heatmap", "label": "Peak Hours (Scans)", "props": { "visible": false } },          {            "type": "ButtonRow",            "buttons": [              { "label": "Add Campaign", "icon": "plus", "action": "openCreateCampaign" },              { "label": "Manage Themes", "icon": "palette", "action": "goThemes" },              { "label": "Manage Places", "icon": "map-pin", "action": "goPlaces" }            ]          }        ]      },      {        "name": "Places List",        "components": [          { "type": "SearchBar", "placeholder": "Search places..." },          {            "type": "List",            "items": [              {                "title": "Caffè Blanc - Paris",                "subtitle": "21 Rue de Lyon, Paris",                "badge": "Theme: Classic",                "actions": [ "QR", "Edit", "Copy" ]              }            ]          },          { "type": "Fab", "label": "Add Place", "visible": false }        ]      },      {        "name": "Place Detail",        "components": [          { "type": "Header", "props": { "title": "Caffè Blanc - Paris" } },          { "type": "SectionTitle", "text": "Info" },          { "type": "Input", "label": "Local Name" },          { "type": "Input", "label": "Address" },          { "type": "Select", "label": "Theme", "options": [] },          { "type": "SectionTitle", "text": "Landing Defaults" },          { "type": "Input", "label": "Title" },          { "type": "Input", "label": "Subtitle" },          { "type": "Input", "label": "Primary CTA Label" },          { "type": "Input", "label": "Primary CTA URL" },          { "type": "ShortlinkCard", "props": { "url": "https://s.app/caffe_blanc_paris", "actions": ["Copy", "QR"] } },          { "type": "ChartLineDual", "label": "Daily Scans vs CTA Clicks", "props": { "range": "14d" } },          { "type": "Button", "label": "Save Changes", "variant": "primary" }        ]      },      {        "name": "Campaigns List",        "components": [          { "type": "ListHeader", "title": "Campaigns", "actions": ["Add Campaign"] },          {            "type": "Table",            "columns": ["Name", "Place", "Status", "Scans", "CTR", "Actions"],            "rows": [              { "Name": "Summer Boost", "Place": "Caffè Blanc - Paris", "Status": "Active", "Scans": "512", "CTR": "47%", "Actions": ["QR", "Edit", "Manage Shortlinks"] }            ]          }        ]      },      {        "name": "Campaign Detail",        "components": [          { "type": "Header", "props": { "title": "Summer Boost", "chips": ["Active", "Caffè Blanc - Paris"] } },          { "type": "StatsRow", "items": [            { "icon": "scan", "label": "Scans", "value": "512" },            { "icon": "click", "label": "CTA Clicks", "value": "240" },            { "icon": "percent", "label": "CTR", "value": "46.9%" }          ]},          { "type": "ChartLineDual", "label": "Daily Scans vs CTA Clicks", "props": { "range": "30d" } },          { "type": "Card", "title": "Shortlinks", "actions": [{ "label": "Manage Shortlinks", "action": "openShortlinkManager" }] },          { "type": "ButtonRow", "buttons": [            { "label": "Edit Campaign", "icon": "edit" },            { "label": "Archive", "icon": "archive" }          ]}        ]      },      {        "name": "Shortlink Manager (Modal)",        "kind": "modal",        "components": [          { "type": "Header", "props": { "title": "Shortlinks for Summer Boost" } },          { "type": "Toolbar", "actions": [{ "label": "Create Shortlink", "icon": "plus" }] },          {            "type": "Table",            "columns": ["Channel", "Code", "Short URL", "Theme", "Status", "Updated", "Actions"],            "rows": [              { "Channel": "qr", "Code": "summer25", "Short URL": "https://s.app/summer25", "Theme": "classic", "Status": "Active", "Updated": "2d ago", "Actions": ["Copy", "QR", "Edit", "Delete"] },              { "Channel": "nfc", "Code": "summer25nfc", "Short URL": "https://s.app/summer25nfc", "Theme": "", "Status": "Active", "Updated": "5d ago", "Actions": ["Copy", "QR", "Edit", "Delete"] }            ]          }        ]      },      {        "name": "Themes",        "components": [          { "type": "Grid", "items": [            { "name": "Classic", "logo": "/classic.png", "color": "#FF6600", "actions": ["Edit", "Set Default"] },            { "name": "Holiday", "logo": "/holiday.png", "color": "#0099FF", "actions": ["Edit", "Delete"] }          ]},          { "type": "Button", "label": "Add Theme", "variant": "primary" }        ]      },      {        "name": "Settings",        "components": [          { "type": "Input", "label": "Merchant Name" },          { "type": "Input", "label": "Email" },          { "type": "Select", "label": "Default Theme" },          { "type": "Button", "label": "Save", "variant": "primary" }        ]      }    ]  }   `

### Done ✅

*   Dashboard included and aligned with **scan vs CTA click** focus.
    
*   Campaigns use a **Shortlink Manager** for multiple links.
    
*   Places rely on an **auto-created default shortlink** (slug-based) for QR.
    
*   Themes & Settings are minimal and consistent