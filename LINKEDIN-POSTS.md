# TechMaint - Posts LinkedIn (Build in Public)

---

## Jour 1 - Setup & Layout (Itération 0)

> A publier avec le post J1

---

## Jour 2 - Authentification (Itération 1)

Jour 2/7 - Build in Public : TechMaint

Aujourd'hui, j'ai mis en place l'authentification complète de TechMaint, mon application de gestion d'interventions techniques.

Ce qui a été fait :

Backend (.NET 10)
- Modèles SaaS : Organization & User avec architecture multi-tenant
- Authentification JWT : login, register, tokens sécurisés
- Validation des identifiants avec messages d'erreur clairs
- Endpoints : POST /api/auth/login & POST /api/auth/register

Frontend (Angular 21)
- Pages Login & Register avec formulaires réactifs
- Guards de route : redirection automatique si non connecté
- Interceptor HTTP pour injecter le token JWT dans chaque requête
- Gestion du state utilisateur avec un AuthService

Un bug intéressant en production : le frontend appelait encore localhost au lieu de l'API Azure. La cause ? Le fichier angular.json manquait la configuration fileReplacements pour le build de production. Un classique mais un bon rappel de toujours vérifier ses environnements.

Stack : Angular 21 + PrimeNG | .NET 10 + EF Core | Azure Static Web Apps + Azure Web App

L'app est live et fonctionnelle. Demain : le CRUD Clients.

#BuildInPublic #Angular #DotNet #JWT #Authentication #Azure #SaaS #GestionIntervention #TechMaint #DevJourney

### Captures suggérées (carrousel 5-6 slides)

1. **Page Login** - Capture de l'interface de connexion avec le formulaire (email + mot de passe)
2. **Page Register** - Capture du formulaire d'inscription
3. **Code Backend : AuthController.cs** - La méthode Login avec génération du token JWT (montrer le endpoint + la logique de validation)
4. **Code Backend :  Remplace la slide 4 (JwtService/Program.cs) par un split-screen ou une slide dédiée montrant
  ApplicationDbContext.cs (lignes 50-67) avec un titre comme "Isolation des données par organisation : chaque
  tenant ne voit que ses propres données". C'est le genre de capture qui attire l'attention des devs sur
  LinkedIn.
5. **Code Frontend : auth.interceptor.ts** - L'interceptor qui injecte le token dans les headers HTTP
6. **Test API live** - Capture de Scalar/Postman montrant un appel POST /api/auth/login avec la réponse 200 + token JWT
7. **(Bonus) Le bug fix** - Capture du diff angular.json montrant l'ajout de fileReplacements (storytelling)

---

## Jour 3 - Clients & Équipements (Itération 2)

Jour 3/7 - Build in Public : TechMaint

Aujourd'hui, le CRUD complet des clients et des équipements est en place. C'est le cœur métier de l'application.

Ce qui a été fait :

Backend (.NET 10)
- API REST Clients : 5 endpoints (CRUD + recherche multi-critères)
- API REST Équipements : 9 endpoints avec filtrage par client, type et recherche texte
- Géocodage automatique des adresses clients à la création/modification
- Requêtes prédictives : équipements en fin de garantie, maintenances en retard
- Endpoint PATCH pour mise à jour rapide de la date de dernière maintenance
- Types d'équipements HVAC : Chaudière, Radiateur, Climatisation, Pompe à chaleur, Chauffe-eau, Ventilation

Frontend (Angular 21)
- Liste clients avec recherche en temps réel (debounce 300ms)
- Tableau triable avec pagination configurable
- Modales pour création/édition sans quitter la page
- Page détail client avec sections organisées : contact, localisation, statistiques
- Liens cliquables (tel:, mailto:) pour les coordonnées
- Gestion d'état avec Angular Signals (signal-based architecture)

Le point technique intéressant : l'utilisation d'Angular Signals pour la gestion d'état dans le service ClientData. Fini les BehaviorSubjects et les subscriptions manuelles. Les signaux permettent un code plus lisible et des mises à jour réactives automatiques.

Stack : Angular 21 + PrimeNG | .NET 10 + EF Core | Azure Static Web Apps + Azure Web App

L'app est live. Demain : les équipements côté frontend.

#BuildInPublic #Angular #DotNet #CRUD #REST #Azure #SaaS #GestionIntervention #TechMaint #DevJourney

### Captures suggérées (carrousel 5-6 slides)

