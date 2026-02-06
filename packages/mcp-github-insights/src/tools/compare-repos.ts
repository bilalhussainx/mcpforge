import type { RepoComparison, RepoComparisonEntry } from '../types.js';
import { getRepo, getTopics, getTree } from '../lib/github-client.js';
import { hasTests, hasCI } from '../lib/analyzers.js';

interface RepoRef {
  owner: string;
  repo: string;
}

export async function compareRepos(
  repos: RepoRef[],
): Promise<RepoComparison> {
  // Fetch all repo data concurrently
  const entries: RepoComparisonEntry[] = await Promise.all(
    repos.map(async ({ owner, repo }) => {
      const [repoData, topics, tree] = await Promise.all([
        getRepo(owner, repo),
        getTopics(owner, repo),
        getTree(owner, repo),
      ]);

      return {
        owner,
        repo,
        fullName: repoData.full_name,
        description: repoData.description,
        language: repoData.language,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        openIssues: repoData.open_issues_count,
        lastUpdate: repoData.pushed_at ?? repoData.updated_at,
        createdAt: repoData.created_at,
        size: repoData.size,
        hasTests: hasTests(tree),
        hasCI: hasCI(tree),
        license: repoData.license?.spdx_id ?? null,
        topics,
        watchers: repoData.subscribers_count,
      };
    }),
  );

  return {
    repos: entries,
    comparedAt: new Date().toISOString(),
  };
}
