import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './shared/services/auth.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations'; // 👈
import { MessageService } from 'primeng/api'; 

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),        // PrimeNG Toast için gerekli
    MessageService,             // Toast servis
  ],
};
