import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { McpItem, ConfigFile } from '../models/mcp.model';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  private mcpItemsSubject = new BehaviorSubject<McpItem[]>([]);
  public mcpItems$ = this.mcpItemsSubject.asObservable();

  constructor() {
    // Vérifier si on est dans Electron
    if (this.isElectron()) {
      // Écouter les changements de configuration
      (window as any).electronAPI.onConfigChanged((configs: ConfigFile) => {
        const mcpItems = this.convertConfigToMcpItems(configs);
        this.mcpItemsSubject.next(mcpItems);
      });

      // Charger la configuration initiale
      this.loadConfig();
    }
  }

  /**
   * Vérifie si l'application s'exécute dans Electron
   */
  isElectron(): boolean {
    return !!(window && (window as any).electronAPI);
  }

  /**
   * Convertit un objet ConfigFile en tableau McpItem[]
   */
  private convertConfigToMcpItems(config: ConfigFile): McpItem[] {
    if (!config || !config.mcpServers) return [];

    return Object.entries(config.mcpServers).map(([name, mcpConfig]) => ({
      name,
      config: mcpConfig,
      enabled: true // Tous les MCPs présents dans le fichier sont activés
    }));
  }

  /**
   * Convertit un tableau McpItem[] en objet ConfigFile
   * Ne conserve que les items activés
   */
  private convertMcpItemsToConfig(items: McpItem[]): ConfigFile {
    const mcpServers: Record<string, any> = {};
    
    // Ne conserver que les items activés
    items.filter(item => item.enabled).forEach(item => {
      mcpServers[item.name] = item.config;
    });
    
    return { mcpServers };
  }

  /**
   * Charge la configuration depuis Electron
   */
  async loadConfig(): Promise<McpItem[]> {
    if (this.isElectron()) {
      try {
        const config = await (window as any).electronAPI.getConfig();
        const mcpItems = this.convertConfigToMcpItems(config);
        this.mcpItemsSubject.next(mcpItems);
        return mcpItems;
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration:', error);
        return [];
      }
    }
    return [];
  }

  /**
   * Enregistre la configuration
   */
  async saveConfig(items: McpItem[]): Promise<boolean> {
    if (this.isElectron()) {
      try {
        const config = this.convertMcpItemsToConfig(items);
        const result = await (window as any).electronAPI.saveConfig(config);
        if (result.success) {
          this.mcpItemsSubject.next(items);
        }
        return result.success;
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la configuration:', error);
        return false;
      }
    }
    return false;
  }

  /**
   * Active ou désactive un MCP
   */
  async toggleMcp(name: string, enabled: boolean): Promise<boolean> {
    const currentItems = this.mcpItemsSubject.getValue();
    const updatedItems = currentItems.map(item => 
      item.name === name ? { ...item, enabled } : item
    );
    
    return this.saveConfig(updatedItems);
  }

  /**
   * Ajoute un nouveau MCP
   */
  async addMcp(item: McpItem): Promise<boolean> {
    const currentItems = this.mcpItemsSubject.getValue();
    
    // Vérifier que le nom n'existe pas déjà
    if (currentItems.some(i => i.name === item.name)) {
      return false;
    }
    
    const newItems = [...currentItems, item];
    return this.saveConfig(newItems);
  }

  /**
   * Met à jour un MCP existant
   */
  async updateMcp(name: string, updatedItem: McpItem): Promise<boolean> {
    const currentItems = this.mcpItemsSubject.getValue();
    
    // Si on change le nom, vérifier que le nouveau nom n'existe pas déjà
    if (name !== updatedItem.name && currentItems.some(i => i.name === updatedItem.name)) {
      return false;
    }
    
    const newItems = currentItems.map(item => 
      item.name === name ? updatedItem : item
    );
    
    return this.saveConfig(newItems);
  }

  /**
   * Supprime un MCP
   */
  async removeMcp(name: string): Promise<boolean> {
    const currentItems = this.mcpItemsSubject.getValue();
    const newItems = currentItems.filter(item => item.name !== name);
    return this.saveConfig(newItems);
  }
}