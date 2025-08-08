import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ProjectCardComponent } from '../../components/project-card/project-card';

interface Project {
  id: number;
  title: string;
  description: string;
  githubUrl: string;
}

@Component({
  selector: 'app-project-list',
  imports: [CommonModule, HttpClientModule, ProjectCardComponent],
  templateUrl: './project-list.html',
  styleUrls: ['./project-list.css']
})
export class ProjectListComponent implements OnInit{
  projects: Project[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
      this.http.get<Project[]>('http://localhost:5291/api/project')
      .subscribe(data => this.projects = data);
  }
}