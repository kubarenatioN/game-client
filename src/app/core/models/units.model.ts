import { Raid } from './raids.model';

export interface UnitModel {
  id: number;
  name: string;
}

export interface Unit {
  id: number;
  level: number;
  exp: number;
  maxExp: number;

  active_raid?: Raid | null;

  active_upgrade?: UnitUpgrade | null;

  // relations
  model?: UnitModel | null;
}

export type UnitUpgradeStatusType = 'in_progress' | 'completed';

export interface UnitUpgrade {
  id: number;
  endAt: string;
  status: UnitUpgradeStatusType;

  unit: Unit;
}
