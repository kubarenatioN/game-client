import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { UserAccount } from 'app/modules/auth/models';

@Injectable({
  providedIn: 'root',
})
export class RaidService {
  private http = inject(HttpClient);

  constructor() {}

  get(id: number) {
    return this.http.get(`/v1/raids/${id}`);
  }

  complete(id: number) {
    return this.http.post<UserAccount>(`/v1/raids/${id}/complete`, {});
  }
}
