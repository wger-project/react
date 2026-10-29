# wger React frontend

Vite + React + MUI v9 + @tanstack/react-query + react-i18next. Tests via vitest, lint via eslint.

## Verify after edits

- `npm test` — vitest, runs with `LANG=de_de`
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — eslint on `src/`

Run the relevant ones for what you changed; no need to run all three for a typo. For UI changes that aren't covered by a
test, use the preview tools to verify in a browser before declaring done.

## Dev setup

- `npm start` serves on port 3000 (`dev` in `.claude/launch.json`). The backend comes from `VITE_API_SERVER` in
  `.env.development` (copied from `.env.TEMPLATE`, which points at `https://dev.wger.de`; locally usually
  `http://localhost:8000`).
- `.mcp.json` configures the wger MCP server against `WGER_MCP_BASE_URL` (default `http://localhost:8000`).
- A local backend runs whatever server branch is checked out, so a 500 can be schema drift in its DB rather than a
  frontend bug. Check the server logs before changing frontend code.

## Layout

```
src/
├── components/<Domain>/  feature domains, named after the Django app in wger/server/wger/<app>/
├── components/Calendar/  cross-domain composition, not a domain (same for Dashboard/, Muscles/)
├── core/                 cross-cutting infrastructure, may be imported by every domain, never imports one
│   ├── ui/                 LoadingWidget, modals, tooltips, generic widgets
│   ├── forms/              useAppForm, WgerTextField, MarkdownEditor, form helpers
│   ├── lib/                pure utilities (date, numbers, strings, url, requests, colors)
│   ├── api/, queries/      shared response types and non-domain endpoints
├── app/layout/           shell (Header)
├── pages/                route entrypoints, thin wrappers around domain screens, no business logic
├── tests/                setup and cross-domain fixtures
├── locales/              symlink to public/locales so i18n.ts can import it
├── App.tsx, routes.tsx, theme.ts, i18n.ts, index.tsx
```

Domains: `Exercises`, `Routines` (Django `manager`), `Nutrition`, `Measurements` (also body weight), `Trophies`, `User`
(Django `core` — frontend `core/` is the infrastructure folder above, not that app). Each domain uses this skeleton,
leaving out what it doesn't need and never inventing other top-level names:

```
components/<Domain>/
├── api/       HTTP functions and response parsing, no React
├── queries/   React Query hooks on top of api/
├── models/    domain classes, types, yup schemas
├── screens/   full screens
├── widgets/   UI fragments inside the domain (forms often under widgets/forms/)
├── forms/     domain form components
├── helpers/   domain-only pure helpers
├── state/     domain-internal contexts/reducers
└── index.ts   public surface
```

- **Import boundary:** outside a domain, import only its root (`@/components/Exercises`), never a sub-path. ESLint
  (`no-restricted-imports`) fails on deep imports. Inside a domain use relative paths. `api/`, `core/lib`, `core/api`,
  `tests/` and test files are exempt — they sit below the barrels and would create cycles through them.
- **Dependency direction:** `Measurements` must not import `Nutrition` (enforced in `eslint.config.js`). Pass what's
  needed as a prop from the page that composes both.
- **Components use `queries/`, not `api/`.** Put new endpoints in `api/`, wrap them in a hook in `queries/`, export
  what other domains need from `index.ts`.
- **`core/` or domain?** Only promote to `core/` when two unrelated domains use it. When in doubt, keep it in the
  domain.
- **Types** live with the code that owns them, no central `types/` folder.
- **Naming:** domain and component folders PascalCase, code-module folders lowercase (`api/`, `queries/`), component
  files PascalCase, module files camelCase, tests next to the source as `<name>.test.ts(x)`.

## Stack-specific rules

- **MUI is v9.** Don't use v8 props (`<Grid item xs={6}>`, deprecated `Box` props). Use the v9 API
  (`<Grid size={{ xs: 6 }}>`). `@mui/x-data-grid` and `@mui/x-date-pickers` are v9 too; date pickers use
  `AdapterLuxon`, don't add dayjs or date-fns.
- **Test mocks:** mock the specific React Query hook module (e.g. `vi.mock('@/components/Nutrition/queries')`), not
  `vi.mock('axios')`. Blanket axios mocks have caused real network calls — they hide bugs and slow CI. The remaining
  axios mocks are legacy, don't copy them.
- **Test data:** reuse the fixtures in `src/tests/*TestData.ts` / `*Testdata.ts` (cross-domain) or next to the code
  (domain-local)
  instead of building new objects inline.
- **Don't test library behavior.** No tests that only show that MUI renders a prop, React Query caches or i18next
  translates; test our own components, hooks and helpers.
- **i18n:** any new user-visible string goes through `t()` / `<Trans>`. No hard-coded English/German in JSX. Add new
  keys only to `public/locales/en/translation.json` (`npm run i18n` extracts them); the other languages come from
  Weblate. If the flutter app already has the string (`../flutter/lib/l10n/app_*.arb`), use its English text
  byte-for-byte so Weblate can cross-suggest translations.
- **Dates:** everything is in the browser's local timezone. Use the helpers in `core/lib/date` (`dateToYYYYMMDD`,
  `yyyymmddToDate`, `isSameDay`, …) for calendar days, never `toISOString().slice(0, 10)`, which shifts the day.
  `core/lib/date.test.ts` re-runs under several `TZ` values in its own vitest project.
- **Shared types:** don't widen them or make optional fields required without a default — recurring scope-creep pattern.
- **No `any` in new code.** If a type is genuinely unknown, use `unknown` and narrow.
- **Forms:** TanStack Form via `useAppForm` from `core/forms/appForm`. `WeightForm` is the reference:
  `<form onSubmit={submitHandler(form)}>`, bound fields via
  `<form.AppField name="x">{field => <field.WgerTextField />}</form.AppField>`, error text for hand-wired inputs via
  `fieldError(field)`, the yup schema goes through `yupSchema()` into `validators.onChange` (it validates synchronously,
  yup's own adapter would be async and TanStack drops submits while validating), numeric inputs are `string` in the form
  values and cast in `onSubmit`, and query data is awaited in a wrapper component that mounts the form component once
  loaded (also the replacement for `enableReinitialize`: key it by the data). Array rows render from `form.Subscribe` on
  the array value, not from `mode="array"` fields, which only follow the length. Sub-components that need several form
  values take `values` and a setter as props (see `ChartSettingsFields`), not the form context, which is untyped in v1.
  Domain field components bind with `useFieldContext()` and render inside `<form.AppField>` without registration (see
  `ExerciseName`); errors the schema reports on nested paths like `aliases[0].alias` are read with
  `useNestedFieldError`. Server-side field errors go through `setServerError()`. Don't use `useStore`, `withForm`,
  field-level `defaultValue` or `defaultMeta`; they change or vanish in v2.
- **Create/edit forms:** the form owns the object it submits, the caller only passes an existing entity for edit (or
  nothing for create) — never a pre-built default. In the submit handler build a fresh instance:
  `Entity.clone(existing, { ...overrides })` for edit, `new Entity(...)` for add. Never mutate the passed-in prop — it
  usually is the object from the React Query cache. When editing needs the full related object (ingredient, weight
  unit), pass the object itself in the overrides, not just its id — `clone()` derives ids from objects. `RoutineForm`
  and `MealItemForm` are the reference; same rule as in the flutter repo.

## Code style

- Comments in English and short: one line where one does, comment only what the code can't express.

## Scope

Make the minimum change requested. Don't refactor adjacent code, rename things, or move helpers to a different scope
unless explicitly asked. If you spot something worth fixing nearby, mention it as a follow-up — don't just do it.
