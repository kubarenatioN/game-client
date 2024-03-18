import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, ReplaySubject, catchError, of, tap } from 'rxjs';
import { User } from '../models';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private userStore: User | null = null;
  private userStore$ = new ReplaySubject<User | null>(1);

  private sessionStore: string | null = null;
  private sessionStore$ = new ReplaySubject<string | null>(1);

  http = inject(HttpClient);

  get session$(): Observable<string | null> {
    return this.sessionStore$;
  }

  set session(val: string | null) {
    this.sessionStore$.next(val);
    this.sessionStore = val;
    if (val && typeof val === 'string') {
      localStorage.setItem('sid', val);
    } else {
      localStorage.removeItem('sid');
    }
  }

  get session(): string | null {
    return this.sessionStore;
  }

  get user$(): Observable<User | null> {
    return this.userStore$;
  }

  set user(val: User | null) {
    this.userStore$.next(val);
    this.userStore = val;
  }

  get user(): User | null {
    return this.userStore;
  }

  constructor() {}

  loadUserSession() {
    return this.http.get<User>(`/v1/auth/self`).pipe(
      catchError((err: HttpErrorResponse) => {
        /**
         * Handle session not found and set empty session
         */
        console.error(err);
        return of(null);
      }),
      tap((res) => {
        if (res) {
          this.user = res;
        } else {
          this.disposeSession();
        }
      })
    );
  }

  patchUserState(update: Omit<User, 'id' | 'login'>) {
    const oldSession = structuredClone(this.user);

    if (oldSession === null) {
      console.error('Nothing to patch');
      return;
    }

    this.user = {
      ...oldSession,
      ...update,
    };
  }

  disposeSession() {
    this.user = null;
    this.session = null;
    localStorage.removeItem('sid');
  }
}
