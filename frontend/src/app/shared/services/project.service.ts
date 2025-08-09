import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from '../models/project.model';

const API = 'http://localhost:5291/api/projects';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);

  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(API);
  }

  create(project: Partial<Project>) {
    return this.http.post(API, project);
  }
  
  delete(id: number) {
    return this.http.delete(`${API}/${id}`);
  }

  importFromGitHub(username: string, take = 6) {
    return this.http.post<{ imported: number }>(`${API}/import/github?username=${encodeURIComponent(username)}&take=${take}`, {});
  }
}