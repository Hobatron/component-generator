import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  template: `
    <div class="home-container">
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">Component Generator</h1>
          <p class="hero-subtitle">Manage and organize your game data with ease</p>
          <p class="hero-description">
            A powerful tool for managing game components across multiple projects. 
            Create, edit, and organize actions, equipment, and usable items for your games.
          </p>
          
          <div class="cta-buttons">
            <a routerLink="/projects/mortis_invictus" class="btn btn-primary">
              View Mortis Invictus
            </a>
            <a routerLink="/projects/cardgame" class="btn btn-secondary">
              Explore Projects
            </a>
          </div>
        </div>
        
        <div class="hero-visual">
          <div class="feature-cards">
            <div class="feature-card">
              <div class="feature-icon">⚔️</div>
              <h3>Actions</h3>
              <p>Manage combat abilities and character actions</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🛡️</div>
              <h3>Equipment</h3>
              <p>Organize weapons, armor, and gear</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🧪</div>
              <h3>Usables</h3>
              <p>Track consumables and utility items</p>
            </div>
          </div>
        </div>
      </section>

      <section class="projects-section">
        <h2 class="section-title">Available Projects</h2>
        <div class="projects-grid">
          <div class="project-card">
            <div class="project-header">
              <h3 class="project-name">Mortis Invictus</h3>
              <span class="project-status active">Active</span>
            </div>
            <p class="project-description">
              A strategic board game featuring tactical combat and resource management.
            </p>
            <div class="project-stats">
              <span class="stat">
                <strong>Collections:</strong> Actions, Equipment, Usables
              </span>
            </div>
            <a routerLink="/projects/mortis_invictus" class="project-link">
              View Project →
            </a>
          </div>

          <div class="project-card">
            <div class="project-header">
              <h3 class="project-name">Card Game</h3>
              <span class="project-status development">Development</span>
            </div>
            <p class="project-description">
              A collectible card game with unique mechanics and strategic gameplay.
            </p>
            <div class="project-stats">
              <span class="stat">
                <strong>Collections:</strong> Actions, Equipment, Usables
              </span>
            </div>
            <a routerLink="/projects/cardgame" class="project-link">
              View Project →
            </a>
          </div>

          <div class="project-card">
            <div class="project-header">
              <h3 class="project-name">RPG Game</h3>
              <span class="project-status planning">Planning</span>
            </div>
            <p class="project-description">
              An immersive role-playing game with deep character customization.
            </p>
            <div class="project-stats">
              <span class="stat">
                <strong>Collections:</strong> Characters, Spells, Items, Quests
              </span>
            </div>
            <a routerLink="/projects/rpggame" class="project-link">
              View Project →
            </a>
          </div>
        </div>
      </section>

      <section class="features-section">
        <h2 class="section-title">Key Features</h2>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon-large">🔥</div>
            <h3>Real-time Data</h3>
            <p>Live updates from Firestore ensure your data is always current</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon-large">🎯</div>
            <h3>Project-based</h3>
            <p>Organize components by project with clean URL-based navigation</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon-large">⚡</div>
            <h3>Fast & Responsive</h3>
            <p>Built with modern Angular for optimal performance</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon-large">🔒</div>
            <h3>Secure</h3>
            <p>Firebase authentication and security rules protect your data</p>
          </div>
        </div>
      </section>
    </div>
  `,
  styleUrls: ['home.component.scss'],
  imports: [RouterLink]
})
export class HomeComponent {
}
