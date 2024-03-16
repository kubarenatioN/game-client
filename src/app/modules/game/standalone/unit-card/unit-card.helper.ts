import {
  differenceInMilliseconds,
  differenceInSeconds,
  secondsToHours,
  secondsToMinutes,
} from 'date-fns';
import { Observable, interval } from 'rxjs';
import { map, startWith, takeWhile } from 'rxjs/operators';

export function setupCountdown(
  { endAt }: { endAt: string },
  onComplete: () => void
) {
  const currentTime = Date.now();
  const initialDiff = differenceInSeconds(endAt, currentTime);

  return interval(1000).pipe(
    startWith(initialDiff),
    map((tick) => {
      const msDiff = differenceInMilliseconds(endAt, Date.now());

      return msDiff;
    }),
    takeWhile((msDiff) => {
      const isElapsedEndAt = msDiff < 0;

      if (isElapsedEndAt) {
        onComplete();
      }

      return !isElapsedEndAt;
    })
  );
}

export function setupProgress(
  { startAt, endAt }: { startAt: string; endAt: string },
  counter$: Observable<number>
) {
  return counter$.pipe(
    map((diff) => {
      const allTime = differenceInMilliseconds(endAt, startAt);
      const percents = diff <= 0 ? 100 : 100 - (diff / allTime) * 100;
      return percents;
    })
  );
}

export function setupTextTimer(counter$: Observable<number>) {
  return counter$.pipe(
    map((msDiff) => {
      /**
       * Seconds
       */
      const diff = msDiff / 1000;

      if (diff > 3600) {
        const hours = secondsToHours(diff);
        const minutes = Math.ceil(diff / 60 - hours * 60);

        return `${hours}h ${minutes}m`;
      } else if (diff > 60) {
        const minutes = secondsToMinutes(diff);
        const seconds = Math.ceil(diff - minutes * 60);

        return `${minutes}m ${seconds}s`;
      } else {
        return `${Math.ceil(diff)}s`;
      }
    })
  );
}
