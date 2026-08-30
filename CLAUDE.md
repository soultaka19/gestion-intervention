# CLAUDE.md — TechMaint Frontend

## Project Identity
- **Product**: TechMaint — Micro-SaaS B2B for field service management (HVAC, maintenance)
- **Phase**: MVP — Build in Public, 7 iterations
- **Solo-builder**: Yes — prioritize delivery speed
- **Frontend URL**: https://ashy-ground-08b11190f.2.azurestaticapps.net
- **Demo account**: demo2@techmaint.com / Demo123!

## Stack
- **Framework**: Angular 21 — standalone components only, no NgModules
- **UI**: PrimeNG 21 + Tailwind CSS 4 + tailwindcss-primeui plugin
- **State**: Angular Signals — never BehaviorSubject for local state
- **HTTP**: `Api` service (`core/services/api.ts`) — never inject `HttpClient` directly
- **Real-time**: SignalR (`@microsoft/signalr`) via `core/services/signalr.ts`
- **Maps**: Leaflet (`leaflet` + `@types/leaflet`)
- **Charts**: Chart.js
- **Auth**: JWT Bearer — `authInterceptor` adds token automatically
- **Backend**: .NET 10 API at `environment.apiUrl` (see environments/)

## Architecture

### Folder Structure
```
src/app/
  core/           — auth, guards, interceptors, Api service, SignalR
  features/       — one folder per domain (client, equipment, intervention, planning, geolocation, technician)
  layout/         — Layout, Navbar, Sidebar components
  dashbord/       — Dashboard component (typo in folder name — keep it)
```

### Feature Structure (per domain)
```
features/xxx/
  models/xxx.ts           — interfaces + constants (no classes)
  services/xxx-data.ts    — XxxData service with Signals + Api calls
  components/
    xxx-list/xxx-list.ts  — container: loads data, handles dialogs
    xxx-table/xxx-table.ts — presentational: displays data, emits events
    xxx-form/xxx-form.ts  — reactive form for create/edit
    xxx-detail/xxx-detail.ts — detail page (route /home/xxx/:id)
  index.ts                — barrel export
```

### Routing
- All protected routes under `/home/` — guarded by `authGuard`
- Auth routes under `/auth/` — guarded by `guestGuard`
- All components lazy-loaded via `loadComponent`
- Routes: dashbord, clients, clients/:id, equipements, interventions, interventions/:id, planning, carte, techniciens

### State Management Pattern
Services use Angular Signals as readonly state:
```typescript
private itemsSignal = signal<Item[]>([]);
private loadingSignal = signal(false);
readonly items = this.itemsSignal.asReadonly();
readonly loading = this.loadingSignal.asReadonly();
```
Components access via `service.items()` — never subscribe to update UI.

## Code Rules
- **TypeScript**: strict mode, no `any`, interfaces over type aliases for objects
- **Components**: always `standalone: true`, use `inject()` not constructor injection
- **Guards**: functional (`authGuard`, `guestGuard`) — never class-based
- **Interceptors**: functional (`authInterceptor`) — never class-based
- **Services**: named `XxxData` for feature data services — not `XxxService`
- **Imports**: import specific PrimeNG modules (e.g., `ButtonModule`) — never barrel imports
- **Formatting**: Prettier — printWidth 100, singleQuote, angular parser for HTML
- **Templates**: inline in component file (`template: \`...\``) — no separate .html files

## Business Domain
- **Roles**: Admin, Planificateur, Technicien
- **Intervention workflow**: Pending(0) → Scheduled(1) → InProgress(2) → Completed(3) / Cancelled(4)
- **Multi-tenant**: OrganizationId on all backend entities — JWT contains org context
- **Technicians**: are `User` records with `Role = Technicien` (not a separate entity)

## Environment
- Dev: `environment.ts` → `https://localhost:7074/api`
- Prod: `environment.prod.ts` → `https://techmaint-api.azurewebsites.net/api`
- FileReplacements configured in `angular.json` — always build with `--configuration production` for prod

## Commands
```bash
npm start                    # dev server
ng build --configuration production  # prod build (deploys browser/ folder)
ng build --watch             # watch mode
```

## Deployment
- Azure Static Web Apps: `swa deploy dist/gestion-intervention/browser --deployment-token $TOKEN`
- Use Python `zipfile` module for zip creation (not PowerShell — backslash issues)
- Deploy `dist/gestion-intervention/browser`, not `dist/gestion-intervention`

## What Claude Must NOT Do
- Create NgModules or class-based guards/interceptors
- Use `HttpClient` directly — always use `Api` service
- Use `BehaviorSubject` or `Subject` for local component state — use `signal()`
- Add `constructor()` injection — use `inject()`
- Create separate `.html` template files — templates are inline
- Rename the `dashbord` folder (typo is intentional — already in routes/imports)
- Add abstractions not requested (base classes, generic repos, etc.)
- Write tests unless explicitly asked (test coverage is not a current priority)
- Refactor working code outside the scope of the requested change

## Priorities
1. It works → 2. It's secure → 3. It's readable → 4. It's optimized
- Never over-engineer before market validation
- Keep components focused: list = container, table = presentational, form = form
