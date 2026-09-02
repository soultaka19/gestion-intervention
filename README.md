# TechMaint

**Gestion d'interventions terrain pour plusieurs organisations sur une même instance, cloisonnées jusque dans les canaux temps réel.**

**Démonstration ouverte, sans inscription : [techmaint.soultaka.com/demo](https://techmaint.soultaka.com/demo)**

---

## Le problème

Une plateforme multi-locataire est facile à écrire et difficile à rendre étanche. Le filtrage par organisation se met naturellement dans les contrôleurs HTTP, où il est visible et testé. Il s'oublie partout ailleurs : dans les tâches de fond, dans les rapports, et surtout dans les canaux temps réel, où le contexte de la requête HTTP n'existe plus.

C'est le point sur lequel ce projet a été construit.

## L'isolation, et où elle est posée

**Au niveau du contexte de données, pas des contrôleurs.** Toute entité rattachée à une organisation implémente `ITenantEntity`, et le filtrage est appliqué globalement à la source. Un développeur qui ajoute une requête n'a pas à se souvenir d'ajouter la condition : il faudrait un effort délibéré pour la contourner.

**Jusque dans le temps réel.** Le suivi de position des techniciens passe par SignalR, où le contexte HTTP n'est pas transmis. Un `TenantHubFilter` résout l'organisation à la connexion et **refuse l'abonnement** plutôt que de filtrer la lecture : un client d'une autre organisation ne reçoit pas des messages vides, il ne s'abonne jamais.

**Un mode démonstration qui se nettoie tout seul.** Chaque visiteur de `/demo` obtient une organisation isolée, peuplée de données réalistes et détruite automatiquement par un service de nettoyage. C'est ce qui permet d'ouvrir la démonstration sans inscription et sans qu'un visiteur voie le travail d'un autre.

## Ce que couvre l'application

Clients, équipements, techniciens, interventions et rapports d'intervention, avec planification, géolocalisation des techniciens, optimisation d'itinéraires et tableau de bord.

## Architecture

Deux dépôts :

| | Dépôt | Rôle |
|---|---|---|
| **Front-end** | ce dépôt | Application Angular |
| **API** | [GestionInterventionApi](https://github.com/soultaka19/GestionInterventionApi) | API .NET, base de données, temps réel |

## Pile technique

**Front-end** — `Angular` · `TypeScript` · `PrimeNG` · `Tailwind CSS` · `RxJS` · `SignalR` (client) · `Leaflet` · `Chart.js`

**API** — `.NET` · `C#` · `Entity Framework Core` · `PostgreSQL` (`Npgsql`) · `SignalR` · `JWT` · `AutoMapper` · `FluentValidation` · `Serilog` · `OpenAPI / Scalar` · `Docker`

La base de données a été migrée de SQL Server vers PostgreSQL en cours de projet.

## Lancer en local

```bash
npm install
npm start
```

L'application démarre sur `http://localhost:4200` et attend l'API sur le port configuré dans `src/environments/`.

## Documentation

- **[documentation.md](documentation.md)** : le fonctionnel et les décisions de conception.
- **[frontend-architecture.md](frontend-architecture.md)** : la structure du front-end.
- **[Documentation-Api.md](Documentation-Api.md)** : les points d'entrée de l'API.

---

Souleymane Diallo · [soultaka.com](https://soultaka.com) · [linkedin.com/in/souleyman-dev](https://linkedin.com/in/souleyman-dev)
