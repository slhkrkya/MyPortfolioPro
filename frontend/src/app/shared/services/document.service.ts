import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Document } from '../models/document.model';
import { environment } from '../../../environments/environment'; 

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private http = inject(HttpClient);
  private api = `${environment.apiBaseUrl}/api/documents`; 

  getAll(): Observable<Document[]> {
    return this.http.get<Document[]>(this.api);
  }

  delete(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }

  getById(id: number) {
    return this.http.get<{ 
      id: number; 
      fileName: string; 
      contentType?: string; 
      size?: number; 
      uploadedAt: string 
    }>(`${this.api}/${id}`);
  }

  // Dosya indirme (Excel, PDF, görsel vb. her şey için)
  download(id: number): Observable<Blob> {
    return this.http.get(`${this.api}/download/${id}`, { responseType: 'blob' });
  }
}
