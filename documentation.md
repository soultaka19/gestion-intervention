# TechMaint - Documentation Frontend Angular

## Informations generales

| Parametre | Valeur |
|-----------|--------|
| Framework | Angular 21.0.0 |
| Langage | TypeScript 5.9.2 |
| UI Components | PrimeNG 21.0.2 |
| CSS | Tailwind CSS 4.1.12 |
| Cartes | Leaflet 1.9.4 |
| Graphiques | Chart.js 4.5.1 |
| Tests | Vitest 4.0.8 |
| Etat | Angular Signals |

## URLs de deploiement

| Environnement | URL |
|---------------|-----|
| Production (Azure Static Web Apps) | https://ashy-ground-08b11190f.2.azurestaticapps.net |
| API Backend | https://techmaint-api.azurewebsites.net |
| Documentation API (Scalar) | https://techmaint-api.azurewebsites.net/scalar/v1 |

## Environnements

### Developpement (`src/environments/environment.ts`)

```typescript
{
  production: false,
  apiUrl: 'https://localhost:7074/api'
}
```

### Production (`src/environments/environment.prod.ts`)

```typescript
{
  production: true,
  apiUrl: 'https://techmaint-api.azurewebsites.net/api'
}
```

Le fichier `angular.json` utilise `fileReplacements` pour substituer `environment.ts` par `environment.prod.ts` lors du build production.

## Architecture du projet

```
src/
├── app/
│   ├── core/                              # Services partages, guards, intercepteurs
│   │   ├── auth/
│   │   │   ├── models/auth.models.ts      # LoginDto, RegisterDto, UserDto, AuthResponse
│   │   │   ├── services/auth.ts           # Authentification (login, register, logout)
│   │   │   ├── guards/auth.guard.ts       # authGuard, guestGuard
│   │   │   └── interceptors/auth.interceptor.ts  # JWT Bearer token
│   │   └── services/api.ts               # Client HTTP centralise
│   │
│   ├── layout/                            # Structure principale
│   │   ├── layout.ts                      # Layout flex (sidebar + contenu)
│   │   ├── navbar/navbar.ts               # Barre de navigation superieure
│   │   └── sidebar/                       # Sidebar responsive
│   │       ├── sidebar.ts
│   │       ├── sidebar-header.ts
│   │       ├── sidebar-menu.ts
│   │       └── sidebar-user.ts
│   │
│   ├── dashbord/dashbord.ts               # Tableau de bord avec stats et graphiques
│   │
│   ├── features/                          # Modules fonctionnels (lazy-loaded)
│   │   ├── auth/                          # Authentification
│   │   ├── client/                        # Gestion des clients
│   │   ├── equipment/                     # Gestion des equipements
│   │   ├── intervention/                  # Gestion des interventions
│   │   ├── technician/                    # Gestion des techniciens
│   │   ├── planning/                      # Calendrier de planification
│   │   └── geolocation/                   # Carte des interventions
│   │
│   ├── app.ts                             # Composant racine
│   ├── app.config.ts                      # Configuration Angular
│   └── app.routes.ts                      # Routage
│
├── styles/
│   └── tailwind.css                       # Theme Tailwind personnalise
├── styles.css                             # Imports globaux
└── environments/                          # Fichiers d'environnement
```

## Modules fonctionnels

### Authentification (`features/auth/`)

| Composant | Description |
|-----------|-------------|
| `Login` | Formulaire de connexion (email + mot de passe) |
| `Register` | Inscription avec creation d'organisation |

**Service `Auth`** : gestion du token JWT, stockage en localStorage (`auth_token`, `auth_user`), signaux `currentUser`, `isAuthenticated`, `userRole`.

**Guards** :
- `authGuard` : protege les routes `/home/*`, redirige vers `/auth/login`
- `guestGuard` : protege les routes `/auth/*`, redirige vers `/home/dashbord`

