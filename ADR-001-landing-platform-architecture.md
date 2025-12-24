# ADR-001: Landing Platform Architecture

**Status:** Accepted
**Date:** 2024-12-24
**Deciders:** Architecture Team
**Tags:** architecture, landing-builder, monorepo, api-first

---

## Context

We are building a Landing Platform with two distinct applications:

1. **Editor App**: Web application for merchants to compose and configure landing pages using blocks and addons
2. **Landing App**: Runtime application for end users who access landings via QR codes or NFC scans

### Requirements

- Both apps need to render the same blocks and addons
- Editor must provide accurate preview of published landings
- Landing app must be able to consume backend data reliably
- Avoid code duplication and business logic redundancy
- Support independent deployment and scaling of apps
- Enable future extensibility (mobile apps, external integrations)

### Current State

- Editor app exists using Next.js with Server Actions
- New Express API is being developed to replace Server Actions
- No landing app exists yet
- Blocks and addons are currently in editor app only
- Preview functionality needs to be implemented

### Constraints

- Must use Next.js for both frontend apps
- Must use Express for API (already decided)
- Must support multi-tenant architecture
- Must maintain high performance for landing runtime
- Must ensure preview accuracy (preview = production)

---

## Decision

We will implement a **Monorepo Architecture with Shared Rendering Core and Express API**.

### Architecture Overview

```
project/
├── packages/
│   └── landing-core/              # Shared rendering package
│       ├── blocks/                # All block components
│       ├── addons/                # All addon components
│       ├── components/            # Shared renderers
│       ├── templates/             # Template definitions
│       └── types/                 # Shared TypeScript types
│
├── apps/
│   ├── editor/                    # Next.js editor app
│   ├── landing/                   # Next.js landing runtime
│   └── api/                       # Express API service
│
└── package.json                   # Root workspace config
```

### Key Architectural Decisions

#### 1. **Monorepo with Shared Rendering Package**

**Decision:** Create `@repo/landing-core` package containing all blocks, addons, and rendering components.

**Rationale:**
- Blocks and addons are **pure UI components** (data in → UI out)
- Must be identical in preview and production for user trust
- Single source of truth eliminates drift risk
- Easier maintenance (fix once, both apps benefit)
- Type safety across apps via shared types
- Future-proof for additional clients (mobile, external)

**What is Shared:**
- ✅ Block components (React)
- ✅ Addon components (React)
- ✅ Rendering logic (LandingRenderer, BlockRenderer)
- ✅ Templates (definitions, meta, defaults)
- ✅ i18n utilities and translations
- ✅ TypeScript types and schemas (Zod)

**What is NOT Shared:**
- ❌ API client implementations (app-specific)
- ❌ Server Actions (editor-only)
- ❌ Authentication logic (different strategies)
- ❌ App-specific hooks (useQuery patterns differ)
- ❌ App layouts and routing

#### 2. **Express API as Single Source of Truth for Data**

**Decision:** Centralized Express API handles all data operations; both apps consume API via HTTP calls.

**Rationale:**
- Landing app can reliably access backend
- No duplicate business logic between apps
- Clear separation of concerns
- Easier to add external integrations
- Can scale API independently
- Supports multiple client types

**API Endpoints:**

```typescript
// Editor endpoints (authenticated)
GET    /api/v1/landings              // List landings
GET    /api/v1/landings/:id          // Get draft landing
POST   /api/v1/landings              // Create landing
PUT    /api/v1/landings/:id          // Update landing
DELETE /api/v1/landings/:id          // Delete landing
POST   /api/v1/landings/:id/preview-token  // Generate preview token

// Public endpoints (no auth required)
GET    /api/v1/landings/published/:slug    // Get published landing

// Preview endpoints (token auth)
GET    /api/v1/landings/preview/:token     // Get landing by preview token
```

**Data Flow:**

```
Editor App → API Client → Express API → Database
Landing App → API Client → Express API → Database
```

#### 3. **Preview Strategy: Shared Renderer in Both Apps**

**Decision:** Both editor and landing apps import and use the same `LandingRenderer` from `@repo/landing-core`.

**Rationale:**
- Guaranteed accuracy (preview = production, same code)
- No iframe overhead (faster, better UX)
- Simpler implementation than iframe approach
- Easier debugging (same stack trace)
- Supports responsive testing in editor

