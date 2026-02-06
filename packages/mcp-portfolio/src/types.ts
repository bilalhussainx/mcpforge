export interface Education {
  institution: string;
  degree: string;
  field: string;
  location?: string;
  graduated?: string;
}

export interface Skills {
  expert: string[];
  proficient: string[];
  familiar: string[];
}

export type SkillLevel = keyof Skills;

export interface Project {
  name: string;
  slug: string;
  description: string;
  techStack: string[];
  outcomes: string;
  role: string;
  url?: string;
  relevantFor: string[];
}

export interface Experience {
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface Profile {
  name: string;
  title: string;
  headline: string;
  email?: string;
  linkedin?: string;
  github?: string;
  location: string;
  timezone?: string;
  yearsExperience: number;
  education: Education[];
  skills: Skills;
  specializations: string[];
  projects: Project[];
  experience?: Experience[];
  valueProps: string[];
}

export interface SkillMatch {
  skill: string;
  level: SkillLevel;
  query: string;
}

export interface RequirementMatch {
  requirement: string;
  matched: boolean;
  evidence: string;
  strength: 'exact' | 'strong' | 'partial';
}

export interface RequirementGap {
  requirement: string;
  mitigation: string;
}

export interface FitAnalysis {
  fitScore: number;
  matchedRequirements: RequirementMatch[];
  gaps: RequirementGap[];
  highlights: string[];
}
