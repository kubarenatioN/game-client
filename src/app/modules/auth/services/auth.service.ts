import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { User, UserLoginModel, UserRegisterModel } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  http = inject(HttpClient);

  login(data: UserLoginModel) {
    return this.http.post<User>(`/v1/auth/login`, data);
  }

  register(data: UserRegisterModel) {
    return this.http.post<User>(`/v1/auth/register`, data);
  }
}
