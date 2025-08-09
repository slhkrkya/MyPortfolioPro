import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
})
export class AdminLoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  error = '';

  submit() {
    // ⬇️ İMZA: username, password ayrı ayrı
    this.auth.login(this.username, this.password).subscribe({
      next: ({ token }) => {
        this.auth.setToken(token);

        const target = this.auth.getRedirectUrl() || '/admin/panel';
        this.auth.setRedirectUrl(null);

        this.router.navigateByUrl(target);
      },
      error: () => this.error = 'Giriş başarısız. Bilgileri kontrol edin.',
    });
  }
}