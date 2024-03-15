import { Raid } from '@core/models';
import { differenceInSeconds } from 'date-fns';
import { Observable, interval, of } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  startWith,
  takeWhile,
} from 'rxjs/operators';

export function setupRaidCountdown(raid: Raid, onComplete: () => void) {
  const { endAt } = raid;
  const currentTime = Date.now();
  const initialDiff = differenceInSeconds(endAt, currentTime);

  return interval(500).pipe(
    startWith(initialDiff),
    map(() => {
      const secondsDiff = differenceInSeconds(endAt, Date.now());

      return secondsDiff;
    }),
    takeWhile((secondsDiff) => {
      const isElapsedEndAt = secondsDiff < 0;

      if (isElapsedEndAt) {
        onComplete();
      }

      return !isElapsedEndAt;
    }, true),
    distinctUntilChanged()
  );
}

export function setupRaidProgress(
  raid: Raid,
  counter$: Observable<number | null>
) {
  const { startAt, endAt } = raid;

  return counter$.pipe(
    filter(Boolean),
    map((diff) => {
      const allTime = differenceInSeconds(endAt, startAt);
      const percents = 100 - (diff / allTime) * 100;
      return percents;
    })
  );
}

function setupRaidProgressCounter(
  unitId: number,
  raid: any
): Observable<number | null> {
  // const { startAt, endAt } = raid;
  // const overallDiffSec = differenceInSeconds(endAt, startAt);
  // const currentDiffMs = differenceInMilliseconds(endAt, new Date());
  // if (currentDiffMs > 0) {
  //   return interval(200).pipe(
  //     map((res) => {
  //       const diffInMilliseconds = differenceInMilliseconds(endAt, new Date());
  //       const percents = diffInMilliseconds / (overallDiffSec * 1000);
  //       return (1 - percents) * 100;
  //     }),
  //     distinctUntilChanged(),
  //     startWith((1 - currentDiffMs / (overallDiffSec * 1000)) * 100),
  //     takeWhile((val) => {
  //       if (val >= 100) {
  //         this.getRaidReturned(unitId, raid.id);
  //         return false;
  //       }
  //       return true;
  //     }, true)
  //   );
  // }
  return of(null);
}
