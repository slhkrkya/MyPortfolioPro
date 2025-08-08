import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Document } from '../models/document.model';

const API_URL = 'http://localhost:5291/api/documents';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private http = inject(HttpClient);

  getAll(): Observable<Document[]> {
    return this.http.get<Document[]>(API_URL);
  }
}