**Preview Implementation:**

```typescript
// Editor preview route
// apps/editor/app/preview/[id]/page.tsx
import { LandingRenderer } from '@repo/landing-core';

export default async function PreviewPage({ params }) {
  const landing = await apiClient.getLanding(params.id);
  return <LandingRenderer landing={landing} mode="preview" />;
}

// Landing runtime route
// apps/landing/app/[slug]/page.tsx
import { LandingRenderer } from '@repo/landing-core';

export default async function LandingPage({ params }) {
  const landing = await apiClient.getPublishedLanding(params.slug);
  return <LandingRenderer landing={landing} mode="runtime" />;
}
```

#### 4. **Gradual Migration from Server Actions to API**

**Decision:** Editor can continue using Server Actions during transition; migrate to API calls incrementally.

**Rationale:**
- No big-bang rewrite required
- Reduce risk during migration
- Can ship landing app while editor migrates
- Server Actions can proxy to API temporarily

**Migration Path:**

```
Phase 1: Build Express API (current)
Phase 2: Build Landing App with API (next)
Phase 3: Add Preview to Editor (parallel with Phase 2)
Phase 4: Migrate Editor from Server Actions to API (later, gradual)
```

#### 5. **Package Management: Turborepo**

**Decision:** Use Turborepo for monorepo management.

**Rationale:**
- Optimized build caching (faster CI/CD)
- Dependency graph management
- Simple configuration
- Great DX with watch mode
- Industry standard for Next.js monorepos

---

## Consequences

### Positive

1. **Consistency Guaranteed**
   - Preview and production use identical code
   - Eliminates "works in preview but not in production" bugs
   - Builds user trust in preview functionality

2. **Reduced Maintenance**
   - Fix bugs once in landing-core, both apps benefit
   - Add new blocks/addons once, available everywhere
   - Centralized testing for rendering logic

3. **Type Safety**
   - Shared TypeScript types prevent mismatches
   - Compile-time validation across apps
   - Better IDE support and autocomplete

4. **Independent Deployment**
   - Scale editor and landing apps separately
   - Deploy API independently
   - Can have different release cycles

5. **Future Extensibility**
   - Easy to add mobile app (import landing-core)
   - External integrations via API
   - Potential for white-label solutions

6. **Clear Separation of Concerns**
   - Rendering: `@repo/landing-core`
   - Data: Express API
   - Editor logic: Editor app
   - Runtime logic: Landing app

### Negative

1. **Monorepo Complexity**
   - Need to manage package dependencies
   - Build order matters (landing-core → apps)
   - Requires Turborepo knowledge
   - More complex CI/CD setup

2. **Initial Setup Overhead**
   - Time to extract blocks to package
   - Configure build pipeline
   - Set up workspace structure
   - Learning curve for team

3. **Breaking Changes Impact**
   - Changes to landing-core affect both apps
   - Need versioning strategy
   - Requires coordination during updates
   - More careful review process

4. **Hot Reload Complexity**
   - Need watch mode for landing-core during development
   - Slightly slower than direct imports
   - Turborepo helps but adds layer

### Mitigation Strategies

**For Monorepo Complexity:**
- Use Turborepo's caching to speed up builds
- Document setup process clearly
- Provide npm scripts for common tasks
- Use workspace protocol for package references

**For Breaking Changes:**
- Use semantic versioning for landing-core
- Require PR reviews for landing-core changes
- Run tests for all apps before merging
- Consider feature flags for major changes

**For Hot Reload:**
- Configure Turborepo watch mode
- Use `tsup --watch` for package development
- Document dev workflow clearly

---

## Alternatives Considered

### Alternative 1: Single Next.js App with Route-Based Separation

**Approach:**
```
app/
├── (editor)/          # Editor routes
├── (landing)/         # Landing routes
└── api/               # API routes (Next.js API routes)
```

**Pros:**
- Simplest setup
- Perfect code sharing (same app)
- Fastest development
- No monorepo complexity

**Cons:**
- Can't deploy editor and landing independently
- Can't scale separately
- Risk of coupling between concerns
- Harder to extract landing app later

**Rejected because:** Loses deployment flexibility and scaling independence.

---

### Alternative 2: Iframe-Based Preview

**Approach:**
- Editor app shows preview in iframe
- Iframe loads landing app directly
- Landing app is source of truth for rendering

