import { Routes } from '@angular/router';
import { App } from './app';
import { HomeComponent } from './home/home.component';
import { ProjectComponent } from './project/project.component';
import { SectionComponent } from './section/section.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'projects/:projectName',
    component: ProjectComponent
  },
  {
    path: 'projects/:projectName/:section',
    component: SectionComponent
  }
];
