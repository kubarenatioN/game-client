import {
  Component,
  OnInit,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import { Unit } from '@core/models';
import { RaidService, UnitsService } from '@core/services';
import { SessionService } from 'app/modules/auth/services';
import { map, switchMap } from 'rxjs';

interface BoardUnit extends Unit {
  isLoading$: WritableSignal<boolean>;
}

class BoardUnit {
  constructor(data: Unit) {
    this.isLoading$ = signal(false);

    Object.assign(this, data);
  }
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements OnInit {
  unitsService = inject(UnitsService);
  raidsService = inject(RaidService);
  sessionService = inject(SessionService);

  units$ = signal<BoardUnit[]>([]);

  get units(): BoardUnit[] {
    return this.units$();
  }

  ngOnInit(): void {
    this.unitsService
      .getAll()
      .pipe(
        map((units) => {
          return units.map((u) => {
            return new BoardUnit(u);
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.units$.set(res);
        },
      });
  }

  onSendToRaid(unitId: number) {
    const unit = this.units.find((u) => u.id === unitId);
    unit?.isLoading$.set(true);

    this.unitsService.sendToRaid(unitId).subscribe({
      next: (res) => {
        const { active_raid } = res;
        if (!active_raid) {
          throw new Error('No new raid found');
        }

        const changedUnitIndex = this.units.findIndex((u) => u.id === res.id);
        const unitToUpdate = {
          ...this.units[changedUnitIndex],
          active_raid: res.active_raid,
        };

        this.units[changedUnitIndex] = unitToUpdate;

        this.units$.set([...this.units]);
      },
    });
  }

  onRaidReturned(unitId: number): void {
    const index = this.units.findIndex((u) => u.id === unitId);

    this.unitsService
      .get(unitId)
      .pipe(map((u) => new BoardUnit(u)))
      .subscribe({
        next: (res) => {
          this.units[index] = res;
          this.units$.set([...this.units]);
        },
      });
  }

  onCollectRaidLoot(raidId: number) {
    this.raidsService.complete(raidId).subscribe({
      next: (res) => {
        const changedUnitIndex = this.units.findIndex(
          (u) => u.id === res.unit.id
        );

        this.units[changedUnitIndex] = new BoardUnit(res.unit);

        this.units$.set(this.units);
        this.sessionService.patchSessionState({
          account: {
            goldBalance: res.goldBalance,
          },
        });
      },
    });
  }

  onUpgrade(unitId: number) {
    const unit = this.units.find((u) => u.id === unitId);
    unit?.isLoading$.set(true);

    this.unitsService
      .upgrade(unitId)
      .pipe(
        switchMap((res) => {
          return this.unitsService.get(unitId);
        })
      )
      .subscribe({
        next: (res) => {
          const index = this.units.findIndex((u) => u.id === res.id);
          this.units[index] = new BoardUnit(res);

          this.units$.set([...this.units]);
        },
      });
  }

  onUpgradeCompleted(unitId: number): void {
    this.unitsService.get(unitId).subscribe({
      next: (res) => {
        const index = this.units.findIndex((u) => u.id === res.id);
        this.units[index] = new BoardUnit(res);

        this.units$.set([...this.units]);
      },
    });
  }
}
