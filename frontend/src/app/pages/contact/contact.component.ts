import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, NonNullableFormBuilder } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { interval, Subscription } from 'rxjs';
import { ContactService } from 'src/app/shared/services/contact.service';

type ContactPayload = {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  honeypot?: string | null;
};

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule],
  templateUrl: './contact.component.html',
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder) as NonNullableFormBuilder;
  private api = inject(ContactService);
  private msg = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  // === Rate limit ayarları ===
  private readonly COOLDOWN_MS = 60_000; // 1 dk
  private readonly STORAGE_KEY = 'contact.lastSentAt';

  private tickSub?: Subscription;

  loading = false;
  justSent = false;

  form = this.fb.group({
    name: this.fb.control('', { validators: [Validators.required, Validators.maxLength(100)] }),
    email: this.fb.control('', { validators: [Validators.required, Validators.email, Validators.maxLength(150)] }),
    phone: this.fb.control<string | null>(null, {
      validators: [Validators.maxLength(20), Validators.pattern(/^[0-9+() \-]{7,20}$/)]
    }),
    message: this.fb.control('', { validators: [Validators.required, Validators.minLength(10), Validators.maxLength(4000)] }),
    honeypot: this.fb.control<string | null>(null)
  });

  ngOnInit(): void {
    // geri sayımı canlı güncelle (OnPush)
    this.tickSub = interval(1000).subscribe(() => this.cdr.markForCheck());
  }
  ngOnDestroy(): void {
    this.tickSub?.unsubscribe();
  }

  /** Kalan bekleme süresi (ms). 0 ise bekleme yok. */
  private cooldownLeftMs(): number {
    const last = Number(localStorage.getItem(this.STORAGE_KEY) || '0');
    const left = this.COOLDOWN_MS - (Date.now() - last);
    return left > 0 ? left : 0;
  }
  /** Kalan bekleme (sn) – şablonda kullanılıyor */
  get cooldownLeftSec(): number {
    const ms = this.cooldownLeftMs();
    return ms > 0 ? Math.ceil(ms / 1000) : 0;
  }

  submit() {
    if (this.loading) return; // çift tıklama koruması

    // 1) Rate limit kontrolü (istemci tabanlı)
    if (this.cooldownLeftSec > 0) {
      this.msg.add({
        severity: 'warn',
        summary: 'Çok hızlısın 🙂',
        detail: `${this.cooldownLeftSec} saniye sonra tekrar deneyebilirsin.`
      });
      return;
    }

    // 2) Form doğrulama
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.msg.add({ severity: 'warn', summary: 'Eksik bilgi', detail: 'Lütfen alanları kontrol edin.' });
      return;
    }

    const raw = this.form.getRawValue();
    const payload: ContactPayload = {
      name: raw.name.trim(),
      email: raw.email.trim(),
      phone: raw.phone ? raw.phone.trim() : null,
      message: raw.message.trim(),
      honeypot: raw.honeypot ? raw.honeypot.trim() : null
    };

    // 3) Honeypot doluysa hiç istek atma (sessiz başarı)
    if (payload.honeypot) {
      this.msg.add({ severity: 'success', summary: 'Mesaj alındı', detail: 'Teşekkürler.' });
      this.form.reset();
      return;
    }

    // 4) Gönder
    this.loading = true;
    this.api.send(payload)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          // Başarılı gönderimde zaman damgasını yaz
          localStorage.setItem(this.STORAGE_KEY, String(Date.now()));

          this.msg.add({ severity: 'success', summary: 'Mesaj gönderildi', detail: 'En kısa sürede dönüş yapılacaktır.' });
          this.form.reset();

          // Üstte başarı bandını kısa süre göster
          this.justSent = true;
          this.cdr.markForCheck();
          setTimeout(() => {
            this.justSent = false;
            this.cdr.markForCheck();
          }, 6000);
        },
        error: () => {
          this.msg.add({ severity: 'error', summary: 'Hata', detail: 'Gönderilemedi. Daha sonra yeniden deneyin.' });
        }
      });
  }
}