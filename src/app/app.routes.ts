import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { authGuard, guestGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [
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
      { path: '', redirectTo: 'dashbord', pathMatch: 'full' }
    ]
  },

  // Default redirect
  { path: '', redirectTo: 'home/dashbord', pathMatch: 'full' },
  { path: '**', redirectTo: 'home/dashbord' }
];
