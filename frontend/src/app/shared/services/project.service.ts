import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from '../models/project.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);
  private api = `${environment.apiBaseUrl}/api/projects`; 

  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(this.api);
  }
  create(project: Partial<Project>) {
    return this.http.post(this.api, project);
  }
  delete(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }
  importFromGitHub(username: string, take = 6) {
    return this.http.post<{ imported: number }>(
      `${this.api}/import/github?username=${encodeURIComponent(username)}&take=${take}`,
      {}
    );
  }
}