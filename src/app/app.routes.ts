import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/game/game.module').then(m => m.GameModule)
  }
];
