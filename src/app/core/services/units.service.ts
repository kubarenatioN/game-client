import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Unit } from '@core/models';
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

  sendToRaid(id: number) {
    return this.http.post<Unit>(`/v1/raids`, {
      unitId: id,
    });
  }

  upgrade(id: number) {
    return this.http.post<Unit>(`/v1/units/${id}/upgrade`, {});
  }
}
