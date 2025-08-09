import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private api = 'http://localhost:5291/api/auth';

  private redirectUrl: string | null = null;

  login(username: string, password: string) {
    return this.http.post<{ token: string }>(`${this.api}/login`, { username, password });
  }

  setToken(t: string) { localStorage.setItem('token', t); }
  getToken() { return localStorage.getItem('token'); }

  logout() { localStorage.removeItem('token'); this.router.navigateByUrl('/'); }

  isLoggedIn() { return !!this.getToken(); }

  isAdmin(): boolean {
  const t = this.getToken();
  if (!t) return false;

  try {
    const payload = JSON.parse(atob(t.split('.')[1] || ''));

    // ASP.NET Core bazen rolü şu anahtarlarda taşır:
    const roleSingle =
      payload['role'] ||
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'];

    const rolesRaw =
      payload['roles'] ||
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'];

    // tek değer veya dizi olabilir → diziye çevir
    const roles: string[] = Array.isArray(rolesRaw)
      ? rolesRaw
      : [roleSingle].filter(Boolean);

    return roles.includes('Admin');
  } catch {
    return false;
  }
  }

  setRedirectUrl(url: string | null) { this.redirectUrl = url; }
  getRedirectUrl() { return this.redirectUrl; }
}
