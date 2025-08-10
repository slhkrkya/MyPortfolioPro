import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-document-preview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './document-preview.component.html',
})
export class DocumentPreviewComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);

  loading = true;
  error = '';
  objectUrl: string | null = null;
  safeUrl: SafeResourceUrl | null = null;
  contentType = '';
  fileName = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Geçersiz belge.';
      this.loading = false;
      return;
    }

    // 1) Metadata
    this.http.get<{ fileName: string; contentType?: string; size?: number }>(
      `${environment.apiBaseUrl}/api/documents/${id}`
    ).subscribe({
      next: (m) => {
        if (m?.fileName) this.fileName = m.fileName;
        if (m?.contentType) this.contentType = m.contentType;
      },
      error: () => { /* metadata opsiyonel */ }
    });

    // 2) Binary indir
    this.http.get(`${environment.apiBaseUrl}/api/documents/download/${id}`, {
      responseType: 'blob',
      observe: 'response'
    }).subscribe({
      next: (res) => {
        this.loading = false;
        const blob = res.body as Blob;

        // Dosya adı header’dan
        const disp = res.headers.get('content-disposition') || '';
        const m = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(disp);
        const headerName = decodeURIComponent((m?.[1] || m?.[2] || '')).trim();
        if (!this.fileName && headerName) this.fileName = headerName;

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

  back() { this.router.navigate(['/documents']); }

  isPdf() {
    return (this.contentType?.toLowerCase().includes('pdf'))
      || this.fileName.toLowerCase().endsWith('.pdf');
  }

  isImage() {
    return /(png|jpg|jpeg|gif|webp|bmp|svg)$/i.test(this.fileName);
  }

  openNewTab() {
    if (this.objectUrl) window.open(this.objectUrl, '_blank', 'noopener');
  }

  download() {
    if (!this.objectUrl) return;
    const a = document.createElement('a');
    a.href = this.objectUrl;
    a.download = this.fileName || 'download';
    a.click();
    a.remove();
  }
}
