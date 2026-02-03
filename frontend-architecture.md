# 🎨 Guide d'Architecture & Style de Code - Angular

Ce document définit les standards de développement pour le frontend du SaaS **TechMaint**. Il doit être respecté par Claude Code pour garantir la cohérence et la maintenabilité du projet.

---

## 🏗️ Structure du Projet (Core / Features / Shared)

L'application suit une structure modulaire stricte pour optimiser le lazy-loading et l'isolation des responsabilités.

```text
src/
├── app/
│   ├── core/           # Importé UNE SEULE fois dans l'AppModule
│   │   ├── auth/       # Guards, Interceptors, Services d'authentification
│   │   └── 
│   ├── features/       # Modules métiers (Structure calquée sur l'UI)
│   │   └── intervention/
│   │       ├── components/  # Composants Smart & Dumb
│   │       ├── models/      # Interfaces spécifiques à la feature
│   │       └── services/    # Services de données (API)
│   └── shared/         # Importé et utilisé à plusieurs endroits
│       ├── ui/         # UI Kit (Buttons, Cards, Modals)
│       ├── pipes/
│       └── directives/
├── environments/       # Configuration des variables d'environnement
│   ├── environment.ts        # Développement
│   └── environment.prod.ts   # Production


📏 Nomenclature & Style de Code
🚫 Suppression des Suffixes
Contrairement aux conventions Angular classiques, nous n'utilisons pas de suffixes dans le nom des classes ou des fichiers.

❌ Mauvais : ListClientComponent dans list-client.component.ts

✅ Bon : ListClient dans list-client.ts

✅ Bon : InterventionData (Service) dans intervention-data.ts

🔧 Linting
Le projet utilise ESLint pour garantir la qualité du code.

Commande : ng add angular-eslint


🧩 Architecture des Composants (Smart & Dumb)
Nous utilisons le pattern Smart-Container / Dumb-Presenter pour séparer la logique métier de l'affichage.

1. Smart Components (Containers)
Composants "cerveaux" responsables de la récupération et de la manipulation des données.

Responsabilités : Injecter les services, gérer les appels API, gérer le routing.

Contraintes :

Ne possède pas de input() ou output().

Pas de logique d'affichage complexe (HTML minimal).

Peut contenir d'autres composants Smart ou Dumb.

2. Dumb Components (Presenters)
Composants "visuels" purement dédiés à l'affichage et à l'interaction utilisateur.

Responsabilités : Afficher les données reçues, émettre des événements utilisateur.

Contraintes :

Aucune injection de service.

Communique uniquement via input() (données) et output() (événements).

Très faciles à tester et réutilisables.

Standards de Développement (Claude Code Instructions)
Signals : Utiliser les Angular Signals (signal, computed, effect) pour la gestion de l'état local et la réactivité.

Control Flow : Utiliser la nouvelle syntaxe @if, @for, @switch (Angular 17+).

Data Access : Les services dans features/ doivent retourner des Observable ou des Signal.

Styles: utilise les composants primng et tailwindcss