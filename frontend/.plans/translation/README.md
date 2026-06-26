# Translation Planning

This directory contains all planning files for the frontend translation project.

## Goals

The goal of this translation project is to make the Ares Car Rental platform fully accessible to users in multiple languages (Arabic and English), systematically extracting all hardcoded strings into the next-intl message system.

## Context

- **i18n library**: next-intl
- **Locales**: `ar` (Arabic), `en` (English)
- **Default locale**: ar
- **Locale prefix**: never (URLs are locale-free)
- **Message files**: shared/messages/en.ts and shared/messages/ar.ts
- **Type definitions**: shared/messages/types/message.ts
- **i18n request config**: shared/i18n/request.ts
- **i18n routing**: shared/i18n/routing.ts

## Translation Workflow Per Page

When executing a page translation task:

1. **Component Discovery** - Read the page file and all \_components/ directories to identify all components used
2. **Hardcoded String Audit** - For each component, find all hardcoded UI strings (labels, placeholders, titles, messages, aria labels, etc.)
3. **Message Key Design** - Define message keys following the existing namespace pattern (e.g. auth.login.title, common.save)
4. **Type Update** - Add new keys to the TypeScript type definitions in shared/messages/types/message.ts
5. **English Translation** - Add English values to shared/messages/en.ts
6. **Arabic Translation** - Add Arabic values to shared/messages/ar.ts
7. **Component Update** - Replace hardcoded strings with useTranslations() or getTranslations() calls
8. **Verify** - Run type checking and linting to confirm no errors

## Key Principles

- All user-facing text must be extracted into message files - no hardcoded strings in components
- Message keys should be organized by page/feature context (namespace pattern)
- Reuse common keys from the common namespace where applicable
- Maintain the existing TypeScript type safety for messages
- Test translations in the actual UI to ensure proper display (especially RTL for Arabic)

## File Structure

```
.plans/translation/
+-- README.md          # This file - goals, description, and workflow
+-- main.md            # Master tracking - completion status of all page tasks
+-- pages/             # One task file per page (mirrors app/[locale] structure)
|   +-- auth/
|   +-- customer/
|   +-- dashboard/
|   +-- public/
|   +-- root/
+-- components/        # Component-level task files (created during execution)
```

## Per-Page Task File Template

Each page task file follows this structure:

```
# [Page Name] Translation Tasks

## Page Overview
- Route: [route path]
- Source: [file path relative to frontend/]

## Translation Status
- [ ] Not started
- [ ] In progress
- [ ] Completed

## Shared Components
(To be filled during execution - list _components/ used by this page)

## Component Discovery
(To be filled during execution - list all components with hardcoded strings)

## Translation Tasks
(To be filled during execution - one checkbox per component to translate)
```

> **Note**: Shared \_components/ directories at the route-group level (e.g. (auth)/\_components/, (dashboard)/\_components/) should be discovered and tracked during execution of the pages that use them.