**Pros:**
- Perfect isolation
- Landing app is definitive source
- No duplication at all
- Clear boundaries

**Cons:**
- Iframe overhead (performance)
- Complex communication (postMessage)
- CORS/CSP configuration needed
- Preview token management required
- Harder to debug
- Poor responsive testing UX

**Rejected because:** Performance overhead and complexity outweigh benefits; shared package achieves same goal more elegantly.

---

### Alternative 3: Duplicate Code (No Sharing)

**Approach:**
- Copy blocks/addons to both apps
- Sync manually or with scripts
- No monorepo needed

**Pros:**
- Simple setup
- No package management
- Direct imports (fast hot reload)
- Each app fully independent

**Cons:**
- Risk of drift (preview ≠ production)
- Fix bugs twice
- Add features twice
- Test twice
- Inconsistent behavior risk
- More maintenance burden

**Rejected because:** Risk of preview/production mismatch is unacceptable; maintenance burden too high.

---

## Implementation Roadmap

### Phase 1: Monorepo Setup ✅ (Current)

1. Initialize Turborepo
2. Create workspace structure
3. Configure root package.json
4. Set up build pipeline

### Phase 2: Extract Landing-Core Package 🚧 (Next)

1. Create `packages/landing-core/`
2. Move blocks from editor
3. Move addons from editor
4. Create shared components (LandingRenderer)
5. Configure package build (tsup)
6. Set up TypeScript exports
7. Update editor to import from package

### Phase 3: Complete Express API 🚧 (Current)

1. Implement all CRUD endpoints
2. Add authentication middleware
3. Implement preview token system
4. Add published landing endpoints
5. Set up database models
6. Write API tests

### Phase 4: Build Landing App 📋 (Upcoming)

1. Create Next.js app in `apps/landing/`
2. Configure to use `@repo/landing-core`
3. Implement public routes (`/[slug]`)
4. Implement preview routes (`/preview/[token]`)
5. Create API client wrapper
6. Test with Express API
7. Add analytics/tracking

### Phase 5: Add Preview to Editor 📋 (Parallel with Phase 4)

1. Create preview route in editor
2. Implement preview UI with toolbar
3. Add device simulators
4. Connect to API for draft data
5. Use `@repo/landing-core` renderer
6. Add refresh/sync functionality

### Phase 6: Migrate Editor to API 📋 (Later)

1. Create API client wrapper for editor
2. Replace Server Actions with API calls (gradual)
3. Update React Query hooks
4. Test thoroughly
5. Remove Server Actions when complete

---

## Metrics for Success

### Development Metrics
- Build time < 30s for full build
- Hot reload time < 2s
- Package dependency update time < 5min

### Quality Metrics
- Zero drift between preview and production
- Test coverage > 80% for landing-core
- TypeScript strict mode enabled
- Zero type errors across workspace

### Performance Metrics
- Landing page load < 1s (LCP)
- Preview render < 500ms
- API response time < 100ms (p95)

---

## Related Documents

- [Landing i18n and Defaults System](./src/features/landings/docs/i18n-and-defaults.md)
- [Multi-Tenant Security Rules](./.claude/rules/04-multi-tenant-security.md)
- [Feature Structure Guide](./.claude/rules/02-feature-structure.md)

---

## References

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Monorepo Best Practices](https://monorepo.tools/)
- [Next.js Multi-Zone](https://nextjs.org/docs/advanced-features/multi-zones)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2024-12-24 | Use monorepo with shared landing-core | Guarantee preview/production consistency |
| 2024-12-24 | Express API as backend | Reliable access for landing app |
| 2024-12-24 | Shared renderer (not iframe) | Better performance and UX |
| 2024-12-24 | Gradual Server Actions migration | Reduce risk, ship incrementally |
| 2024-12-24 | Turborepo for monorepo management | Industry standard, great DX |

---

## Approval

**Status:** Accepted
**Approved by:** Architecture Team
**Implementation Owner:** Development Team
**Review Date:** 2025-Q1 (3 months post-implementation)

---

## Notes

- This ADR supersedes any previous informal architectural decisions
- Changes to this architecture require new ADR or amendment
- Regular reviews scheduled quarterly
- Open to refinement based on implementation learnings

---

**Document Version:** 1.0
**Last Updated:** 2024-12-24
**Next Review:** 2025-03-24
