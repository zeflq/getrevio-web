# Implementation Guide: Split Project Rules

## 📁 File Structure

```
.claude/
├─ CLAUDE.md                                    # 2.0k - Brief overview
│
└─ rules/                                       # All auto-loaded
   ├─ 01-architecture-principles.md             # 5.8k - Feature-first, vertical slices
   ├─ 02-feature-structure.md                   # 7.8k - Model, server, folder structure
   ├─ 03-clean-architecture.md                  # 8.0k - Use cases, repositories, layers
   ├─ 04-multi-tenant-security.md               # 8.2k - Tenant enforcement (CRITICAL)
   ├─ 05-server-utilities.md                    # 7.4k - Query policies, guards
   ├─ 06-tech-stack.md                          # 6.9k - Next.js, Prisma, Zod, RHF
   ├─ 07-client-patterns.md                     # 7.1k - CRUD bridge, forms, tables
   ├─ 08-naming-conventions.md                  # 6.5k - Comprehensive naming tables
   └─ 09-anti-patterns.md                       # 5.2k - Banned patterns
```

**Total**: ~65k characters (was 47k before, now organized and expanded)  
**All files**: Under 8.5k characters ✅  
**Performance**: No warnings ✅

---

## 🎯 What Changed

### Before
- 1 large file (47k chars) → Performance warning
- Hard to navigate
- All-or-nothing loading

### After
- 10 focused files (~4-8k each)
- Easy to navigate by topic
- All automatically loaded
- Cross-references between files

---

## 📋 File Contents Summary

### CLAUDE.md (Overview)
- Quick project introduction
- Links to all rule files
- Critical rules summary
- Related documentation

### 01-architecture-principles.md
- Feature-first vertical slices
- Bounded contexts
- Public API patterns
- Dependency flow
- CQRS-lite overview

### 02-feature-structure.md
- Model layer (Zod schemas)
- Server layer structure
- Application layer (DTOs, interfaces)
- Infrastructure layer (Prisma)
- Interface layer (actions, queries)

### 03-clean-architecture.md
- Layer overview and dependencies
- Detailed use case patterns
- Repository interface patterns
- Prisma repository implementations
- Integration with Next.js

### 04-multi-tenant-security.md ⚠️ CRITICAL
- Tenant model (merchantId)
- 4-layer enforcement (guards, use cases, repos, policies)
- withTenantGuard usage
- ensureTenantAccess pattern
- Query policy enforcement
- Security checklist

### 05-server-utilities.md
- createQueryPolicy
- createSortPolicy
- createServerQueries
- Auth guards (withAuth, withTenantGuard, withSuperAdmin, withApiAuth)
- Where builders
- DTO mappers
- Complete examples

### 06-tech-stack.md
- Next.js App Router (Server Actions, Server Components)
- Prisma (client, selects, query patterns)
- Zod (schemas, refinements, validation)
- React Hook Form (setup, fields, submission)
- React Query (query keys, patterns)
- TypeScript (type patterns)

### 07-client-patterns.md
- CRUD bridge pattern
- Dialog forms (create)
- Sheet forms (edit)
- Delete confirmations
- Form fields components
- Table columns (TanStack Table)
- Dropdown/combobox with lite queries

### 08-naming-conventions.md
- Comprehensive tables for:
  - Files (15+ patterns)
  - Functions (10+ patterns)
  - Types (10+ patterns)
  - Components (9+ patterns)
  - Variables, constants, enums
- Layer-specific naming patterns
- Pluralization rules
- Consistency checklist

### 09-anti-patterns.md
- Architecture violations (7 patterns)
- Multi-tenant security violations (4 patterns)
- Type safety violations (2 patterns)
- React violations (2 patterns)
- Security violations (3 patterns)
- Performance violations (2 patterns)
- Error handling violations (2 patterns)
- Anti-pattern checklist

---

## 🚀 Installation Steps

