import { Component, HostListener, OnDestroy, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet, NavigationEnd } from '@angular/router';
import { ToastModule } from 'primeng/toast';

import { AuthService } from './shared/services/auth.service';
import { ThemeService } from './shared/services/theme.service';

import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

type ThemeMode = 'light' | 'dark' | 'system';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, ToastModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit, AfterViewInit, OnDestroy {
  title = 'frontend';

  // services
  private router = inject(Router);
  auth = inject(AuthService);
  theme = inject(ThemeService);

  // ui state
  mobileOpen = false;
  adminOpen = false;

  // teardown
  private destroy$ = new Subject<void>();

  // computed
  get currentYear() { return new Date().getFullYear(); }

  get currentTheme(): ThemeMode {
    return this.theme.current;
  }

  /** isDark: ThemeService 'system' ise OS tercihine bakar */
  get isDark(): boolean {
    if (this.currentTheme === 'system') {
      return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
    }
    return this.currentTheme === 'dark';
  }

  // lifecycle
  ngOnInit(): void {
    // route değişince admin menüsünü kapat
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => (this.adminOpen = false));

    // ilk state
    this.updateSkyShift();
  }

  ngAfterViewInit(): void {
    // İlk yüklemede scroll değişkenini yaz (arka plan başlangıcı doğru görünsün)
    this.onScroll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // keyboard: ESC ile menüleri kapat
  @HostListener('document:keydown.escape')
  onEsc() {
    this.adminOpen = false;
    this.mobileOpen = false;
  }

  private updateSkyShift() {
    const doc = document.documentElement;
    const body = document.body;
    const scrollTop = doc.scrollTop || body.scrollTop || 0;
    const scrollHeight = (doc.scrollHeight || body.scrollHeight || 1) - doc.clientHeight;
    const progress = Math.max(0, Math.min(1, scrollHeight ? scrollTop / scrollHeight : 0));
    doc.style.setProperty('--sky-shift', String(progress));
  }

  @HostListener('window:scroll')
  onScroll() {
    const doc = document.documentElement;
    const max = Math.max(1, (doc.scrollHeight - doc.clientHeight));
    const p = Math.min(1, Math.max(0, window.scrollY / max));
    doc.style.setProperty('--sky-shift', p.toFixed(3));
  }

  // actions
  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  isAdminActive(): boolean {
    return this.router.url.startsWith('/admin');
  }

  /** Tema değiştir: ThemeService'e devrediyoruz. */
  setTheme(mode: 'light' | 'dark') {
    this.theme.set(mode);
    requestAnimationFrame(() => this.onScroll());
  }

  toggleMobile() {
    this.mobileOpen = !this.mobileOpen;
  }
}
