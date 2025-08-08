import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from 'src/app/shared/services/project.service';
import { Project } from 'src/app/shared/models/project.model';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-list.component.html',
})
export class ProjectListComponent implements OnInit {
  private projectService = inject(ProjectService);
  projects: Project[] = [];

  ngOnInit(): void {
    this.projectService.getAll().subscribe((data) => {
      this.projects = data;
    });
  }
}