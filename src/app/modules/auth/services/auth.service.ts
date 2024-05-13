import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  LoginResponse,
  RegisterResponse,
  UserLoginModel,
  UserRegisterModel,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  login(data: UserLoginModel) {
    return this.http.post<LoginResponse>(`/v1/auth/login`, data);
  }

  register(data: UserRegisterModel) {
    return this.http.post<RegisterResponse>(`/v1/auth/register`, data);
  }

  logout() {
    return this.http.get<unknown>(`/v1/auth/logout`);
  }

  refresh() {
    return this.http.get<{ accessToken: string }>(`/v1/token/refresh`);
  }
}
