import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectService } from 'src/app/shared/services/project.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Project } from 'src/app/shared/models/project.model';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastModule],
  templateUrl: './project-list.component.html',
})
export class ProjectListComponent implements OnInit {
  private projectService = inject(ProjectService);
  private msg = inject(MessageService);
  auth = inject(AuthService);

  projects: Project[] = [];
  loading = false;

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.projectService.getAll().subscribe({
      next: (x) => this.projects = x,
      complete: () => this.loading = false
    });
  }
  deleteProject(id: number) {
    if (!confirm('Bu projeyi silmek istiyor musun?')) return;

    this.projectService.delete(id).subscribe({
      next: () => {
        this.projects = this.projects.filter(p => p.id !== id);
        this.msg.add({ severity: 'success', summary: 'Silindi', detail: 'Proje silindi' });
      },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Hata', detail: 'Silinemedi' });
        alert('Silme sırasında hata oluştu.');
      }
    });
  }
  importGitHub() {
    const username = prompt('GitHub kullanıcı adı?');
    if (!username) return;
    const takeStr = prompt('Kaç repo çekilsin? (örn: 6)');
    const take = Number(takeStr || 6);

    this.projectService.importFromGitHub(username, take).subscribe({
      next: (res) => {
        this.msg.add({ severity: 'success', summary: 'GitHub', detail: `${res.imported} proje eklendi` });
        this.load();
      },
      error: () => this.msg.add({ severity: 'error', summary: 'Hata', detail: 'İçe aktarma başarısız' })
    });
  }
}