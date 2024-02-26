import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UnitsService {
  private http = inject(HttpClient);

  constructor() {}

  getAll() {
    return this.http.get<any[]>(`/v1/units`);
  }

  getAllRaids() {
    return this.http.get<any[]>(`/v1/units/raids`);
  }

  sendToRaid(id: number) {
    return this.http.post(`/v1/raids`, {
      unitId: id,
    });
  }
}
