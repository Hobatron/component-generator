import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { FirestoreService } from './services/firestore.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrls: ['app.scss'],
  imports: [RouterOutlet, RouterLink],
})
export class App {
  protected readonly firestoreService = inject(FirestoreService);
  protected showDropdown = false;
  
  constructor() {
  }
}