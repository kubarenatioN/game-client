import { Unit } from './units.model';

export type RaidStatus = 'in_progress' | 'returned' | 'completed' | 'stopped';

export interface Raid {
  id: number;

  status: RaidStatus;
  startAt: Date;
  endAt: Date;

  // relations
  unit?: Unit;
}

export interface RaidCollectResponse {
  id: number;
  goldBalance: number;

  unit: Unit;
}
