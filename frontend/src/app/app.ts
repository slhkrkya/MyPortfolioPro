import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { AuthService } from './shared/services/auth.service';
import { ThemeService } from './shared/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, ToastModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  title = 'frontend';
  auth = inject(AuthService);
  private router = inject(Router);
  theme = inject(ThemeService);
  mobileOpen = false;

  logout() {
    this.auth.logout();          // token'ı temizle
    this.router.navigate(['/']); // ana sayfaya dön
  }

  isAdminActive(): boolean {
  return this.router.url.startsWith('/admin');
  }

  get isDark() { return this.theme.current === 'portfolio-dark'; }
}