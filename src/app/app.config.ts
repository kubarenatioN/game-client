import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { interceptors } from '@core/interceptors';
import { APP_ENV } from '@core/tokens';
import { environment } from 'environments/environment';
import { routes } from './app.routes';

/**
 * TODO: learn & use withXsrfConfiguration()
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors(interceptors)),
    {
      provide: APP_ENV,
      useValue: environment,
    },
  ],
};
