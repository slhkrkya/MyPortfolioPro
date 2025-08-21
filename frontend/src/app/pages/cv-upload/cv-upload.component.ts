import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cv-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cv-upload.component.html',
})
export class CvUploadComponent {
  private http = inject(HttpClient);

  fileName = '';
  file: File | null = null;
  uploadSuccess = false;
  loading = false;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.file = input.files[0];

      // İsim boşsa dosya adından otomatik doldur (uzantısız)
      if (!this.fileName) {
        const parts = this.file.name.split('.');
        parts.pop();
        this.fileName = parts.join('.') || this.file.name;
      }
    }
  }

  async uploadFile() {
    if (!this.file || !this.fileName.trim()) {
      alert('Lütfen belge adı ve dosya seçin.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.file);
    formData.append('fileName', this.fileName.trim());

    try {
      this.loading = true;

      // ÖNEMLİ: Sabit localhost yok. Relative endpoint.
      // Interceptor bunu /api/documents olarak tamamlayacak.
      await this.http.post('/documents', formData).toPromise();

      this.uploadSuccess = true;
      alert('Belge başarıyla yüklendi!');
      this.file = null;
      this.fileName = '';
    } catch (err) {
      alert('Yükleme sırasında hata oluştu.');
      this.uploadSuccess = false;
    } finally {
      this.loading = false;
    }
  }
}