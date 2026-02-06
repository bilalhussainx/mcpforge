import type { RepoAnalysis } from '../types.js';
import {
  getRepo,
  getLanguages,
  getTopics,
  getTree,
  getFileContent,
} from '../lib/github-client.js';
import {
  detectTechStack,
  hasTests,
  hasCI,
  hasDocs,
  countDependencies,
} from '../lib/analyzers.js';

export async function analyzeRepo(
  owner: string,
  repo: string,
): Promise<RepoAnalysis> {
  // Fire independent requests concurrently
  const [repoData, languages, topics, tree] = await Promise.all([
    getRepo(owner, repo),
    getLanguages(owner, repo),
    getTopics(owner, repo),
    getTree(owner, repo),
  ]);

  // Attempt to read package.json for dependency/tech-stack analysis
  const packageJsonRaw = await getFileContent(owner, repo, 'package.json');
  let packageJson: Record<string, unknown> | null = null;
  try {
    if (packageJsonRaw) {
      packageJson = JSON.parse(packageJsonRaw) as Record<string, unknown>;
    }
  } catch {
    packageJson = null;
  }

  // Attempt to read README for docs quality check
  const readmeContent = await getFileContent(owner, repo, 'README.md');

  // Compute file count (blobs only)
  const fileCount = tree.filter((e) => e.type === 'blob').length;

  // Detect tech stack
  const techStackDetected = detectTechStack(
    packageJson as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> } | null,
    tree,
  );

  // Language percentages
  const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);
  const languagePercentages: Record<string, number> = {};
  for (const [lang, bytes] of Object.entries(languages)) {
    languagePercentages[lang] = totalBytes > 0
      ? Math.round((bytes / totalBytes) * 10000) / 100
      : 0;
  }

  const analysis: RepoAnalysis = {
    name: repoData.name,
    fullName: repoData.full_name,
    description: repoData.description,
    language: repoData.language,
    languages: languagePercentages,
    stars: repoData.stargazers_count,
    forks: repoData.forks_count,
    openIssues: repoData.open_issues_count,
    lastCommitDate: repoData.pushed_at ?? repoData.updated_at,
    createdAt: repoData.created_at,
    topics,
    techStackDetected,
    fileCount,
    hasTests: hasTests(tree),
    hasCI: hasCI(tree),
    hasDocs: hasDocs(readmeContent),
    license: repoData.license?.spdx_id ?? null,
    dependencyCount: countDependencies(
      packageJson as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> } | null,
    ),
    defaultBranch: repoData.default_branch,
    size: repoData.size,
    watchers: repoData.subscribers_count,
    isArchived: repoData.archived,
    isFork: repoData.fork,
  };

  return analysis;
}
