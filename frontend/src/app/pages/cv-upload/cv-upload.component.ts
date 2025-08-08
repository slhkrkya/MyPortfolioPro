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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.file = input.files[0];
    }
  }

  uploadFile() {
    if (!this.file || !this.fileName) {
      alert('Lütfen belge adı ve dosya seçin.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.file);
    formData.append('fileName', this.fileName);

    this.http.post('http://localhost:5291/api/documents', formData).subscribe({
      next: () => {
        this.uploadSuccess = true;
        alert('Belge başarıyla yüklendi!');
        this.file = null;
        this.fileName = '';
      },
      error: () => {
        alert('Yükleme sırasında hata oluştu.');
      }
    });
  }
}
