import { Routes } from '@angular/router';
import { App } from './app';
import { HomeComponent } from './home/home.component';
import { ProjectComponent } from './project/project.component';
import { SectionComponent } from './section/section.component';
import { SchemaSeederComponent } from './migration/schema-seeder.component';
import { LoginComponent } from './auth/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard],
  },
  {
    path: 'seed-schemas',
    component: SchemaSeederComponent,
    canActivate: [authGuard],
  },
  {
    path: 'projects/:projectName',
    component: ProjectComponent,
    canActivate: [authGuard],
  },
  {
    path: 'projects/:projectName/:section',
    component: SectionComponent,
    canActivate: [authGuard],
  },
];
