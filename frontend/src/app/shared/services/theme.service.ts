import { Injectable } from '@angular/core';

type ThemeMode = 'light' | 'dark' | 'system';
const KEY = 'theme-mode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private mode: ThemeMode;

  constructor() {
    const saved = (localStorage.getItem(KEY) as ThemeMode) || 'system';
    this.mode = saved;
    this.apply(saved, false);

    // Sistem teması değişirse dinle
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.mode === 'system') this.apply('system', false);
    });
  }

  set(mode: ThemeMode) {
    this.mode = mode;
    localStorage.setItem(KEY, mode);
    this.apply(mode, true);
  }

  get current(): ThemeMode { return this.mode; }

  private apply(mode: ThemeMode, _animate: boolean) {
    const html = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = mode === 'dark' || (mode === 'system' && prefersDark);

    html.setAttribute('data-theme', isDark ? 'portfolio-dark' : 'portfolio-light');

    // (Opsiyonel) PrimeNG tema swap: index.html’de id’si 'primeng-theme' olan bir <link> varsa
    // const themeLink = document.getElementById('primeng-theme') as HTMLLinkElement | null;
    // if (themeLink) {
    //   themeLink.href = isDark
    //     ? 'assets/primeng-themes/aura-dark-noir.css'
    //     : 'assets/primeng-themes/aura-light-noir.css';
    // }
  }
}
