import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { AuthService } from './shared/services/auth.service';

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

  logout() {
    this.auth.logout();          // token'ı temizle
    this.router.navigate(['/']); // ana sayfaya dön
  }
}