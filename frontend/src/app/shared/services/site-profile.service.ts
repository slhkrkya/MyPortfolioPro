import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // projendeki gibi
import { SiteProfile } from '../models/site-profile.model';

@Injectable({ providedIn: 'root' })
export class SiteProfileService {
  private http = inject(HttpClient);
  private api = `${environment.apiBaseUrl}/siteprofile`;

  get(): Observable<SiteProfile> {
    return this.http.get<SiteProfile>(this.api);
  }

  // Admin güncellemesi (AuthInterceptor zaten token ekliyor)
  update(dto: SiteProfile): Observable<SiteProfile> {
    return this.http.put<SiteProfile>(this.api, dto);
  }
}