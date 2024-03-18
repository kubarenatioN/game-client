import { User } from './user.models';

export interface UserLoginModel {
  login: string;
  password: string;
}

export interface UserRegisterModel {
  login: string;
  password: string;
}

export interface LoginResponse {
  session: string;
  user: User;
}

export interface RegisterResponse {
  session: string;
  user: User;
}
