import { Routes } from '@angular/router';
import { ProjectListComponent } from './pages/project-list/project-list.component';
import { ProjectFormComponent } from './pages/project-form/project-form.component';
import { CvUploadComponent } from './pages/cv-upload/cv-upload.component';
import { DocumentListComponent} from './pages/document-list/document-list.component';

export const routes: Routes = [
  {
    path: '',
    component: ProjectListComponent,
  },
  {
    path: 'admin/project-form',
    component: ProjectFormComponent,
  },
  {
    path: 'admin/cv-upload',
    component: CvUploadComponent,
  },
  { path: 'documents', component: DocumentListComponent },
];