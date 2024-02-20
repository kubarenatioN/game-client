import { Component, OnInit, inject } from '@angular/core';
import { UnitsService } from '@core/services';
import { differenceInSeconds } from 'date-fns';
import { BehaviorSubject, interval, of } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  shareReplay,
  startWith,
  tap,
} from 'rxjs/operators';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements OnInit {
  unitsService = inject(UnitsService);

  unitsProgress: any[] = [];

  units$ = new BehaviorSubject<any[]>([]);

  ngOnInit(): void {
    this.unitsService
      .getAll()
      .pipe(
        map((units) => {
          return units.map((unit) => {
            return {
              ...unit,
              countdown$: unit.raid_in_progress
                ? this.setupRaidCountdown(unit.id, unit.raid_in_progress)
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
          0,
          raid
        );
        updatedUnits[updUnitIndex].raid_in_progress = raid;
        this.units$.next(updatedUnits);
      },
    });
  }

  private setupRaidCountdown(unitId: number, raid: any) {
    const { startAt, endAt } = raid;
    const overallDiffSec = differenceInSeconds(endAt, startAt);
    const currentDiffSec = differenceInSeconds(endAt, new Date());
    console.log(overallDiffSec, currentDiffSec);
    if (currentDiffSec > 0) {
      return interval(100).pipe(
        map((res) => {
          const currentDiff = differenceInSeconds(endAt, new Date());
          const percents = currentDiff / overallDiffSec;

          return (1 - percents) * 100;
        }),
        distinctUntilChanged(),
        tap({
          next: (res) => {
            console.log('raid ' + raid.id, res);
          },
        }),
        startWith((1 - currentDiffSec / overallDiffSec) * 100)
      );
    }

    return of(null);
  }
}
