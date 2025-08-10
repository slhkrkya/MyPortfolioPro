import { Routes } from '@angular/router';
import { ProjectListComponent } from './pages/project-list/project-list.component';
import { DocumentListComponent } from './pages/document-list/document-list.component';
import { AdminLoginComponent } from 'src/app/pages/admin-login/admin-login.component';
import { ProjectFormComponent } from './pages/project-form/project-form.component';
import { CvUploadComponent } from './pages/cv-upload/cv-upload.component';
import { AdminPanelComponent } from 'src/app/pages/admin-panel/admin-panel.component';
import { adminGuard } from './shared/guards/admin.guard';
import { DocumentPreviewComponent } from './pages/document-preview/document-preview.component';
import { ContactComponent } from './pages/contact/contact.component';
import { HomeComponent } from './pages/home/home.component/home.component';
import { SiteProfileEditComponent } from './pages/admin-profile/site-profile-edit.component/site-profile-edit.component';

export const routes: Routes = [
  // Public
  { path: '', component: HomeComponent },
  { path: 'projects', component: ProjectListComponent },
  { path: 'documents', component: DocumentListComponent },
  { path: 'documents/:id', component: DocumentPreviewComponent },
  { path: 'contact', component: ContactComponent },

  // Login (public)
  { path: 'admin/login', component: AdminLoginComponent },

  // Admin 
  { path: 'admin/panel', component: AdminPanelComponent, canActivate: [adminGuard] },
  { path: 'admin/project-form', component: ProjectFormComponent, canActivate: [adminGuard] },
  { path: 'admin/cv-upload', component: CvUploadComponent, canActivate: [adminGuard] },
  { path: 'admin/profile', component: SiteProfileEditComponent, canActivate: [adminGuard],},
  { path: '**', redirectTo: '' }
];