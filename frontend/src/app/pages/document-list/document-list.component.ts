import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DocumentService } from 'src/app/shared/services/document.service';
import { Document } from 'src/app/shared/models/document.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, ToastModule, ProgressSpinnerModule, RouterModule],
  templateUrl: './document-list.component.html',
})
export class DocumentListComponent implements OnInit {
  private documentService = inject(DocumentService);
  private msg = inject(MessageService);
  auth = inject(AuthService);

  documents: Document[] = [];
  loading = false;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.documentService.getAll().subscribe({
      next: (data) => (this.documents = data),
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Hata', detail: 'Belgeler yüklenemedi.' });
      },
      complete: () => (this.loading = false),
    });
  }

  delete(doc: Document): void {
    if (!this.auth.isAdmin()) return;
    if (!confirm(`"${doc.fileName}" belgesini silmek istiyor musun?`)) return;

    this.documentService.delete(doc.id).subscribe({
      next: () => {
        this.documents = this.documents.filter(d => d.id !== doc.id);
        this.msg.add({ severity: 'success', summary: 'Silindi', detail: doc.fileName });
      },
      error: () => this.msg.add({ severity: 'error', summary: 'Hata', detail: 'Silme sırasında hata.' }),
    });
  }

  ext(name: string) {
    return (name.split('.').pop() || '').toLowerCase();
  }

  formatSize(size?: number) {
    if (size == null) return '';
    const units = ['B','KB','MB','GB'];
    let i = 0, s = size;
    while (s >= 1024 && i < units.length - 1) { s /= 1024; i++; }
    return `${s.toFixed(1)} ${units[i]}`;
  }
}
