export interface ProjectMetadata {
  id: string;
  project_id?: string;
  title: string;
  logline: string;
  genre: string;
  tone?: string;
  format: string;
  runtime?: string;
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED" | "PRODUCTION_READY" | string;
  stage?: string;
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  updatedAt: string;
  createdAt: string;
  thumbnailUrl?: string;
  activeJobId?: string;
  sceneCount?: number;
  scene_count?: number;
  characterCount?: number;
  character_count?: number;
  [key: string]: unknown;
}

export interface WorkspaceSection {
  id: string;
  label: string;
  icon: string;
  category: "core" | "creative" | "production" | "system";
  component: string;
  requiredData?: string[];
}

export interface StoryForMeCharacter {
  name: string;
  role: string;
  friendlyDescription?: string;
  description?: string;
  goal: string;
  fear: string;
  signatureItem?: string;
  signatureObject?: string;
  [key: string]: unknown;
}

export interface StoryForMeData {
  whatIsThisAbout?: string;
  importantPeople?: StoryForMeCharacter[];
  whatHappens?: {
    first?: string;
    next?: string;
    last?: string;
  };
  whatToRemember?: string[];
  unresolvedMysteries?: string[];
  [key: string]: unknown;
}

export interface CharacterItem {
  id?: string;
  name: string;
  role?: string;
  age?: string | number;
  description?: string;
  appearance?: string;
  visual?: string;
  clothing?: string;
  hair?: string;
  visualEvolution?: string;
  colorPalette?: string;
  visualArc?: {
    phase1?: string;
    phase2?: string;
    phase3?: string;
  };
  wardrobe?: string;
  props?: string | string[];
  signatureObject?: string;
  objective?: string;
  goal?: string;
  conflict?: string;
  fear?: string;
  dialogueLinesCount?: number;
  dialogueCount?: number;
  dialogue_count?: number;
  spokenLines?: number;
  [key: string]: unknown;
}

export interface LocationItem {
  id?: string;
  name: string;
  description?: string;
  type?: string;
  visualAtmosphere?: string;
  lighting?: string;
  colorPalette?: string;
  architecture?: string;
  [key: string]: unknown;
}

export interface WorldRuleItem {
  id?: string;
  rule: string;
  description?: string;
  explanation?: string;
  consequence?: string;
  [key: string]: unknown;
}

export interface ScriptDialogueLine {
  speaker: string;
  dialogue: string;
  parenthetical?: string;
  emotion?: string;
  [key: string]: unknown;
}

export interface ScriptScene {
  sceneNumber: number;
  heading?: string;
  slugline?: string;
  location?: string;
  time?: string;
  act?: string;
  estimatedDuration?: string;
  intExt?: string;
  emotionalBeat?: string;
  transition?: string;
  action?: string;
  dialogue?: string;
  objective?: string;
  conflict?: string;
  subtext?: string;
  characters?: string[];
  lighting?: string;
  shotType?: string;
  cameraMovement?: string;
  soundDesign?: string;
  lines?: ScriptDialogueLine[];
  [key: string]: unknown;
}

export interface StoryboardFrame {
  sceneNumber?: number;
  scene?: number | string;
  frameNumber?: number;
  frame?: number | string;
  shotTitle?: string;
  shot?: string;
  camera?: string;
  shotDescription?: string;
  visualDescription?: string;
  cameraAngle?: string;
  cameraMovement?: string;
  opticalLighting?: string;
  imagePrompt?: string;
  imagen3Prompt?: string;
  imagen3_prompt?: string;
  veoMotionPrompt?: string;
  veo_motion_prompt?: string;
  imageUrl?: string;
  videoUrl?: string;
  imageStatus?: string;
  status?: string;
  [key: string]: unknown;
}

export interface SoundscapeItem {
  sceneNumber?: number;
  scene?: number | string;
  sceneHeading?: string;
  acousticTreatment?: string;
  ambience?: string;
  foley?: string;
  sfx?: string;
  silence?: string;
  silenceMoment?: string;
  music?: string;
  orchestralMotif?: string;
  synthesizerTexture?: string;
  emotionalCue?: string;
  dialogue?: string;
  soundEffects?: string;
  transition?: string;
  [key: string]: unknown;
}

export interface CastMember {
  id?: string;
  performer_name?: string;
  performerName?: string;
  character_name?: string;
  characterName?: string;
  role_type?: string;
  roleType?: string;
  notes?: string;
  sceneNumbers?: number[];
  dialogueLinesCount?: number;
  dialogueCount?: number;
  dialogue_count?: number;
  avatar_url?: string;
  voice_match?: string;
  confirmed?: boolean;
  status?: string;
  [key: string]: unknown;
}

export interface ProjectBibleData {
  id?: string;
  project_id?: string;
  title?: string;
  logline?: string;
  genre?: string;
  format?: string;
  project_information?: string;
  created_at?: string;
  updated_at?: string;
  project?: {
    id?: string;
    title?: string;
    logline?: string;
    genre?: string;
    tone?: string;
    visualStyle?: string;
    targetDuration?: string;
    format?: string;
    platform?: string;
    productionScale?: string;
    targetAudience?: string;
    budget?: string;
    budgetType?: string;
    stage?: string;
    credits_used?: number;
    credits_total?: number;
    plan?: string;
    language?: string;
    owner_id?: string;
    owner_name?: string;
    owner_email?: string;
    story_direction?: string;
    subgenres?: string[];
    dramatic_intensity?: number;
    [key: string]: unknown;
  };
  storyForMe?: StoryForMeData;
  story_for_me?: StoryForMeData;
  characters?: CharacterItem[];
  locations?: LocationItem[];
  worldRules?: WorldRuleItem[];
  scenes?: ScriptScene[];
  screenplay?: ScriptScene[];
  storyboard?: StoryboardFrame[];
  audio?: SoundscapeItem[];
  cast?: CastMember[];
  editPlan?: Record<string, unknown>;
  socialContent?: Record<string, unknown>;
  danceConcepts?: unknown[];
  continuityLog?: unknown[];
  [key: string]: unknown;
}

export interface ProjectCreateResponse {
  success: boolean;
  project_id?: string;
  data?: ProjectBibleData;
  error?: string;
}
