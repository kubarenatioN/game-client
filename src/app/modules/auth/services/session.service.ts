import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, ReplaySubject, catchError, of, tap } from 'rxjs';
import { User } from '../models';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private sessionStore: User | null = null;
  private sessionStore$ = new ReplaySubject<User | null>(1);

  http = inject(HttpClient);

  get session$(): Observable<User | null> {
    return this.sessionStore$;
  }

  set session(val: User | null) {
    this.sessionStore$.next(val);
    this.sessionStore = val;
  }

  get session(): User | null {
    return this.sessionStore;
  }

  constructor() {}

  getSession() {
    return this.http.get<User>(`/v1/auth/self`).pipe(
      catchError((err: HttpErrorResponse) => {
        /**
         * Handle session not found and set empty session
         */
        console.error(err);
        return of(null);
      }),
      tap((res) => {
        this.session = res;
      })
    );
  }

  patchSessionState(update: Omit<User, 'id' | 'login'>) {
    const oldSession = structuredClone(this.session);

    if (oldSession === null) {
      console.error('Nothing to patch');
      return;
    }

    this.session = {
      ...oldSession,
      ...update,
    };
  }

  disposeSession() {
    this.session = null;
  }
}