1. **Liste des clients** - Le tableau avec la barre de recherche et les actions (vue d'ensemble)
2. **Détail client** - La page détail avec le header gradient, les sections contact/localisation/statistiques
3. **Modale création** - Le formulaire de création de client dans la modale
4. **Code Backend : ClientsController.cs** - Les endpoints avec le géocodage automatique
5. **Code Frontend : client-data.ts** - Le service avec Angular Signals (signal, computed, effect)
6. **Test API live** - Capture de Scalar montrant GET /api/clients avec la réponse JSON

---

## Jour 4 - Equipements (Itération 3)

🔍 Build in Public — Phase 4 : Gestion des Équipements

Aujourd'hui, j'ai implémenté le CRUD complet des équipements HVAC dans TechMaint, mon application de gestion d'interventions techniques.

Ce qui a été fait :

Backend (.NET 10)
- API REST Équipements : 9 endpoints (CRUD + filtrage par client, type et recherche texte)
- 7 types d'équipements HVAC : Chaudière, Radiateur, Climatisation, Pompe à chaleur, Chauffe-eau, Ventilation, Autre
- Suivi de maintenance : date d'installation, dernière maintenance, fin de garantie
- Endpoints prédictifs : équipements en fin de garantie (30j), maintenances en retard (12 mois)
- PATCH dédié pour mise à jour rapide de la date de dernière maintenance

Frontend (Angular 21)
- Liste des équipements avec recherche en temps réel (marque, modèle, numéro de série)
- Filtrage par type d'équipement via dropdown
- Grille responsive 3 colonnes avec cartes détaillées
- Modales création/édition avec sélection du client et date pickers
- Indicateurs visuels : statut garantie et alertes maintenance

Le point technique intéressant : le endpoint GET /api/equipments/warranty-expiring qui identifie automatiquement les équipements dont la garantie expire dans les 30 prochains jours. Côté frontend, ces alertes sont affichées avec des badges colorés directement dans la liste. Un bon exemple de logique métier simple mais à forte valeur ajoutée pour l'utilisateur.

L'app est disponible sur : https://lnkd.in/eJ7Bn8PC
Demain : les interventions, le coeur métier de l'application.

Sur cette gestion d'équipements avec suivi de garantie et maintenance,
qu'est-ce que vous auriez fait différemment ?
Je suis preneur de vos retours / bonnes pratiques.

#BuildInPublic #Angular #DotNet #HVAC #REST #Azure #SaaS #GestionIntervention #TechMaint #DevJourney

### Captures suggérées (carrousel 5-6 slides)

1. **Liste des équipements** - La grille avec filtres type + recherche et les cartes équipements
2. **Modale création** - Le formulaire avec sélection client, type, dates
3. **Code Backend : EquipmentsController.cs** - Les endpoints avec warranty-expiring et maintenance-due
4. **Code Frontend : equipment-data.ts** - Le service avec Angular Signals
5. **Test API live** - Capture de Scalar montrant GET /api/equipments/warranty-expiring
6. **(Bonus) Alertes garantie** - Les badges colorés sur les équipements en fin de garantie

---

## Jour 5 - Interventions (Itération 4)

🔍 Build in Public — Phase 5 : Interventions, Planning & Carte

Le coeur métier de TechMaint est en place. Aujourd'hui, j'ai implémenté la gestion complète des interventions avec workflow, planning calendrier et visualisation cartographique.

Ce qui a été fait :

Backend (.NET 10)
- API Interventions : 13 endpoints incluant un workflow complet
- 5 statuts avec transitions : En attente → Planifiée → En cours → Terminée / Annulée
- 5 types : Maintenance, Réparation, Installation, Inspection, Urgence
- Assignation technicien avec planification (date + créneau horaire)
- Endpoint /planning avec filtrage par plage de dates et par technicien
- Rapport d'intervention structuré en JSON : checklist, pièces utilisées, mesures, recommandations
- API Techniciens : CRUD complet (les techniciens sont des Users avec Role = Technicien)

Frontend (Angular 21)
- Liste interventions avec filtrage par statut et actions contextuelles
- Workflow visuel : boutons dynamiques selon le statut (Assigner, Démarrer, Compléter, Annuler)
- Détail intervention en 3 colonnes : infos, équipement, planning/historique
- Planning calendrier double vue : Semaine (créneaux horaires) + Mois (grille)
- Carte Leaflet interactive : marqueurs clients (carrés gris) + interventions (cercles colorés par statut)
- Filtres carte : par statut, toggle clients/interventions, compteur de marqueurs
- Gestion des techniciens : liste, création, assignation aux interventions

Le point technique intéressant : le composant Planning utilise des computed signals Angular pour transformer les interventions en événements calendrier. Chaque changement de date ou de filtre technicien recalcule automatiquement la grille sans subscription manuelle. Le backend renvoie les interventions à plat et le frontend les projette en temps réel sur les créneaux horaires. Simple, performant, réactif.

L'app est disponible sur : https://lnkd.in/eJ7Bn8PC
Compte démo : demo2@techmaint.com / Demo123!

Sur cette architecture workflow + planning + cartographie,
qu'est-ce que vous auriez fait différemment ?
Je suis preneur de vos retours / bonnes pratiques.

#BuildInPublic #Angular #DotNet #Leaflet #Planning #Workflow #Azure #SaaS #GestionIntervention #TechMaint #DevJourney

### Captures suggérées (carrousel 6-7 slides)

1. **Liste interventions** - Le tableau avec les tags statut/type colorés et les actions
2. **Détail intervention** - La vue 3 colonnes avec infos client, équipement et planning
3. **Planning semaine** - La vue calendrier avec les créneaux horaires et les interventions colorées
4. **Carte interactive** - La carte Leaflet avec marqueurs clients + interventions autour de Gatineau/Ottawa
5. **Assignation technicien** - La modale d'assignation avec sélection technicien + date/heure
6. **Code Backend : InterventionsController.cs** - Le endpoint /assign avec validation du rôle Technicien
7. **(Bonus) Planning mois** - La vue mensuelle avec les événements par jour

---

## Jour 6 - Planning (Itération 5)

> A venir

---

## Jour 7 - Géolocalisation & Dashboard (Itération 6)

> A venir
