import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
})
export class AdminLoginComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  error = '';

  // yeni UI değişkenleri
  showPass = false;
  loading = false;
  remember = false;

  togglePass() {
    this.showPass = !this.showPass
  }

  ngOnInit(): void {
    // "Beni hatırla" için kayıtlı kullanıcı adını getir
    const remember = localStorage.getItem('login.remember') === '1';
    const savedUser = localStorage.getItem('login.username') || '';
    this.remember = remember;
    if (remember && savedUser) this.username = savedUser;
  }

  submit() {
    this.error = '';
    if (!this.username || !this.password) {
      this.error = 'Kullanıcı adı ve şifre zorunludur.';
      return;
    }

    this.loading = true;

    this.auth.login(this.username, this.password).subscribe({
      next: ({ token }) => {
        this.auth.setToken(token);

        // remember seçiliyse kullanıcı adını sakla
        if (this.remember) {
          localStorage.setItem('login.remember', '1');
          localStorage.setItem('login.username', this.username);
        } else {
          localStorage.removeItem('login.remember');
          localStorage.removeItem('login.username');
        }

        const target = this.auth.getRedirectUrl() || '/admin/panel';
        this.auth.setRedirectUrl(null);

        this.loading = false;
        this.router.navigateByUrl(target);
      },
      error: () => {
        this.loading = false;
        this.error = 'Giriş başarısız. Bilgileri kontrol edin.';
      },
    });
  }
}