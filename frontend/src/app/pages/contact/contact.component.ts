import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, NonNullableFormBuilder } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs/operators';
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
export class ContactComponent {
  private fb = inject(FormBuilder) as NonNullableFormBuilder;
  private api = inject(ContactService);
  private msg = inject(MessageService);

  loading = false;

  form = this.fb.group({
    name: this.fb.control('', { validators: [Validators.required, Validators.maxLength(100)] }),
    email: this.fb.control('', { validators: [Validators.required, Validators.email, Validators.maxLength(150)] }),
    phone: this.fb.control<string | null>(null, {
      validators: [
        Validators.maxLength(20),
        Validators.pattern(/^[0-9+() \-]{7,20}$/) // esnek ama kontrollü
      ]
    }),
    message: this.fb.control('', { validators: [Validators.required, Validators.minLength(10), Validators.maxLength(4000)] }),
    honeypot: this.fb.control<string | null>(null)
  });

  submit() {
    if (this.loading) return; // çift tıklama koruması
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.msg.add({ severity: 'warn', summary: 'Eksik bilgi', detail: 'Lütfen alanları kontrol edin.' });
      return;
    }

    // hijyen: kırp
    const raw = this.form.getRawValue();
    const payload: ContactPayload = {
      name: raw.name.trim(),
      email: raw.email.trim(),
      phone: raw.phone ? raw.phone.trim() : null,
      message: raw.message.trim(),
      honeypot: raw.honeypot ? raw.honeypot.trim() : null
    };

    // honeypot doluysa hiç istek atma (sessizce başarı ver)
    if (payload.honeypot) {
      this.msg.add({ severity: 'success', summary: 'Mesaj alındı', detail: 'Teşekkürler.' });
      this.form.reset();
      return;
    }

    this.loading = true;

    this.api.send(payload)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          // DB’siz akışta doğrulama yok — metni buna göre güncelledim
          this.msg.add({ severity: 'success', summary: 'Mesaj gönderildi', detail: 'En kısa sürede dönüş yapılacaktır.' });
          this.form.reset();
        },
        error: () => {
          this.msg.add({ severity: 'error', summary: 'Hata', detail: 'Gönderilemedi. Daha sonra yeniden deneyin.' });
        }
      });
  }
}