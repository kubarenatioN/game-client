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

  getAll(): Observable<Unit[]> {
    return this.http.get<Unit[]>(`/v1/units`);
  }

  // getAllRaids() {
  //   return this.http.get<any[]>(`/v1/units/raids`);
  // }

  sendToRaid(id: number) {
    return this.http.post(`/v1/raids`, {
      unitId: id,
    });
  }
}
