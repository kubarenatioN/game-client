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
import { setupRaidCountdown, setupRaidProgress } from './unit-card.helper';

interface UnitCard extends Unit {
  raidCountdown$?: Observable<number | null> | null;
  raidProgress$?: Observable<number | null> | null;
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

  get unit(): UnitCard {
    return this.unit$();
  }

  canSendToRaid!: Signal<boolean>;
  canCollectLoot!: Signal<boolean>;
  canUpgrade!: Signal<boolean>;

  constructor(private unitsService: UnitsService) {}

  ngOnInit(): void {
    this.setupUnitState();
  }

  onSendToRaid(unitId: number) {
    this.sentToRaid.emit(unitId);
  }

  onCollectLoot(unit: Unit) {
    if (!unit.active_raid) {
      return;
    }

    this.collected.emit(unit.active_raid.id);
  }

  onUpgrade(id: number) {
    this.unitsService.upgrade(id).subscribe({
      next: (res) => {
        console.log('after upgrade', res);
      },
    });
  }

  private setupUnitState(): void {
    this.canSendToRaid = computed(() => {
      const { active_raid, exp, maxExp, active_upgrade } = this.unit$();
      return active_raid == null && exp < maxExp && active_upgrade == null;
    });

    this.canCollectLoot = computed(() => {
      const { active_raid } = this.unit$();
      return active_raid?.status === 'returned';
    });

    const { active_raid } = this.unit;
    if (active_raid?.status === 'in_progress') {
      const countdown$ = setupRaidCountdown(active_raid, () => {
        this.unit.raidCountdown$ = null;
        this.unit.raidProgress$ = null;

        if (this.unit.active_raid) {
          this.raidReturned.emit(this.unit.id);
        }
      });

      this.unit.raidCountdown$ = countdown$;
      this.unit.raidProgress$ = setupRaidProgress(active_raid, countdown$);
    }
  }
}
