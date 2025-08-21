import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  // --- 1) URL mutasyonu: absolute değilse base + path'i düzgün birleştir ---
  let url = req.url;
  const isAbsolute = /^https?:\/\//i.test(url);

  if (!isAbsolute) {
    const base = (environment.apiBaseUrl || '').replace(/\/+$/, ''); // '/api' → '/api'
    const path = url.replace(/^\/+/, '');                            // '/siteprofile' → 'siteprofile'

    // join + normalize: // → / ve /api/api/ tekrarını tekille
    url = `${base}/${path}`
      .replace(/\/{2,}/g, '/')
      .replace(/\/api(?:\/api)+\//g, '/api/');

    req = req.clone({ url });
  }

  // --- 2) Sadece API çağrılarına token ekle ---
  // URL absolute ise path'i çıkar, değilse url zaten path.
  const pathPart = isAbsolute
    ? (url.match(/^[a-z]+:\/\/[^/]+(\/.*)$/i)?.[1] ?? '/')
    : url;

  const isApiCall =
    pathPart.startsWith('/api') ||
    (!!environment.apiBaseUrl && pathPart.startsWith(environment.apiBaseUrl));

  if (token && isApiCall) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req);
};