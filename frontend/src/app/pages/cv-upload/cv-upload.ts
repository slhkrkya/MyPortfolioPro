import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-cv-upload',
  templateUrl: './cv-upload.html',
  styleUrls: ['./cv-upload.css'],
  imports: [CommonModule, HttpClientModule]
})
export class CvUploadComponent {
  selectedFile: File | null = null;

  constructor(private http: HttpClient) {}

  onFileSelected(event: any) {
    const fileList: FileList = event.target.files;
    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0];
    }
  }

  uploadFile() {
    if (!this.selectedFile) {
      alert('Lütfen bir dosya seçin');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post('http://localhost:5291/api/project/upload-cv', formData)
      .subscribe({
        next: () => alert('CV başarıyla yüklendi!'),
        error: () => alert('Yükleme sırasında hata oluştu.')
      });
  }
}
