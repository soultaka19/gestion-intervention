import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { authGuard, guestGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [
  // Demonstration publique : cree un bac a sable jetable et y entre
  // directement. Aucun garde : c'est justement le point d'entree de
  // quelqu'un qui n'a pas de compte.
  {
    path: 'demo',
    loadComponent: () => import('./features/demo/demo-entry').then(m => m.DemoEntry)
  },

  // Auth routes (public)
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register').then(m => m.Register)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // Protected routes
  {
    path: 'home',
    component: Layout,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashbord',
        loadComponent: () => import('./dashbord/dashbord').then(m => m.Dashbord)
      },
      {
        path: 'clients',
        loadComponent: () =>
          import('./features/client/components/client-list/client-list').then(m => m.ClientList)
      },
      {
        path: 'clients/:id',
        loadComponent: () =>
          import('./features/client/components/client-detail/client-detail').then(
            m => m.ClientDetail
          )
      },
      {
        path: 'equipements',
        loadComponent: () =>
          import('./features/equipment/components/equipment-list/equipment-list').then(
            m => m.EquipmentList
          )
      },
      {
        path: 'interventions',
        loadComponent: () =>
          import('./features/intervention/components/intervention-list/intervention-list').then(
            m => m.InterventionList
          )
      },
      {
        path: 'interventions/:id',
        loadComponent: () =>
          import('./features/intervention/components/intervention-detail/intervention-detail').then(
            m => m.InterventionDetail
          )
      },
      {
        path: 'planning',
        loadComponent: () =>
          import('./features/planning/components/planning-calendar/planning-calendar').then(
            m => m.PlanningCalendar
          )
      },
      {
        path: 'carte',
        loadComponent: () =>
          import('./features/geolocation/components/intervention-map/intervention-map').then(
            m => m.InterventionMap
          )
      },
      {
        path: 'techniciens',
        loadComponent: () =>
          import('./features/technician/components/technician-list/technician-list').then(
            m => m.TechnicianList
          )
      },
      { path: '', redirectTo: 'dashbord', pathMatch: 'full' }
    ]
  },

  // Default redirect
  { path: '', redirectTo: 'home/dashbord', pathMatch: 'full' },
  { path: '**', redirectTo: 'home/dashbord' }
];
