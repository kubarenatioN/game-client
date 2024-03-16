import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './components';
import { GameService } from './services/game.service';
import { UnitCardComponent } from './standalone/unit-card/unit-card.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
  },
];

@NgModule({
  declarations: [MainComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HttpClientModule,

    MatButtonModule,
    MatDialogModule,

    UnitCardComponent,
  ],
  providers: [GameService],
})
export class GameModule {}
