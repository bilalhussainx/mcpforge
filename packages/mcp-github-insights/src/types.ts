// ── Repo Analysis ──────────────────────────────────────────────────────────

export interface RepoAnalysis {
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  languages: Record<string, number>;
  stars: number;
  forks: number;
  openIssues: number;
  lastCommitDate: string;
  createdAt: string;
  topics: string[];
  techStackDetected: string[];
  fileCount: number;
  hasTests: boolean;
  hasCI: boolean;
  hasDocs: boolean;
  license: string | null;
  dependencyCount: number;
  defaultBranch: string;
  size: number;
  watchers: number;
  isArchived: boolean;
  isFork: boolean;
}

// ── Contribution Stats ─────────────────────────────────────────────────────

export interface ContributionStats {
  username: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: string;
  contributions: {
    totalCommits: number;
    totalPushEvents: number;
    totalPRs: number;
    totalIssues: number;
    topLanguages: string[];
    activeRepos: string[];
    streakDays: number;
  };
  topRepos: TopRepo[];
}

export interface TopRepo {
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  url: string;
}

// ── Repo Comparison ────────────────────────────────────────────────────────

export interface RepoComparisonEntry {
  owner: string;
  repo: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  lastUpdate: string;
  createdAt: string;
  size: number;
  hasTests: boolean;
  hasCI: boolean;
  license: string | null;
  topics: string[];
  watchers: number;
}

export interface RepoComparison {
  repos: RepoComparisonEntry[];
  comparedAt: string;
}

// ── Dependency Health ──────────────────────────────────────────────────────

export interface DependencyInfo {
  name: string;
  currentVersion: string;
  latestVersion: string | null;
  isOutdated: boolean;
  type: 'dependency' | 'devDependency';
}

export interface DependencyHealth {
  repoFullName: string;
  totalDependencies: number;
  outdatedCount: number;
  upToDateCount: number;
  unknownCount: number;
  dependencies: DependencyInfo[];
  checkedAt: string;
}

// ── GitHub API helpers ─────────────────────────────────────────────────────

export interface TreeEntry {
  path?: string;
  mode?: string;
  type?: string;
  sha?: string;
  size?: number;
  url?: string;
}
