import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { APP_ENV } from '@core/tokens';
import { SessionService } from 'app/modules/auth/services';
import { environment } from 'environments/environment';
import { EMPTY, catchError } from 'rxjs';

export const apiInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  const env = inject(APP_ENV);
  const { gameApiBasePath, gameApiPrefix } = env;

  const isApiUrl = !req.url.startsWith('/assets');

  if (isApiUrl) {
    req = req.clone({
      url: `${gameApiBasePath}/${gameApiPrefix}${req.url}`,
    });
  }

  return next(req);
};

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  const token = localStorage.getItem('sid');
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: token,
      },
    });
  }

  /**
   * Cookie auth implementation. Stopped because of Safari & iOS support
   */
  // req = req.clone({
  //   withCredentials: true,
  // });

  return next(req);
};

/**
 * Listens for 401 http error response and unauthorizes current user with redirect to auth.
 */
export const unauthorizedInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401) {
          if (!environment.production) {
            console.warn('unauthorized. session was disposed');
          }

          sessionService.disposeSession();
          router.navigate(['/auth/login'], {
            replaceUrl: true,
          });

          return EMPTY;
        }
      }

      throw err;
    })
  );
};

export const interceptors: HttpInterceptorFn[] = [
  apiInterceptor,
  authInterceptor,
  unauthorizedInterceptor,
];
