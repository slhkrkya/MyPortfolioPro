import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from 'src/app/shared/services/project.service';
import { Project } from 'src/app/shared/models/project.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-form.component.html',
})
export class ProjectFormComponent {
  private projectService = inject(ProjectService);
  private router = inject(Router);

  project: Partial<Project> = {
    title: '',
    description: '',
    githubUrl: '',
    imageUrl: ''
  };

  saveProject() {
    this.projectService.create(this.project).subscribe(() => {
      alert('Proje başarıyla eklendi!');
      this.router.navigate(['/']);
    });
  }
}