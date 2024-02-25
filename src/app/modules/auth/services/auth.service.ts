import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  http = inject(HttpClient);
  apiUrl = environment.gameApiBasePath;

  login(data: { login: string; password: string }) {
    return this.http.post(`${this.apiUrl}/auth/login`, data);
  }
}
