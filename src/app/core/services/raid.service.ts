import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RaidService {
  private http = inject(HttpClient);

  constructor() {}

  get(id: number) {
    return this.http.get(`${environment.gameApiBasePath}/raids/${id}`);
  }

  complete(id: number) {
    return this.http.post(
      `${environment.gameApiBasePath}/raids/${id}/complete`,
      {}
    );
  }
}
