import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-document-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-preview.component.html',
})
export class DocumentPreviewComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  loading = true;
  error = '';
  objectUrl: string | null = null;
  safeUrl: SafeResourceUrl | null = null;
  contentType = '';
  fileName = '';

  ngOnInit(): void {
  const id = Number(this.route.snapshot.paramMap.get('id'));

  // 3a) Adı/metadata’yı çek → ekranda gerçek isim görünsün
  this.http.get<{ fileName: string; contentType?: string; size?: number }>(
    `http://localhost:5291/api/documents/${id}`
  ).subscribe({
    next: (m) => {
      this.fileName = m.fileName ?? this.fileName;
      // İstersen contentType/size da kullan:
      if (m.contentType) this.contentType = m.contentType;
    }
  });

  // 3b) Blob indir → önizleme için
  this.http.get(`http://localhost:5291/api/documents/download/${id}`, {
    responseType: 'blob',
    observe: 'response'
  }).subscribe({
    next: (res) => {
      this.loading = false;

      const blob = res.body as Blob;

      // Header’dan isim (fallback)
      const disp = res.headers.get('content-disposition') || '';
      const m = /filename="?([^"]+)"?/i.exec(disp);
      if (!this.fileName && m?.[1]) this.fileName = m[1];

      if (!this.contentType) {
        this.contentType = res.headers.get('content-type') || blob.type || 'application/octet-stream';
      }

      this.objectUrl = URL.createObjectURL(blob);
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl);
    },
    error: () => { this.loading = false; this.error = 'Belge yüklenemedi.'; }
    });
  }

  ngOnDestroy(): void {
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
  }

  isPdf() {
    return this.contentType?.toLowerCase().includes('pdf') || this.fileName.toLowerCase().endsWith('.pdf');
  }

  isImage() {
    return /(png|jpg|jpeg|gif|webp)$/i.test(this.fileName);
  }
}