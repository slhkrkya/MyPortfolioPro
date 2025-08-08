import { Routes } from '@angular/router';
import { ProjectListComponent } from './pages/project-list/project-list';
import { ProjectFormComponent } from './pages/project-form/project-form';
import { CvUploadComponent } from './pages/cv-upload/cv-upload';

export const routes: Routes = [
  { path: 'projects', component: ProjectListComponent },
  { path: 'add-project', component: ProjectFormComponent },
  { path: 'upload-cv', component: CvUploadComponent},
  { path: '', redirectTo: 'projects', pathMatch: 'full' }
];