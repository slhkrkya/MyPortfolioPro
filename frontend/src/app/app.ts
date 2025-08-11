import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet, NavigationEnd } from '@angular/router';
import { ToastModule } from 'primeng/toast';

import { AuthService } from './shared/services/auth.service';
import { ThemeService } from './shared/services/theme.service';

import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

type ThemeMode = 'light' | 'dark';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, ToastModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit, OnDestroy {
  title = 'frontend';

  // services (inject API)
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
  get currentTheme(): ThemeMode { return this.theme['mode'] as ThemeMode; }
  get isDark(): boolean {
    // ThemeService 'dark' modunu baz alıyoruz (OS tercihini ayrıca kullanmıyoruz)
    return this.currentTheme === 'dark';
  }

  // lifecycle
  ngOnInit(): void {
    // route değişmelerinde admin menüsünü kapat
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => (this.adminOpen = false));
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

  // actions
  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  isAdminActive(): boolean {
    return this.router.url.startsWith('/admin');
  }

  setTheme(mode: ThemeMode) {
    this.theme.set(mode);
  }

  toggleMobile() {
    this.mobileOpen = !this.mobileOpen;
  }
}
