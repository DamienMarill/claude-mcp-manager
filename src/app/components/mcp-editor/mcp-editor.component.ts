import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { McpItem } from '../../models/mcp.model';

interface EnvVariable {
  key: string;
  value: string;
}

@Component({
  selector: 'app-mcp-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mcp-editor.component.html',
  styleUrls: ['./mcp-editor.component.scss']
})
export class McpEditorComponent implements OnInit {
  @Input() item!: McpItem;
  @Output() save = new EventEmitter<McpItem>();
  @Output() cancel = new EventEmitter<void>();

  editingItem!: McpItem;
  isNew = false;
  argsText = '';
  showEnvSection = false;
  envVars: EnvVariable[] = [];

  ngOnInit(): void {
    // Copie profonde de l'item pour éviter de modifier l'original
    this.editingItem = JSON.parse(JSON.stringify(this.item));
    
    // Initialiser le texte des arguments
    this.argsText = this.editingItem.config.args.join('\n');
    
    // Initialiser les variables d'environnement
    this.initEnvVars();
    
    // Détermine si c'est un nouvel élément
    this.isNew = !this.item.name;
  }

  initEnvVars(): void {
    if (this.editingItem.config.env) {
      this.showEnvSection = true;
      this.envVars = Object.entries(this.editingItem.config.env).map(([key, value]) => ({ key, value }));
    } else {
      this.showEnvSection = false;
      this.envVars = [];
    }
  }

  updateArgsList(): void {
    // Convertir le texte en tableau d'arguments en séparant par les sauts de ligne
    // et en ignorant les lignes vides
    this.editingItem.config.args = this.argsText
      .split('\n')
      .map(arg => arg.trim())
      .filter(arg => arg.length > 0);
  }

  addEnvVar(): void {
    this.envVars.push({ key: '', value: '' });
  }

  removeEnvVar(index: number): void {
    this.envVars.splice(index, 1);
  }

  updateEnvVars(): void {
    if (this.showEnvSection && this.envVars.length > 0) {
      const env: Record<string, string> = {};
      
      // Ne conserver que les variables avec une clé
      this.envVars
        .filter(v => v.key.trim().length > 0)
        .forEach(v => {
          env[v.key.trim()] = v.value;
        });
      
      if (Object.keys(env).length > 0) {
        this.editingItem.config.env = env;
      } else {
        delete this.editingItem.config.env;
      }
    } else {
      delete this.editingItem.config.env;
    }
  }

  isFormValid(): boolean {
    return (
      !!this.editingItem.name.trim() &&
      !!this.editingItem.config.command.trim() &&
      (!this.showEnvSection || this.isEnvSectionValid())
    );
  }

  isEnvSectionValid(): boolean {
    // Vérifier que toutes les variables d'environnement ont une clé
    return this.envVars.every(v => v.key.trim().length > 0 || v.value.trim().length === 0);
  }

  onSubmit(): void {
    // Mettre à jour les arguments depuis le texte
    this.updateArgsList();
    
    // Mettre à jour les variables d'environnement
    this.updateEnvVars();
    
    // Validation
    if (!this.isFormValid()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.save.emit(this.editingItem);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}