**Intercepteur** : ajoute le header `Authorization: Bearer <token>`, deconnexion automatique sur 401.

### Clients (`features/client/`)

| Composant | Type | Description |
|-----------|------|-------------|
| `ClientList` | Smart | Liste avec recherche, creation, modification, suppression |
| `ClientDetail` | Smart | Vue detaillee avec equipements et interventions du client |
| `ClientForm` | Dumb | Formulaire reactif (creation/edition) |
| `ClientTable` | Dumb | Tableau avec colonnes : nom, adresse, ville, telephone, email |

**Modele `Client`** : id, name, address, city, postalCode, phone, email, latitude, longitude, notes, equipmentCount.

**Service `ClientData`** : CRUD complet, signaux `clients`, `loading`, `selectedClient`.

### Equipements (`features/equipment/`)

| Composant | Type | Description |
|-----------|------|-------------|
| `EquipmentList` | Smart | Liste avec filtres par type et client |
| `EquipmentForm` | Dumb | Formulaire avec types d'equipement |
| `EquipmentTable` | Dumb | Tableau avec colonnes : nom, type, marque, modele, client |

**Types d'equipement** : Chaudiere, Radiateur, Climatisation, Pompe a chaleur, Chauffe-eau, Ventilation, Autre.

**Service `EquipmentData`** : CRUD + filtres par clientId, type et recherche.

### Interventions (`features/intervention/`)

| Composant | Type | Description |
|-----------|------|-------------|
| `InterventionList` | Smart | Liste avec filtre par statut, dialogs creation/edition/assignation |
| `InterventionDetail` | Smart | Vue detaillee avec workflow complet |
| `InterventionForm` | Dumb | Formulaire (client, equipement, type, description) |
| `InterventionTable` | Dumb | Tableau avec statut, type, client, technicien, date |
| `InterventionAssign` | Dumb | Formulaire d'assignation (technicien, date, horaires) |
| `InterventionComplete` | Dumb | Formulaire de completion (notes technicien) |

**Statuts** :

| Valeur | Label | Couleur |
|--------|-------|---------|
| 0 | En attente | Orange |
| 1 | Planifiee | Bleu |
| 2 | En cours | Violet |
| 3 | Terminee | Vert |
| 4 | Annulee | Rouge |

**Types** : Maintenance, Reparation, Installation, Inspection, Urgence.

**Service `InterventionData`** : CRUD + `assign()`, `start()`, `complete()`, `cancel()`, `getPlanning()`, `getMyInterventions()`.

### Techniciens (`features/technician/`)

| Composant | Type | Description |
|-----------|------|-------------|
| `TechnicianList` | Smart | Liste avec creation, edition, suppression |
| `TechnicianForm` | Dumb | Formulaire (nom, prenom, email, mot de passe) |
| `TechnicianTable` | Dumb | Tableau avec colonnes : nom, email, statut |

**Modele `Technician`** : id, email, firstName, lastName, role, isActive.

Les techniciens sont stockes dans la table `User` avec le role `Technicien` et peuvent se connecter a l'application.

### Planning (`features/planning/`)

| Composant | Type | Description |
|-----------|------|-------------|
| `PlanningCalendar` | Smart | Calendrier semaine/mois avec filtre par technicien |

**Fonctionnalites** :
- Vue semaine : grille horaire 7h-18h avec evenements positionnes par heure
- Vue mois : grille mensuelle avec evenements empiles
- Navigation : precedent/suivant, bouton "Aujourd'hui"
- Filtre par technicien (extrait des interventions chargees)
- Evenements : affichent client, horaire et statut
- Dialog de detail avec lien vers la fiche intervention
- Legende par couleur de statut

**Modeles** : `CalendarEvent`, `CalendarIntervention`, `WeekDay`, `TimeSlot`.

### Geolocalisation (`features/geolocation/`)

| Composant | Type | Description |
|-----------|------|-------------|
| `InterventionMap` | Smart | Carte Leaflet avec marqueurs clients et interventions |

