import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from '../models/project.model';

const API_URL = 'http://localhost:5291/api/projects'; 

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
  private http = inject(HttpClient);

    getAll(): Observable<Project[]> {
        return this.http.get<Project[]>(API_URL);
    }
    create(project: Partial<Project>) {
    return this.http.post(API_URL, project);
    }
}