import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdmin()) {
    return true;
  }

  // Admin değilse veya giriş yapmamışsa login'e yönlendir
  auth.setRedirectUrl(state.url);
  return router.parseUrl('/admin/login');
};