**Fonctionnalites** :
- Marqueurs clients (bleu) et interventions (couleur par statut)
- Filtres par statut d'intervention
- Popups avec details et lien vers la fiche
- Centre par defaut : France (46.603354, 1.888334)

### Tableau de bord (`dashbord/`)

**Fonctionnalites** :
- 4 cartes statistiques : total clients, interventions en attente, en cours, terminees
- Graphique doughnut (Chart.js) : repartition des interventions par statut
- Tableau des 5 dernieres interventions
- Boutons d'actions rapides : nouvelle intervention, nouveau client, planning

## Routage

```
/auth
├── /login                    (public - guestGuard)
└── /register                 (public - guestGuard)

/home                         (protege - authGuard, Layout)
├── /dashbord                 (tableau de bord)
├── /clients                  (liste clients)
├── /clients/:id              (detail client)
├── /equipements              (liste equipements)
├── /interventions            (liste interventions)
├── /interventions/:id        (detail intervention)
├── /planning                 (calendrier)
├── /carte                    (carte geolocalisation)
└── /techniciens              (liste techniciens)

/                             → redirige vers /home/dashbord
/**                           → redirige vers /home/dashbord
```

Tous les composants de features sont charges en lazy-loading via `loadComponent()`.

## Patterns et conventions

### Architecture des composants

- **Smart components** (List, Detail) : injectent les services, gerent l'etat et les appels API
- **Dumb components** (Form, Table) : recoivent des donnees via `input()`, emettent des evenements via `output()`
- **Standalone components** : pas de NgModules, imports declares dans `@Component`
- **Convention de nommage** : pas de suffixe (ex: `ClientList` et non `ClientListComponent`)

### Gestion d'etat

- **Angular Signals** : `signal()`, `computed()`, `effect()` pour la reactivite
- **Services avec signaux** : chaque service expose des signaux en lecture seule (`asReadonly()`)
- **RxJS** : utilise pour les appels HTTP (`Observable`), transforme en signaux dans les services

### Formulaires

- **Reactive Forms** : `FormBuilder`, `FormGroup`, `Validators`
- **Dialogs PrimeNG** : formulaires affiches dans des `p-dialog` modaux
- **Validation** : messages d'erreur affiches conditionnellement avec `@if`

### Theming

- **PrimeNG Aura** : theme par defaut via `@primeuix/themes`
- **Tailwind CSS v4** : palette personnalisee (indigo, violet, rose) en espace colorimetrique oklch
- **Animations** : fadeIn, slideUp, slideDown, slideInRight
- **Classes de statut** : `.status-pending`, `.status-in-progress`, `.status-completed`, `.status-cancelled`

## Deploiement

### Prerequis

- Node.js et npm
- Azure CLI (`az login`)
- Azure SWA CLI (`npm install -g @azure/static-web-apps-cli`)

### Commandes

```bash
# 1. Installer les dependances
npm install

# 2. Build production
ng build --configuration production

# 3. Recuperer le token de deploiement
az staticwebapp secrets list --name techmaint-app --query "properties.apiKey" --output tsv

# 4. Deployer sur Azure Static Web Apps
swa deploy dist/gestion-intervention/browser --deployment-token <TOKEN> --env production
```

### Configuration Azure Static Web Apps

Le fichier `staticwebapp.config.json` est place dans le dossier de build pour gerer le routage SPA :

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/_framework/*", "/css/*", "/js/*", "/api/*", "*.{css,js,json,ico,png,jpg,svg,woff,woff2}"]
  }
}
```

### Ressources Azure

| Ressource | Nom | Region | Tier |
|-----------|-----|--------|------|
| Static Web App | `techmaint-app` | East US 2 | Free |

## Developpement local

```bash
# Installer les dependances
npm install

# Lancer le serveur de developpement
ng serve

# L'application est accessible sur http://localhost:4200
# L'API doit tourner sur https://localhost:7074
```
