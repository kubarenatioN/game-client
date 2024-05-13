import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { APP_ENV } from '@core/tokens';
import { AuthService } from 'app/modules/auth/services';
import { BehaviorSubject, catchError, filter, switchMap, take } from 'rxjs';

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
  const token = localStorage.getItem('accessToken');
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
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
 * Listens for 401 http error response.
 */
export const unauthorizedInterceptor: () => HttpInterceptorFn = () => {
  let isRefreshing = false;
  const refreshTokenStore$ = new BehaviorSubject<string | null>(null);
  const blacklistUrls = [] as string[];
  let authService: AuthService;

  function handleUnauthorizedResponse(
    req: HttpRequest<any>,
    next: HttpHandlerFn
  ) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshTokenStore$.next(null);

      return authService.refresh().pipe(
        switchMap(({ accessToken }) => {
          isRefreshing = false;

          // console.log('new accessToken:', accessToken.slice(-10));
          localStorage.setItem('accessToken', accessToken);
          refreshTokenStore$.next(accessToken);

          req = addTokenToReq(req, accessToken);

          return next(req);
        }),
        catchError((err) => {
          isRefreshing = false;

          throw err;
        })
      );
    }

    return refreshTokenStore$.pipe(
      filter(Boolean),
      take(1),
      switchMap((token) => {
        console.log('refreshTokenStore');
        addTokenToReq(req, token);
        return next(req);
      })
    );
  }

  return (req: HttpRequest<any>, next: HttpHandlerFn) => {
    const accessToken = req.headers.get('authorization');
    authService = inject(AuthService);

    return next(req).pipe(
      catchError((err) => {
        if (err instanceof HttpErrorResponse) {
          if (
            err.status === 401 &&
            !blacklistUrls.some((url) => req.url.includes(url)) &&
            accessToken
          ) {
            return handleUnauthorizedResponse(req, next);
          }
        }
        throw err;
      })
    );
  };
};

function addTokenToReq(req: HttpRequest<any>, token: string): HttpRequest<any> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export const interceptors: HttpInterceptorFn[] = [
  apiInterceptor,
  authInterceptor,
  unauthorizedInterceptor(),
];
