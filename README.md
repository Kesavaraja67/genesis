# Genesis Runtime

> "In the beginning, there was a config."

Genesis is a powerful metadata-driven application runtime engine built to dynamically generate full-stack applications directly from JSON configurations. It processes definitions for models, frontend UI layouts, pages, and workflows, immediately rendering them into a fully functional, highly polished platform—without requiring manual compilation or deployment steps.

![Genesis Runtime](https://img.shields.io/badge/Status-Production_Ready-success)
![Framework](https://img.shields.io/badge/Next.js-14-black)
![Database](https://img.shields.io/badge/PostgreSQL-Prisma-blue)

## 🚀 Features

### Frontend Engine
- **Dynamic Rendering:** Instantly translates JSON UI schemas into polished forms, tables, dashboards, and layouts.
- **Graceful Fallbacks:** A highly robust `ErrorBoundary` and `FallbackComponent` system guarantees the frontend never crashes due to malformed or unknown JSON schemas.
- **Reusable Architecture:** Implements consistent Tailwind CSS design tokens (Palette 3) across all dynamically generated components.

### Backend Engine
- **Dynamic API Generation:** Generic CRUD routes (`app/api/runtime/[appId]/[model]`) seamlessly handle requests for any data model defined in the configuration.
- **Strict Validation:** A 3-pass Zod validator strictly sanitizes inputs, gracefully handling optional fields and mismatching schemas.
- **User-Scoped Data Access:** Data rows are implicitly tied to the authenticated user, enforcing multi-tenant isolation securely.

### Bonus Integrations
- 🔐 **Multi-Auth Login:** Full support for standard email/password Credentials, **Google OAuth**, and **GitHub OAuth**.
- ⚙️ **Workflow Automation:** Integrated background execution engine. Configure automated responses (logging, notifications, conditionals) triggered by manual events or database mutations.
- 📱 **Mobile / PWA Ready:** Completely standalone Progressive Web App with offline caching (`sw.js`), optimized `manifest.json`, dynamically generated icons, and a native install prompt UI.
- 📦 **App Export:** Need to deploy elsewhere? Use the "Export ZIP" feature to instantly bundle your dynamically generated app into a standalone Next.js repository.

## 🛠️ Architecture Overview

The system is built on **Track A AI App Generator** expectations:
1. **JSON Parser & Validator:** Takes raw JSON, scrubs it against defined Zod schemas, and standardizes layouts.
2. **Schema Builder:** Translates valid configurations into dynamic Prisma calls (via `lib/runtime/schemaBuilder.ts`).
3. **Render Engine:** The UI layer (`RenderEngine.tsx`) iterates over component definitions to output interactive React structures.

## 💻 Local Development

First, make sure your `.env` is configured with `DATABASE_URL`, `NEXTAUTH_SECRET`, and OAuth tokens.

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the dashboard and start building applications from configuration.

## 🛡️ Security
Genesis uses strict typing and data boundary validation. All secrets are managed securely via environment variables and are never committed or exposed in client builds.

---

*Genesis — Built for Track A: Metadata-Driven Application Runtime.*
