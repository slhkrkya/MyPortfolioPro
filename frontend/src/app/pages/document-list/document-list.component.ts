import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from 'src/app/shared/services/document.service';
import { Document } from 'src/app/shared/models/document.model';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-list.component.html',
})
export class DocumentListComponent implements OnInit {
  private documentService = inject(DocumentService);
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
      error: () => alert('Belgeler yüklenemedi.'),
      complete: () => (this.loading = false),
    });
  }

  delete(doc: Document): void {
    if (!this.auth.isAdmin()) return; // ekstra güvenlik, UI dışında da kontrol
    if (!confirm(`"${doc.fileName}" belgesini silmek istiyor musun?`)) return;

    this.documentService.delete(doc.id).subscribe({
      next: () => (this.documents = this.documents.filter(d => d.id !== doc.id)),
      error: () => alert('Silme sırasında hata oluştu.'),
    });
  }
}