// src/app/shared/services/theme.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
export type ThemeName = 'portfolio-light' | 'portfolio-dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private key = 'ui.theme';
  private _theme$ = new BehaviorSubject<ThemeName>('portfolio-light');
  theme$ = this._theme$.asObservable();

  constructor() {
    const saved = (localStorage.getItem(this.key) as ThemeName | null);
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const initial: ThemeName = saved ?? (prefersDark ? 'portfolio-dark' : 'portfolio-light');
    this.apply(initial);

    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        const stored = localStorage.getItem(this.key);
        if (!stored) this.apply(e.matches ? 'portfolio-dark' : 'portfolio-light');
      });
    } catch {}
  }

  get current(): ThemeName { return this._theme$.value; }
  set(theme: ThemeName) { this.apply(theme); localStorage.setItem(this.key, theme); }
  toggle() {
    this.set(this.current === 'portfolio-dark' ? 'portfolio-light' : 'portfolio-dark');
  }

  private apply(theme: ThemeName) {
    this._theme$.next(theme);
    document.documentElement.setAttribute('data-theme', theme); // << DaisyUI anahtar
  }
}