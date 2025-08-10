import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

import { DocumentService } from 'src/app/shared/services/document.service';
import { Document } from 'src/app/shared/models/document.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { environment } from 'src/environments/environment';

type DocCategory = 'cv' | 'sertifika' | 'referans' | 'rapor';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, ToastModule, ProgressSpinnerModule, RouterModule],
  templateUrl: './document-list.component.html',
})
export class DocumentListComponent implements OnInit, OnDestroy {
  private documentService = inject(DocumentService);
  private msg = inject(MessageService);
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  auth = inject(AuthService);

  documents: (Document & { category: DocCategory })[] = [];
  loading = false;

  apiBase = environment.apiBaseUrl;

  // Önizleme cache: id -> { raw, type, safeRes, safeUrl }
  previewCache = new Map<number, { raw: string; type: string; safeRes: SafeResourceUrl; safeUrl: SafeUrl }>();
  // Yüklenme durumları: aynı anda birden fazla belge "yükleniyor…" gösterebilsin
  previewLoading = new Set<number>();

  // 4 satırlık kategori listesi
  categories: { key: DocCategory; label: string }[] = [
    { key: 'cv',        label: 'CV' },
    { key: 'sertifika', label: 'Sertifikalar' },
    { key: 'referans',  label: 'Referanslar' },
    { key: 'rapor',     label: 'Raporlar' },
  ];

  ngOnInit() { this.load(); }

  ngOnDestroy(): void {
    for (const { raw } of this.previewCache.values()) {
      try { URL.revokeObjectURL(raw); } catch {}
    }
    this.previewCache.clear();
  }

  load(): void {
    this.loading = true;
    this.documentService.getAll().subscribe({
      next: (data) => {
        this.documents = data.map(d => ({ ...d, category: this.guessCategory(d) }));
        // Sayfa açılır açılmaz önizlemeleri arka planda indir (eşzamanlılık limiti: 4)
        this.preloadAll(4).catch(() => {});
      },
      error: () => this.msg.add({ severity: 'error', summary: 'Hata', detail: 'Belgeler yüklenemedi.' }),
      complete: () => (this.loading = false),
    });
  }

  /** Her kategori satırı için filtre */
  docsBy(cat: DocCategory) {
    return this.documents.filter(d => d.category === cat);
  }

  /** İsim/uzantıya göre kategori tahmini */
  guessCategory(d: Document): DocCategory {
    const name = (d.fileName || '').toLowerCase();
    const ex = (name.split('.').pop() || '').toLowerCase();

    if (name.includes('cv') || name.includes('resume')) return 'cv';
    if (name.includes('sertifika') || name.includes('certificate')) return 'sertifika';
    if (name.includes('referans') || name.includes('reference') || name.includes('mektup')) return 'referans';
    if (name.includes('rapor') || name.includes('report')) return 'rapor';

    if (['doc','docx','rtf','odt'].includes(ex) && name.includes('cv')) return 'cv';
    if (['pdf'].includes(ex) && name.includes('sert')) return 'sertifika';

    // default: rapor
    return 'rapor';
  }

  /** Tüm belgeleri arka planda önizlemeye al (iş kuyruğu; concurrency parametresiyle) */
  private async preloadAll(concurrency = 4) {
    const docs = [...this.documents];
    let cursor = 0;

    const worker = async () => {
      while (cursor < docs.length) {
        const doc = docs[cursor++];
        try { await this.preloadPreview(doc); } catch {}
      }
    };

    await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));
  }

  /** Tek bir belgeyi önizlemeye al (hover’da da kullanılabilir) */
  async preloadPreview(doc: Document) {
    if (this.previewCache.has(doc.id) || this.previewLoading.has(doc.id)) return;

    this.previewLoading.add(doc.id);
    try {
      const res = await firstValueFrom(
        this.http.get(`${this.apiBase}/api/documents/download/${doc.id}`, {
          responseType: 'blob',
          observe: 'response'
        })
      );
      const blob = res.body as Blob | undefined;
      if (!blob) return;

      const type = res.headers.get('content-type') || blob.type || 'application/octet-stream';
      const raw = URL.createObjectURL(blob);
      const safeRes = this.sanitizer.bypassSecurityTrustResourceUrl(raw);
      const safeUrl = this.sanitizer.bypassSecurityTrustUrl(raw);
      this.previewCache.set(doc.id, { raw, type, safeRes, safeUrl });
    } finally {
      this.previewLoading.delete(doc.id);
    }
  }

  delete(doc: Document): void {
    if (!this.auth.isAdmin()) return;
    if (!confirm(`"${doc.fileName}" belgesini silmek istiyor musun?`)) return;

    this.documentService.delete(doc.id).subscribe({
      next: () => {
        const cached = this.previewCache.get(doc.id);
        if (cached) {
          try { URL.revokeObjectURL(cached.raw); } catch {}
          this.previewCache.delete(doc.id);
        }
        this.documents = this.documents.filter(d => d.id !== doc.id);
        this.msg.add({ severity: 'success', summary: 'Silindi', detail: doc.fileName });
      },
      error: () => this.msg.add({ severity: 'error', summary: 'Hata', detail: 'Silme sırasında hata.' }),
    });
  }

  // Yardımcılar
  ext(name: string) { return (name.split('.').pop() || '').toLowerCase(); }

  formatSize(size?: number) {
    if (size == null) return '';
    const units = ['B','KB','MB','GB','TB'];
    let i = 0, s = size;
    while (s >= 1024 && i < units.length - 1) { s /= 1024; i++; }
    return `${s.toFixed(s < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
  }

  fileIcon(name: string) {
    const e = this.ext(name);
    if (e === 'pdf') return '📕';
    if (['png','jpg','jpeg','webp','gif','bmp','svg'].includes(e)) return '🖼️';
    if (['doc','docx','odt','rtf'].includes(e)) return '📘';
    if (['xls','xlsx','csv','ods'].includes(e)) return '📗';
    if (['ppt','pptx','odp'].includes(e)) return '📙';
    return '📄';
  }

  downloadUrl(id: number) { return `${this.apiBase}/api/documents/download/${id}`; }

  isPdfType(t?: string) { return (t || '').toLowerCase().includes('pdf'); }

  isImageName(name: string) {
    const e = this.ext(name);
    return ['png','jpg','jpeg','gif','webp','bmp','svg'].includes(e);
  }
}