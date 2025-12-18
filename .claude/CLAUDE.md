# Getrevio Project

**Version**: 1.0.0  
**Last Updated**: 2025-12-17

This is a **feature-first vertical slice architecture** with Clean Architecture patterns, CQRS-lite, and multi-tenant security.

---

## 🎯 Quick Start

All architecture rules are in `.claude/rules/` and are **automatically loaded**.

### Architecture Overview

- **Pattern**: Feature-first vertical slices (not horizontal layers)
- **Style**: Clean Architecture with Hexagonal pattern
- **Data**: CQRS-lite (Actions for writes, Queries for reads)
- **Security**: Multi-tenant with `merchantId` enforcement at ALL layers
- **Stack**: Next.js App Router, Prisma, Zod, React Hook Form, React Query

---

## 📚 Rule Files

All files in `.claude/rules/` are automatically loaded:

1. **01-architecture-principles.md** - Feature-first, vertical slices, bounded contexts
2. **02-feature-structure.md** - Model layer, server structure, folder organization
3. **03-clean-architecture.md** - Use cases, repositories, dependency flow
4. **04-multi-tenant-security.md** - Tenant enforcement at all layers (CRITICAL)
5. **05-server-utilities.md** - Query policies, guards, createServerQueries
6. **06-tech-stack.md** - Next.js, Prisma, Zod, React Hook Form patterns
7. **07-client-patterns.md** - CRUD bridge, form components, table columns
8. **08-naming-conventions.md** - Files, functions, types (comprehensive tables)
9. **09-anti-patterns.md** - Banned patterns (MUST avoid)

---

## 🚨 Critical Rules

<rule priority="CRITICAL">
1. **Feature Isolation**: Never import from another feature's internals
2. **Multi-Tenant**: ALWAYS enforce `merchantId` at repository, use case, policy, and action levels
3. **Clean Architecture**: Business logic ONLY in use cases, not in actions or repositories
4. **Dependency Flow**: Application → Infrastructure (never reverse)
</rule>

---

## 📖 Examples

For complete working examples, see:
- `src/features/merchants/` - Full CRUD with admin features
- `src/features/places/` - Tenant-scoped CRUD
- `src/features/campaigns/` - Complex relationships

---

## 🔗 Related Documentation

- Agent operations & coordination: `.claude/agents/_shared/conventions.md`
- Custom agents: `.claude/agents/`
