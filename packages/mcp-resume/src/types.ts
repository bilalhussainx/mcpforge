export interface ResumeData {
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  title: string | null;
  summary: string | null;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  certifications: string[];
  rawText: string;
}

export interface WorkExperience {
  company: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
  bullets: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string | null;
  year: string | null;
}

export interface KeywordAnalysis {
  required_skills: string[];
  nice_to_have: string[];
  action_verbs: string[];
  technical_terms: string[];
  soft_skills: string[];
}

export interface OptimizationReport {
  fitScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  keywordDensity: number;
  suggestions: OptimizationSuggestion[];
  reorderedExperience: string[];
}

export interface OptimizationSuggestion {
  section: 'skills' | 'experience' | 'summary' | 'title';
  current: string;
  suggested: string;
  reason: string;
}

export interface ATSScore {
  overallScore: number;
  breakdown: {
    formatting: number;
    sectionHeaders: number;
    parseability: number;
    keywordOptimization: number;
  };
  issues: ATSIssue[];
  passed: string[];
}

export interface ATSIssue {
  severity: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  fix: string;
}
