import { inject } from '@angular/core';
import { Route, Router, Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: '',
    canMatch: [
      (route: Route) => {
        const router = inject(Router);
        const session = JSON.parse(localStorage.getItem('session') ?? 'null');
        if (session) {
          return true;
        }
        return router.parseUrl('/auth');
      },
    ],
    loadChildren: () =>
      import('./modules/game/game.module').then((m) => m.GameModule),
  },
];
