Product & Data Spec (Final)
===========================

### Scope: Merchant · Place · Campaign · Theme · Shortlink (Redis) · Channels/UTM

Principles
----------

*   Each **Place** has one **canonical public page** (https://app.com/{placeSlug}).
    
*   **Campaigns** are **temporary contextual layers** (copy/CTA/theme overrides) bound to a Place.
    
*   **Themes** are **reusable merchant-scoped presets** defining visuals and branding.
    
*   **Shortlinks** resolve instantly via Redis to the canonical URL, adding analytics and channel/UTM tracking.
    
*   **Default shortlinks** are auto-created via API for each new Place to power QR and NFC tracking.
    

1\. Entities
------------

### 🧱 Merchant (tenant)

**Meaning:** The business owner or tenant.Each merchant can own multiple places, themes, campaigns, and shortlinks.

**Key fields:**

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {    id: string;    name: string;    defaultThemeId?: string; // reference to Theme    brandDefault?: { logoUrl?: string; brandColor?: string; accentColor?: string };  }   `

### 🎨 Theme (reusable visual preset)

**Meaning:** A reusable style preset **owned by a merchant**.Can be applied at Merchant, Place, Campaign, or Shortlink level.

**Key fields:**

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {    id: string;    merchantId: string;    name: string;    slug: string;    logoUrl?: string;    brandColor?: string;    accentColor?: string;    textColor?: string;    meta?: Record; // extensible tokens  }   `

**Used by:** Merchant (default), Place, Campaign, or Shortlink override.

### 📍 Place (canonical public page)

**Meaning:** Represents a physical or logical location of a Merchant.Holds the canonical slug and default landing configuration.

**Canonical URL:**https://app.com/{placeSlug}

**Key fields:**

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {    id: string;    merchantId: string;    localName: string;    slug: string; // globally unique    address?: string;    // Theming    themeId?: string; // optional, overrides merchant default    brand?: { logoUrl?: string; brandColor?: string; title?: string; subtitle?: string };    // Landing defaults    landingDefaults?: { title?: string; subtitle?: string; primaryCtaLabel?: string; primaryCtaUrl?: string };    // Platform links    googlePlaceId?: string;    googleUrl?: string;       // includes ?placeid= param    tripadvisorUrl?: string;    // Shortlink integration    defaultShortlinkCode?: string; // FK → Shortlink.code (created via API)  }   `

**Lifecycle:**

*   When a Place is created via API → backend automatically:
    
    *   Generates a default shortlink (sl:{placeSlug})
        
    *   Stores Redis JSON
        
    *   Saves defaultShortlinkCode back into Place
        
*   That shortlink powers the QR action in the UI.
    

### 🎯 Campaign (time-bound customization)

**Meaning:** A temporary context or promotional layer for a specific Place.

**Attribution URL:**https://app.com/{placeSlug}?c={campaignId}

**Key fields:**

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {    id: string;    merchantId: string;    placeId: string;    name: string;    status: "draft" | "active" | "archived";    themeId?: string;    landingOverride?: { title?: string; subtitle?: string; primaryCtaLabel?: string; primaryCtaUrl?: string };    // Optional campaign-level shortlinks (for analytics)    defaultShortlinkCode?: string;  }   `

2\. Rendering Precedence
------------------------

**Theme (visuals):**

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Shortlink.theme → Campaign.theme → Place.theme → Merchant.defaultTheme   `

**Landing copy (content):**

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Campaign.landingOverride → Place.landingDefaults   `

**Canonical URL:**

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   https://app.com/{placeSlug}   `

Campaigns only append query params (?c=), not new pages.

3\. Public URL Model
--------------------

ContextExample URLNotesPlace canonical[https://app.com/caffe\_blanc\_paris](https://app.com/caffe_blanc_paris)stable SEO pageWith campaign[https://app.com/caffe\_blanc\_paris?c=camp\_123](https://app.com/caffe_blanc_paris?c=camp_123)shows campaign overridesShortlink redirecthttps://s.app/summer25ultra-fast redirect via Redis

4\. Shortlink (Redis) — Contract
--------------------------------

**Key:** sl:{code}**Value:** single JSON blob

### Required fields

KeyTypeMeaningvnumberschema versiona1 | 0active flagustringfully resolved canonical URLmidstringmerchant IDtgtobjecttarget: {t:"campaign", cid, pid} | {t:"place", pid} | {t:"url"}

### Optional fields

KeyTypeMeaningeanumberexpiresAt (UNIX seconds)utmobjectbase UTM tags { source, medium, campaign, term, content }cmobjectper-channel overrides { \[ch\]: { u?, utm?, th? } }thstringforced theme ID or slugccnumbercached click countlcnumberlast click timestamp

### Example

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {    "v": 1,    "a": 1,    "u": "https://app.com/caffe_blanc_paris?c=camp_123",    "ea": 1767225600,    "mid": "mer_acme",    "tgt": { "t": "campaign", "cid": "camp_123", "pid": "pl_paris" },    "th": "theme_holiday",    "utm": { "campaign": "summer25", "medium": "offline" },    "cm": {      "qr":  { "utm": { "source": "qr" }, "th": "theme_classic" },      "nfc": { "utm": { "source": "nfc" }, "th": "theme_dark" },      "email": {        "u": "https://app.com/caffe_blanc_paris?c=camp_123&utm_medium=email",        "utm": { "source": "newsletter", "medium": "owned" }      }    }  }   `

5\. Redirect Semantics (Edge/Worker)
------------------------------------

**Input:** /s/{code}?ch=qr

### Steps:

1.  GET sl:{code} from Redis
    
2.  Validate a=1, not expired (ea)
    
3.  Start from base u
    
4.  Merge base utm
    
5.  If channel exists in cm, override u and/or merge its utm
    
6.  Append th param if set (theme override)
    
7.  Retain raw ch query param if provided
    
8.  **302 → final URL**
    
9.  Emit async event { code, ch, ts } to Redis Stream or analytics queue
    

**Privacy:** Internal IDs (mid, tgt) never exposed.

6\. Channels & UTM
------------------

**Channels (ch)**

*   qr, nfc, sms, email, web, print, fb, ig, x, etc.
    

**UTM tags**

*   Standard marketing parameters:utm\_source, utm\_medium, utm\_campaign, utm\_term, utm\_content
    

**Behavior**

*   Base utm applies to all traffic
    
*   cm\[ch\].utm merges on top
    
*   cm\[ch\].u can replace URL per channel
    
*   ch param preserved in redirect for analytics
    

7\. Authoring Rules
-------------------

**Creating a Shortlink**

*   Target type:
    
    *   campaign → u = canonicalPlaceUrl + ?c={campaignId}
        
    *   place → u = canonicalPlaceUrl
        
    *   url → external absolute URL
        
*   Optional: add th, base utm, and per-channel cm
    
*   Set a and optional ea
    

**Write flow**

*   Write JSON to sl:{code} in Redis
    
*   API also persists Shortlink document for tracking
    
*   Update the linked entity (place.defaultShortlinkCode if applicable)
    

**Indexes**

*   sl:merchant:{merchantId} (SET)
    
*   sl:expires (ZSET by expiry time)
    

**Validation**

*   Code must be URL-safe and unique
    
*   URL absolute
    
*   Tenant ownership verified (mid)
    
*   th and channel themes must belong to same merchant
    
*   ea in future
    

8\. Shortlink Lifecycle
-----------------------

EventBehaviorCreate PlaceAPI automatically creates default shortlink → saves defaultShortlinkCode in PlaceUpdate Place slugRebuild shortlink (update Redis + field)Delete PlaceDelete associated default shortlinkCreate CampaignOptional: create campaign-specific shortlinkMerchant disables shortlinka=0 flag set (kept for analytics)

9\. Why This Separation Works
-----------------------------

*   **Place** = canonical, SEO, always online
    
*   **Campaign** = temporary customization
    
*   **Theme** = reusable merchant-owned style preset
    
*   **Shortlink** = instant redirect layer (Redis) with analytics
    
*   **Channels** = attribution layer for offline-to-online traceability