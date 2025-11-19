import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-home',
  template: `
    <div class="home-container">
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">Component Generator</h1>
          <p class="hero-subtitle">Dynamic game data management made simple</p>
          <p class="hero-description">
            Create custom projects with flexible category schemas. Design your own data structures,
            manage unlimited categories, and organize game components exactly how you need them.
          </p>

          <div class="cta-buttons">
            @if ((projects$ | async)?.length) {
            <a [routerLink]="'/projects/' + (projects$ | async)?.[0]?.id" class="btn btn-primary">
              View Projects
            </a>
            } @else {
            <button class="btn btn-primary" disabled>No Projects Yet</button>
            }
          </div>
        </div>

        <div class="hero-visual">
          <div class="feature-cards">
            <div class="feature-card">
              <div class="feature-icon">📁</div>
              <h3>Custom Categories</h3>
              <p>Create unlimited categories with custom fields</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🎨</div>
              <h3>Flexible Schemas</h3>
              <p>Define your own data structure for each category</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">⚡</div>
              <h3>Real-time Sync</h3>
              <p>Live updates across all your projects</p>
            </div>
          </div>
        </div>
      </section>

      <section class="projects-section">
        <h2 class="section-title">Your Projects</h2>
        @if (projects$ | async; as projects) { @if (projects.length > 0) {
        <div class="projects-grid">
          @for (project of projects; track project.id) {
          <div class="project-card">
            <div class="project-header">
              <div class="project-icon-title">
                <span class="project-icon-large">{{ project.icon || '🎮' }}</span>
                <h3 class="project-name">{{ project.name }}</h3>
              </div>
            </div>
            <p class="project-description">
              {{ project.description || 'No description available' }}
            </p>
            <div class="project-stats">
              <span class="stat">
                <strong>Categories:</strong> {{ project.collections?.length || 0 }}
              </span>
            </div>
            <a [routerLink]="'/projects/' + project.id" class="project-link"> View Project → </a>
          </div>
          }
        </div>
        } @else {
        <div class="empty-projects">
          <div class="empty-icon">📦</div>
          <h3>No Projects Yet</h3>
          <p>Get started by creating your first project from the Projects menu above.</p>
        </div>
        } }
      </section>

      <section class="features-section">
        <h2 class="section-title">Key Features</h2>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon-large">➕</div>
            <h3>Create Projects</h3>
            <p>Start new projects with custom names, descriptions, and icons</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon-large">📋</div>
            <h3>Custom Categories</h3>
            <p>Add unlimited categories to organize your game data your way</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon-large">🔧</div>
            <h3>Flexible Fields</h3>
            <p>Define custom fields: text, numbers, dropdowns, and textareas</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon-large">✏️</div>
            <h3>Edit Schemas</h3>
            <p>Modify category structures anytime - add or remove fields as needed</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon-large">🔥</div>
            <h3>Real-time Sync</h3>
            <p>Powered by Firestore for instant updates across all devices</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon-large">🎨</div>
            <h3>Beautiful UI</h3>
            <p>Modern, responsive design built with Angular and best practices</p>
          </div>
        </div>
      </section>
    </div>
  `,
  styleUrls: ['home.component.scss'],
  imports: [RouterLink, AsyncPipe],
})
export class HomeComponent {
  private readonly projectService = inject(ProjectService);
  protected readonly projects$ = this.projectService.getAllProjects();
}
