import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-project-form',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './project-form.html',
  styleUrls: ['./project-form.css']
})
export class ProjectFormComponent {
  title = '';
  description = '';
  githubUrl = '';

  constructor(private http: HttpClient) {}

  submitForm() {
    const project = {
      title: this.title,
      description: this.description,
      githubUrl: this.githubUrl
    };

    this.http.post('http://localhost:5291/api/project', project)
      .subscribe({
        next: () => {
          alert('Proje başarıyla eklendi!');
          this.title = '';
          this.description = '';
          this.githubUrl = '';
        },
        error: () => alert('Hata oluştu!')
      });
  }
}
