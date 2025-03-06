export interface McpConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface McpItem {
  name: string;  // Clé dans mcpServers
  config: McpConfig;
  enabled: boolean; // Pour le suivi de l'état dans l'UI (pas stocké dans le fichier)
}

export interface ConfigFile {
  mcpServers: Record<string, McpConfig>;
}