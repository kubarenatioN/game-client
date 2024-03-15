import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Raid, Unit, UnitUpgrade } from '@core/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UnitsService {
  private http = inject(HttpClient);

  constructor() {}

  /**
   * Gets single unit by ID
   *
   * @param id unit ID
   */
  get(id: number) {
    return this.http.get<Unit>(`/v1/units/${id}`);
  }

  getAll(): Observable<Unit[]> {
    return this.http.get<Unit[]>(`/v1/units`);
  }

  // getAllRaids() {
  //   return this.http.get<any[]>(`/v1/units/raids`);
  // }

  sendToRaid(id: number) {
    return this.http.post<Unit>(`/v1/raids`, {
      unitId: id,
    });
  }

  upgrade(id: number) {
    return this.http.post<UnitUpgrade>(`/v1/units/${id}/upgrade`, {});
  }
}
