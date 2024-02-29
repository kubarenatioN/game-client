import {
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { APP_ENV } from '@core/tokens';

export const apiInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  const env = inject(APP_ENV);
  const { gameApiBasePath, gameApiPrefix } = env;

  const url = `${gameApiBasePath}/${gameApiPrefix}${req.url}`;

  req = req.clone({
    url,
  });

  return next(req);
};

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  req = req.clone({
    withCredentials: true,
  });

  return next(req);
};

export const interceptors: HttpInterceptorFn[] = [
  apiInterceptor,
  authInterceptor,
];
