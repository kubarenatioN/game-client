import { Component, OnInit, inject } from '@angular/core';
import { Unit } from '@core/models';
import { RaidService, UnitsService } from '@core/services';
import { SessionService } from 'app/modules/auth/services';
import { differenceInMilliseconds, differenceInSeconds } from 'date-fns';
import { BehaviorSubject, Observable, interval, of } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  shareReplay,
  startWith,
  takeWhile,
} from 'rxjs/operators';

interface BoardUnit extends Unit {
  countdown$: Observable<number | null> | null;
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

  /**
   * TODO: Use signals
   */
  units$ = new BehaviorSubject<BoardUnit[]>([]);

  ngOnInit(): void {
    this.unitsService
      .getAll()
      .pipe(
        map((units) => {
          return units.map((unit) => {
            return {
              ...unit,
              countdown$:
                unit?.active_raid?.status === 'in_progress'
                  ? this.setupRaidCountdown(unit.id, unit.active_raid)
                  : of(null),
            };
          });
        }),
        shareReplay(1)
      )
      .subscribe({
        next: (res) => {
          this.units$.next(res);
        },
      });
  }

  onSendToRaid(id: number) {
    this.unitsService.sendToRaid(id).subscribe({
      next: (raid: any) => {
        const updatedUnits = this.units$.value.slice();
        const updUnitIndex = updatedUnits.findIndex((u) => u.id === id);
        updatedUnits[updUnitIndex].countdown$ = this.setupRaidCountdown(
          updatedUnits[updUnitIndex].id,
          raid
        );
        updatedUnits[updUnitIndex].active_raid = raid;
        this.units$.next(updatedUnits);
      },
    });
  }

  onComplete(unit: Unit) {
    const { active_raid } = unit;

    if (active_raid && active_raid.status === 'returned') {
      this.raidsService.complete(active_raid.id).subscribe({
        next: (res) => {
          const updatedUnits = this.units$.value.slice();
          const updUnitIndex = updatedUnits.findIndex((u) => u.id === unit.id);
          updatedUnits[updUnitIndex].countdown$ = null;
          updatedUnits[updUnitIndex].active_raid = null;
          this.units$.next(updatedUnits);

          this.sessionService.patchSessionState({
            account: {
              goldBalance: res.goldBalance,
            },
          });
        },
      });
    }
  }

  private setupRaidCountdown(
    unitId: number,
    raid: any
  ): Observable<number | null> {
    const { startAt, endAt } = raid;
    const overallDiffSec = differenceInSeconds(endAt, startAt);
    const currentDiffMs = differenceInMilliseconds(endAt, new Date());

    if (currentDiffMs > 0) {
      return interval(200).pipe(
        map((res) => {
          const diffInMilliseconds = differenceInMilliseconds(
            endAt,
            new Date()
          );
          const percents = diffInMilliseconds / (overallDiffSec * 1000);

          return (1 - percents) * 100;
        }),
        distinctUntilChanged(),
        startWith((1 - currentDiffMs / (overallDiffSec * 1000)) * 100),
        takeWhile((val) => {
          if (val >= 100) {
            this.getRaidReturned(unitId, raid.id);
            return false;
          }
          return true;
        }, true)
      );
    }

    return of(null);
  }

  private getRaidReturned(unitId: number, raidId: number) {
    this.getRaid(raidId).subscribe({
      next: (raid: any) => {
        const updatedUnits = this.units$.value.slice();
        const updUnitIndex = updatedUnits.findIndex((u) => u.id === unitId);
        updatedUnits[updUnitIndex].countdown$ = null;
        updatedUnits[updUnitIndex].active_raid = raid;
        this.units$.next(updatedUnits);
      },
    });
  }

  private getRaid(id: number) {
    return this.raidsService.get(id);
  }
}
