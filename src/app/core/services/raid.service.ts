import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { RaidCollectResponse } from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class RaidService {
  private http = inject(HttpClient);

  constructor() {}

  get(id: number) {
    return this.http.get(`/v1/raids/${id}`);
  }

  /**
   * Completes raid and collects loot
   *
   * @param raidId raid ID
   */
  complete(raidId: number) {
    return this.http.post<RaidCollectResponse>(
      `/v1/raids/${raidId}/complete`,
      {}
    );
  }
}
