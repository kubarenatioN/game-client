import { InjectionToken } from '@angular/core';
import { environment } from 'environments/environment';

export const APP_ENV = new InjectionToken('Application core env variables', {
  factory: () => environment,
});
