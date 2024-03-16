import { AsyncPipe, DecimalPipe, NgIf } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Signal,
  WritableSignal,
  computed,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Unit } from '@core/models';
import { UnitsService } from '@core/services';
import { Observable } from 'rxjs';
import {
  setupCountdown,
  setupProgress,
  setupTextTimer,
} from './unit-card.helper';
import { environment } from 'environments/environment';

interface UnitCard extends Unit {
  raidCountdown$?: Observable<number> | null;
  raidProgress$?: Observable<number> | null;
  raidTimer$?: Observable<string> | null;

  upgradeCountdown$?: Observable<number> | null;
  upgradeProgress$?: Observable<number> | null;
  upgradeTimer$?: Observable<string> | null;
}

@Component({
  selector: 'app-unit-card',
  standalone: true,
  imports: [AsyncPipe, NgIf, DecimalPipe, MatButtonModule],
  templateUrl: './unit-card.component.html',
  styleUrl: './unit-card.component.scss',
})
export class UnitCardComponent implements OnInit {
  private unit$!: WritableSignal<UnitCard>;

  @Input({ required: true }) set unit(val: Unit) {
    this.unit$ = signal(val);

    this.setupUnitState();
  }

  @Input() isLoading$: WritableSignal<boolean> = signal(false);

  @Output() sentToRaid = new EventEmitter<number>();
  @Output() raidReturned = new EventEmitter<number>();
  @Output() collected = new EventEmitter<number>();
  @Output() upgrade = new EventEmitter<number>();
  @Output() upgradeCompleted = new EventEmitter<number>();

  get unit(): UnitCard {
    return this.unit$();
  }

  canSendToRaid!: Signal<boolean>;
  canCollectLoot!: Signal<boolean>;
  canUpgrade!: Signal<boolean>;

  apiBaseUrl = environment.gameApiBasePath;

  constructor(private unitsService: UnitsService) {}

  ngOnInit(): void {}

  onSendToRaid(unitId: number) {
    if (this.unit.active_raid) {
      return;
    }

    this.sentToRaid.emit(unitId);
  }

  onCollectLoot(unit: Unit) {
    if (!unit.active_raid) {
      return;
    }

    this.collected.emit(unit.active_raid.id);
  }

  onUpgrade(id: number) {
    if (this.unit.active_upgrade) {
      return;
    }

    this.upgrade.emit(id);
  }

  private setupUnitState(): void {
    this.canSendToRaid = computed(() => {
      const { active_raid, exp, maxExp, active_upgrade, level } = this.unit$();
      return (
        active_raid == null &&
        exp < maxExp &&
        active_upgrade == null &&
        level < 10
      );
    });

    this.canCollectLoot = computed(() => {
      const { active_raid } = this.unit$();
      return active_raid?.status === 'returned';
    });

    this.canUpgrade = computed(() => {
      const { active_raid, active_upgrade } = this.unit$();
      return active_raid == null && active_upgrade == null;
    });

    const { active_raid, active_upgrade } = this.unit;
    if (active_raid?.status === 'in_progress') {
      const onComplete = () => {
        this.unit.raidCountdown$ = null;
        this.unit.raidProgress$ = null;
        this.unit.raidTimer$ = null;

        if (this.unit.active_raid) {
          this.raidReturned.emit(this.unit.id);
        }
      };

      const countdown$ = setupCountdown(active_raid, onComplete);

      this.unit.raidCountdown$ = countdown$;
      this.unit.raidProgress$ = setupProgress(active_raid, countdown$);
      this.unit.raidTimer$ = setupTextTimer(countdown$);
    }

    if (active_upgrade?.status === 'in_progress') {
      const onComplete = () => {
        this.unit.upgradeCountdown$ = null;
        this.unit.upgradeProgress$ = null;
        this.unit.upgradeTimer$ = null;

        if (this.unit.active_upgrade) {
          this.upgradeCompleted.emit(this.unit.id);
        }
      };

      const countdown$ = setupCountdown(active_upgrade, onComplete);

      this.unit.upgradeCountdown$ = countdown$;
      this.unit.upgradeProgress$ = setupProgress(active_upgrade, countdown$);
      this.unit.upgradeTimer$ = setupTextTimer(countdown$);
    }
  }
}
