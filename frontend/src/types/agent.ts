export interface AgentCapability {
  id: string;
  name: string;
  description: string;
}

export interface AgentDefinition {
  id: string;
  name: string;
  role: string;
  icon: string;
  order: number;
  isEnabled: boolean;
  version: string;
  description: string;
  dependencies: string[];
  capabilities: string[];
  systemPromptSummary: string;
}
