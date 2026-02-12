const API_BASE = '/api';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const headers: Record<string, string> = { ...options.headers as Record<string, string> };
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

async function uploadFile<T>(endpoint: string, blob: Blob, filename: string): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const formData = new FormData();
  formData.append('file', blob, filename);

  const response = await fetch(url, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export interface User {
  id: string;
  username: string;
  created_at: string;
}

export interface Template {
  id: string;
  name: string;
  slug: string;
  type?: 'character' | 'crew';
  schema?: TemplateSchema;
  created_at: string;
}

export interface ActionDef {
  label: string;
  labelEn: string;
  max: number;
}

export interface AttributeDef {
  label: string;
  labelEn: string;
  actions: Record<string, ActionDef>;
}

export interface OptionDef {
  value: string;
  label: string;
  labelEn?: string;
  description?: string;
}

export interface ItemDef {
  name: string;
  nameEn?: string;
  load: number;
  description?: string;
}

export interface AbilityDef {
  name: string;
  nameEn?: string;
  description: string;
  max?: number;
}

export interface ContactDef {
  name: string;
  description: string;
}

export interface PlaybookDef {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  stressMax?: number;
  stressLabel?: string;
  stressLabelEn?: string;
  traumaLabel?: string;
  traumaLabelEn?: string;
  traumaConditions?: OptionDef[];
  frameCharacteristics?: OptionDef[];
  restrictions?: OptionDef[];
  alchemicals?: OptionDef[];
  specialAbilities: AbilityDef[];
  friends: ContactDef[];
  rivals: ContactDef[];
  items: ItemDef[];
  xpTrigger: string;
  xpTriggerEn: string;
  xpQuestions?: string[];
  xpQuestionsEn?: string[];
  gatherInfo: string[];
}

export interface LoadLevelDef {
  value: string;
  label: string;
  labelEn: string;
  max: number;
}

// Crew-specific types
export interface TerritoryClaimDef {
  name: string;
  nameEn: string;
  description: string;
}

export interface CrewUpgradeDef {
  name: string;
  nameEn: string;
  description: string;
}

export interface CrewTypeDef {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  specialAbilities: AbilityDef[];
  territoryClaims: TerritoryClaimDef[];
  crewUpgrades: CrewUpgradeDef[];
  huntingGrounds: OptionDef[];
  xpTrigger: string;
  xpTriggerEn: string;
  contacts: ContactDef[];
}

export interface LairUpgradeDef {
  name: string;
  nameEn: string;
  description: string;
}

export interface FactionDef {
  name: string;
  tier: number;
}

export interface FactionCategoryDef {
  category: string;
  categoryEn: string;
  factions: FactionDef[];
}

export interface VehicleTraitsDef {
  advantages: OptionDef[];
  defects: OptionDef[];
}

export interface CohortData {
  type: string;
  name: string;
  edge: string;
  flaw: string;
  armor: boolean;
  quality: number;
  conditions: string[];
}

// Character template schema
export interface CharacterTemplateSchema {
  version: string;
  type: 'character';
  attributes: Record<string, AttributeDef>;
  heritages: OptionDef[];
  backgrounds: OptionDef[];
  vices: OptionDef[];
  traumaConditions: OptionDef[];
  sharedItems: ItemDef[];
  teamwork: OptionDef[];
  planTypes: OptionDef[];
  playbooks: Record<string, PlaybookDef>;
  stash: { max: number; tiers: OptionDef[] };
  loadLevels: LoadLevelDef[];
  defaultData: Record<string, unknown>;
}

// Crew template schema
export interface CrewTemplateSchema {
  version: string;
  type: 'crew';
  crewTypes: Record<string, CrewTypeDef>;
  lairUpgrades: LairUpgradeDef[];
  factions: FactionCategoryDef[];
  deityCharacteristics: OptionDef[];
  vehicleTraits: VehicleTraitsDef;
  defaultData: Record<string, unknown>;
}

// Union type
export type TemplateSchema = CharacterTemplateSchema | CrewTemplateSchema;

// Type guards
export function isCharacterSchema(schema: TemplateSchema): schema is CharacterTemplateSchema {
  return schema.type === 'character' || !('crewTypes' in schema);
}

export function isCrewSchema(schema: TemplateSchema): schema is CrewTemplateSchema {
  return schema.type === 'crew';
}

export interface Sheet {
  id: string;
  user_id: string;
  template_id: string;
  name: string;
  data: Record<string, unknown>;
  template_name?: string;
  template_slug?: string;
  template_schema?: TemplateSchema;
  user_name?: string;
  permission?: 'owner' | 'crew_member' | 'shared' | 'none';
  created_at: string;
  updated_at: string;
}

export interface CrewOption {
  id: string;
  name: string;
}

export interface CrewMember {
  id: string;
  name: string;
  owner_name: string;
  playbook: string | null;
}

export interface SheetShare {
  id: string;
  user_id: string;
  username: string;
  shared_at: string;
}

export const api = {
  // Users
  async createOrGetUser(username: string): Promise<User> {
    return request<User>('/users', {
      method: 'POST',
      body: JSON.stringify({ username })
    });
  },

  async getUser(username: string): Promise<User> {
    return request<User>(`/users/${encodeURIComponent(username)}`);
  },

  // Templates
  async getTemplates(): Promise<Template[]> {
    return request<Template[]>('/templates');
  },

  async getTemplate(slug: string): Promise<Template> {
    return request<Template>(`/templates/${encodeURIComponent(slug)}`);
  },

  // Sheets
  async getSheets(userId: string): Promise<Sheet[]> {
    return request<Sheet[]>(`/sheets?userId=${encodeURIComponent(userId)}`);
  },

  async getSheet(id: string, userId?: string): Promise<Sheet> {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return request<Sheet>(`/sheets/${encodeURIComponent(id)}${query}`);
  },

  async createSheet(data: {
    userId: string;
    templateId: string;
    name: string;
    data?: Record<string, unknown>;
  }): Promise<Sheet> {
    return request<Sheet>('/sheets', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateSheet(
    id: string,
    data: { name?: string; data?: Record<string, unknown> },
    userId?: string
  ): Promise<Sheet> {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return request<Sheet>(`/sheets/${encodeURIComponent(id)}${query}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteSheet(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/sheets/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  // Crew sheets (for dropdown)
  async getCrewSheets(): Promise<CrewOption[]> {
    return request<CrewOption[]>('/sheets/crews');
  },

  // Crew members
  async getCrewMembers(crewId: string): Promise<CrewMember[]> {
    return request<CrewMember[]>(`/sheets/crews/${encodeURIComponent(crewId)}/members`);
  },

  // Sheet sharing
  async shareSheet(sheetId: string, username: string, userId: string): Promise<{ success: boolean; sharedWith: string }> {
    return request<{ success: boolean; sharedWith: string }>(`/sheets/${encodeURIComponent(sheetId)}/shares`, {
      method: 'POST',
      body: JSON.stringify({ username, userId })
    });
  },

  async getSheetShares(sheetId: string): Promise<SheetShare[]> {
    return request<SheetShare[]>(`/sheets/${encodeURIComponent(sheetId)}/shares`);
  },

  async removeSheetShare(sheetId: string, userId: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/sheets/${encodeURIComponent(sheetId)}/shares/${encodeURIComponent(userId)}`, {
      method: 'DELETE'
    });
  },

  // Image uploads
  async uploadSheetImage(sheetId: string, blob: Blob, userId: string): Promise<{ image: string }> {
    return uploadFile<{ image: string }>(
      `/sheets/${encodeURIComponent(sheetId)}/image?userId=${encodeURIComponent(userId)}`,
      blob,
      'image.jpg'
    );
  },

  async deleteSheetImage(sheetId: string, userId: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(
      `/sheets/${encodeURIComponent(sheetId)}/image?userId=${encodeURIComponent(userId)}`,
      { method: 'DELETE' }
    );
  },

  getImageUrl(filename: string): string {
    return `${API_BASE}/uploads/${encodeURIComponent(filename)}`;
  }
};