```bash
# 1. Navigate to your project
cd /path/to/your-project

# 2. Create .claude directory structure
mkdir -p .claude/rules

# 3. Copy all files from outputs to .claude/
cp /path/to/outputs/.claude/CLAUDE.md .claude/
cp /path/to/outputs/.claude/rules/* .claude/rules/

# 4. Verify structure
tree .claude
# .claude/
# ├── CLAUDE.md
# └── rules/
#     ├── 01-architecture-principles.md
#     ├── 02-feature-structure.md
#     ├── 03-clean-architecture.md
#     ├── 04-multi-tenant-security.md
#     ├── 05-server-utilities.md
#     ├── 06-tech-stack.md
#     ├── 07-client-patterns.md
#     ├── 08-naming-conventions.md
#     └── 09-anti-patterns.md

# 5. Test with Claude Code
claude code .
# You should see: "Loaded 10 memory files"
```

---

## ✅ Verification

### Check Auto-Loading
```bash
# Start Claude Code
claude code .

# You should see output like:
# ✓ Loaded .claude/CLAUDE.md
# ✓ Loaded .claude/rules/01-architecture-principles.md
# ✓ Loaded .claude/rules/02-feature-structure.md
# ...
```

### Test with Brain Agent
```bash
# Try creating a feature
brain-agent: create a new "games" feature with full CRUD

# Claude should:
# 1. Follow feature-first architecture
# 2. Implement Clean Architecture layers
# 3. Enforce multi-tenant security
# 4. Use correct naming conventions
# 5. Avoid anti-patterns
```

---

## 🔄 Updating Agent References

Update each agent file to reference the new location:

```markdown
---
name: backend-agent
---

You are **backend-agent** (senior-level).

You MUST follow all rules in `.claude/rules/*.md` (auto-loaded).
Refer to `.claude/agents/_shared/conventions.md` for agent operations.

---
```

**Note**: No need to explicitly list each rule file since they're all auto-loaded.

---

## 📊 File Size Summary

All files are within Claude Code's 40k limit:

| File | Size | Status |
|------|------|--------|
| CLAUDE.md | ~2.0k | ✅ |
| 01-architecture-principles.md | ~5.8k | ✅ |
| 02-feature-structure.md | ~7.8k | ✅ |
| 03-clean-architecture.md | ~8.0k | ✅ |
| 04-multi-tenant-security.md | ~8.2k | ✅ |
| 05-server-utilities.md | ~7.4k | ✅ |
| 06-tech-stack.md | ~6.9k | ✅ |
| 07-client-patterns.md | ~7.1k | ✅ |
| 08-naming-conventions.md | ~6.5k | ✅ |
| 09-anti-patterns.md | ~5.2k | ✅ |
| **Total** | **~65k** | ✅ |

---

## 🎯 Benefits

1. **Performance**: Each file < 8.5k (well under 40k limit)
2. **Organization**: Easy to find specific rules
3. **Maintainability**: Update one file without affecting others
4. **Clarity**: Each file has single responsibility
5. **Cross-references**: Files link to each other
6. **Automatic**: All files auto-loaded by Claude Code

---

## 📖 Navigation Guide

**Want to know about...**
- Architecture patterns? → `01-architecture-principles.md`
- Folder structure? → `02-feature-structure.md`
- Use cases & repos? → `03-clean-architecture.md`
- **Security (CRITICAL)?** → `04-multi-tenant-security.md`
- Server utilities? → `05-server-utilities.md`
- Tech stack usage? → `06-tech-stack.md`
- Client patterns? → `07-client-patterns.md`
- Naming things? → `08-naming-conventions.md`
- What NOT to do? → `09-anti-patterns.md`

---

## 🔗 Related Files

- Agent operations: `.claude/agents/_shared/conventions.md`
- Custom agents: `.claude/agents/brain-agent.md`, etc.

---

**Status**: ✅ Ready for production  
**Date**: 2025-12-17  
**Version**: 1.0.0
