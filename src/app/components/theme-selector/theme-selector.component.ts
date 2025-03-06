import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AVAILABLE_THEMES, ThemeConfig } from '../../models/theme.model';

@Component({
  selector: 'app-theme-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-ghost btn-xs btn-circle">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <ul tabindex="0" class="dropdown-content menu p-1 shadow bg-base-100 rounded-box w-52 text-sm mt-1 z-50">
        <li class="menu-title text-xs">Thèmes</li>
        <li *ngFor="let theme of themes">
          <a (click)="setTheme(theme.value)" [class.active]="currentTheme === theme.value">
            <span>{{ theme.icon }} {{ theme.name }}</span>
          </a>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .dropdown-content {
      max-height: 300px;
      overflow-y: auto;
    }
  `]
})
export class ThemeSelectorComponent implements OnInit {
  themes = AVAILABLE_THEMES;
  currentTheme = 'cyberpunk'; // Thème par défaut

  ngOnInit(): void {
    // Récupérer le thème enregistré, s'il existe
    const savedTheme = localStorage.getItem('claude-mcp-theme');
    if (savedTheme) {
      this.setTheme(savedTheme);
    }
  }

  setTheme(theme: string): void {
    // Mettre à jour le data-theme sur le html
    document.documentElement.setAttribute('data-theme', theme);
    
    // Enregistrer la préférence
    localStorage.setItem('claude-mcp-theme', theme);
    
    // Mettre à jour l'état local
    this.currentTheme = theme;

    // On pourrait également envoyer la préférence au processus principal
    if (window && (window as any).electronAPI) {
      (window as any).electronAPI.changeTheme(theme);
    }
  }
}