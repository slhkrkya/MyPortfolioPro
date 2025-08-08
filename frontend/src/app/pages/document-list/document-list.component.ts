import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from 'src/app/shared/services/document.service';
import { Document } from 'src/app/shared/models/document.model';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-list.component.html',
})
export class DocumentListComponent implements OnInit {
  private documentService = inject(DocumentService);
  documents: Document[] = [];

  ngOnInit(): void {
    this.documentService.getAll().subscribe((data) => {
      this.documents = data;
    });
  }
}