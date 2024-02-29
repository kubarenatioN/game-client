import { inject } from '@angular/core';
import { Route, Router, Routes } from '@angular/router';
import { map } from 'rxjs';
import { SessionService } from './modules/auth/services';

export const routes: Routes = [
  {
    path: 'auth',
    canMatch: [
      (route: Route) => {
        const router = inject(Router);
        const sessionService = inject(SessionService);
        return sessionService.session$.pipe(
          map((session) => {
            if (session) {
              return router.parseUrl('/');
            }
            return true;
          })
        );
      },
    ],
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: '',
    canMatch: [
      (route: Route) => {
        const router = inject(Router);
        const sessionService = inject(SessionService);
        return sessionService.session$.pipe(
          map((session) => {
            if (!session) {
              return router.parseUrl('/auth');
            }
            return true;
          })
        );
      },
    ],
    pathMatch: 'full',
    loadChildren: () =>
      import('./modules/game/game.module').then((m) => m.GameModule),
  },
];
