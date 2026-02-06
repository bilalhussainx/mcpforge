import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { analyzeRepo } from './tools/analyze-repo.js';
import { getContributionStats } from './tools/get-contribution-stats.js';
import { compareRepos } from './tools/compare-repos.js';
import { checkDependencyHealth } from './tools/check-dependency-health.js';

// ── Error formatting ───────────────────────────────────────────────────────

function formatError(error: unknown): string {
  if (error instanceof Error) {
    // Octokit / GitHub API errors often carry a `status` property
    const status = (error as Record<string, unknown>)['status'];
    if (status === 404) {
      return 'Not found. Please check the owner/repo/username is correct.';
    }
    if (status === 403) {
      return 'GitHub API rate limit exceeded or access forbidden. Set a GITHUB_TOKEN environment variable to increase your rate limit.';
    }
    if (status === 401) {
      return 'Authentication failed. Check your GITHUB_TOKEN environment variable.';
    }
    return error.message;
  }
  return String(error);
}

// ── Server factory ─────────────────────────────────────────────────────────

export function createGitHubInsightsServer(): McpServer {
  const server = new McpServer({
    name: 'mcp-github-insights',
    version: '1.0.0',
  });

  // ── Tool 1: analyze_repo ───────────────────────────────────────────────

  server.tool(
    'analyze_repo',
    'Perform a comprehensive analysis of a GitHub repository — languages, tech stack, CI, tests, docs, dependencies, and more.',
    {
      owner: z.string().describe('GitHub repository owner (user or organisation)'),
      repo: z.string().describe('GitHub repository name'),
    },
    async ({ owner, repo }) => {
      try {
        const result = await analyzeRepo(owner, repo);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error analysing repo ${owner}/${repo}: ${formatError(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // ── Tool 2: get_contribution_stats ─────────────────────────────────────

  server.tool(
    'get_contribution_stats',
    'Retrieve contribution statistics for a GitHub user — commit activity, top languages, active repos, streak, and top repositories.',
    {
      username: z.string().describe('GitHub username'),
    },
    async ({ username }) => {
      try {
        const result = await getContributionStats(username);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error fetching contribution stats for ${username}: ${formatError(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // ── Tool 3: compare_repos ─────────────────────────────────────────────

  server.tool(
    'compare_repos',
    'Compare 2-5 GitHub repositories side-by-side — stars, forks, language, CI, tests, and more.',
    {
      repos: z
        .array(
          z.object({
            owner: z.string().describe('Repository owner'),
            repo: z.string().describe('Repository name'),
          }),
        )
        .min(2)
        .max(5)
        .describe('Array of 2-5 repos to compare'),
    },
    async ({ repos }) => {
      try {
        const result = await compareRepos(repos);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error comparing repos: ${formatError(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // ── Tool 4: check_dependency_health ────────────────────────────────────

  server.tool(
    'check_dependency_health',
    'Check the health of npm dependencies in a GitHub repository — find outdated packages by comparing with the npm registry.',
    {
      owner: z.string().describe('GitHub repository owner (user or organisation)'),
      repo: z.string().describe('GitHub repository name'),
    },
    async ({ owner, repo }) => {
      try {
        const result = await checkDependencyHealth(owner, repo);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error checking dependency health for ${owner}/${repo}: ${formatError(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  return server;
}
