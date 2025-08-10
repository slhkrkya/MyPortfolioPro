import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
export interface ContactPayload {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  honeypot?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private http = inject(HttpClient);
  private api = `${environment.apiBaseUrl}/api/contact`;

  send(payload: ContactPayload) {
    return this.http.post<{ ok: boolean }>(this.api, payload);
  }
}