import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ReplaySubject, catchError, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private sessionStore: any | null = null;
  private sessionStore$ = new ReplaySubject<any | null>(1);

  http = inject(HttpClient);

  get session$() {
    return this.sessionStore$;
  }

  set session(val: any | null) {
    this.sessionStore$.next(val);
    this.sessionStore = val;
  }

  get session() {
    return this.sessionStore;
  }

  constructor() {}

  getSession() {
    return this.http.get(`/v1/auth/self`).pipe(
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
}
