import { Routes } from '@angular/router';
import { App } from './app';
import { HomeComponent } from './home/home.component';
import { ProjectComponent } from './project/project.component';
import { SectionComponent } from './section/section.component';
import { SchemaSeederComponent } from './migration/schema-seeder.component';
import { DesignerTestComponent } from './designer-test/designer-test.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'seed-schemas',
    component: SchemaSeederComponent,
  },
  {
    path: 'designer-test',
    component: DesignerTestComponent,
  },
  {
    path: 'projects/:projectName',
    component: ProjectComponent,
  },
  {
    path: 'projects/:projectName/:section',
    component: SectionComponent,
  },
];
