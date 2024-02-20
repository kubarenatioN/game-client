import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UnitsService {
  private http = inject(HttpClient);

  private readonly apiBasePath = environment.gameApiBasePath;

  constructor() {}

  getAll() {
    return this.http.get<any[]>(`${this.apiBasePath}/units`);
  }

  getAllRaids() {
    return this.http.get<any[]>(`${this.apiBasePath}/units/raids`);
  }

  sendToRaid(id: number) {
    return this.http.post(`${this.apiBasePath}/raids`, {
      unitId: id,
    });
  }
}
