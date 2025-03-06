import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ElectronService } from '../../services/electron.service';
import { McpItem } from '../../models/mcp.model';
import { McpEditorComponent } from '../mcp-editor/mcp-editor.component';
import { ThemeSelectorComponent } from '../theme-selector/theme-selector.component';

@Component({
  selector: 'app-mcp-list',
  standalone: true,
  imports: [CommonModule, McpEditorComponent, ThemeSelectorComponent],
  templateUrl: './mcp-list.component.html',
  styleUrls: ['./mcp-list.component.scss']
})
export class McpListComponent implements OnInit, OnDestroy {
  mcpItems: McpItem[] = [];
  isLoading = true;
  selectedMcp: McpItem | null = null;
  isEditing = false;
  private subscription: Subscription = new Subscription();

  constructor(private electronService: ElectronService) {}

  ngOnInit(): void {
    this.loadConfig();
    this.subscription.add(
      this.electronService.mcpItems$.subscribe(items => {
        this.mcpItems = items;
        this.isLoading = false;

        // Exposer les MCPs au niveau global pour que le main process puisse y accéder
        (window as any).mcpItems = this.mcpItems;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async loadConfig(): Promise<void> {
    this.isLoading = true;
    await this.electronService.loadConfig();
  }

  async toggleMcp(item: McpItem): Promise<void> {
    await this.electronService.toggleMcp(item.name, !item.enabled);
  }

  editMcp(item: McpItem): void {
    this.selectedMcp = JSON.parse(JSON.stringify(item)); // Deep copy
    this.isEditing = true;
  }

  newMcp(): void {
    this.selectedMcp = {
      name: '',
      config: {
        command: '',
        args: []
      },
      enabled: true
    };
    this.isEditing = true;
  }

  async deleteMcp(item: McpItem): Promise<void> {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le MCP "${item.name}" ?`)) {
      await this.electronService.removeMcp(item.name);
    }
  }

  async onSaveMcp(item: McpItem): Promise<void> {
    if (!this.selectedMcp) return;

    const isNew = !this.mcpItems.some(i => i.name === item.name);

    if (isNew) {
      await this.electronService.addMcp(item);
    } else {
      const originalName = this.selectedMcp.name;
      await this.electronService.updateMcp(originalName, item);
    }

    this.isEditing = false;
    this.selectedMcp = null;
  }

  onCancelEdit(): void {
    this.isEditing = false;
    this.selectedMcp = null;
  }

  // Utilitaires pour l'affichage
  getEnvEntries(env: Record<string, string> | undefined): [string, string][] {
    if (!env) return [];
    return Object.entries(env);
  }

  // Masque les valeurs sensibles (comme les tokens)
  getMaskedValue(value: string): string {
    if (value.toLowerCase().includes('token') || value.length > 20) {
      return value.substring(0, 4) + '...' + value.substring(value.length - 4);
    }
    return value;
  }

  // Ouvrir un lien externe
  openExternalLink(url: string): void {
    if (window && (window as any).electronAPI) {
      (window as any).electronAPI.openExternalLink(url);
    } else {
      window.open(url, '_blank');
    }
  }
}
