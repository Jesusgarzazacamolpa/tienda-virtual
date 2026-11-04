import { Routes } from '@angular/router';

import { authGuard } from '@core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Iniciar sesión · Backoffice',
    loadComponent: () => import('@features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('@features/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'users'
      },
      {
        path: 'users',
        title: 'Usuarios · Backoffice',
        loadComponent: () => import('@features/users/user-list/user-list.component').then(m => m.UserListComponent)
      },
      {
        path: 'reports',
        title: 'Reportería · Backoffice',
        loadComponent: () =>
          import('@features/reports/report-list/report-list.component').then(m => m.ReportListComponent)
      },
      {
        path: 'forms',
        title: 'Formularios · Backoffice',
        loadComponent: () =>
          import('@features/forms/form-examples/form-examples.component').then(m => m.FormExamplesComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
