import { Octokit } from 'octokit';
import type { TreeEntry } from '../types.js';

// Create Octokit instance — authenticated if GITHUB_TOKEN is set, otherwise anonymous.
function createOctokit(): Octokit {
  const token = process.env['GITHUB_TOKEN'] ?? process.env['GH_TOKEN'];
  return new Octokit(token ? { auth: token } : {});
}

const octokit = createOctokit();

// ── Repository metadata ────────────────────────────────────────────────────

export async function getRepo(owner: string, repo: string) {
  const { data } = await octokit.rest.repos.get({ owner, repo });
  return data;
}

// ── Languages breakdown ────────────────────────────────────────────────────

export async function getLanguages(
  owner: string,
  repo: string,
): Promise<Record<string, number>> {
  const { data } = await octokit.rest.repos.listLanguages({ owner, repo });
  return data;
}

// ── Topics ─────────────────────────────────────────────────────────────────

export async function getTopics(owner: string, repo: string): Promise<string[]> {
  const { data } = await octokit.rest.repos.getAllTopics({ owner, repo });
  return data.names;
}

// ── Repo tree (root level, recursive) ──────────────────────────────────────

export async function getTree(
  owner: string,
  repo: string,
): Promise<TreeEntry[]> {
  // Fetch the default branch SHA first
  const repoData = await getRepo(owner, repo);
  const defaultBranch = repoData.default_branch;

  const { data } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: defaultBranch,
    recursive: 'true',
  });

  return data.tree as TreeEntry[];
}

// ── File content (base64 decoded) ──────────────────────────────────────────

export async function getFileContent(
  owner: string,
  repo: string,
  path: string,
): Promise<string | null> {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    // getContent can return a file or directory; we only handle files
    if ('content' in data && typeof data.content === 'string') {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    return null;
  } catch {
    return null;
  }
}

// ── User events (last 90 days, up to 300) ──────────────────────────────────

export async function getUserEvents(username: string) {
  // GitHub events API returns max 10 pages of 30 events each (300 total)
  // and only events from the last 90 days.
  const allEvents: Array<Record<string, unknown>> = [];

  for (let page = 1; page <= 10; page++) {
    const { data } = await octokit.rest.activity.listPublicEventsForUser({
      username,
      per_page: 100,
      page,
    });

    if (data.length === 0) break;
    allEvents.push(...(data as Array<Record<string, unknown>>));

    // If we got fewer than per_page, that's the last page
    if (data.length < 100) break;
  }

  return allEvents;
}

// ── User profile ───────────────────────────────────────────────────────────

export async function getUserProfile(username: string) {
  const { data } = await octokit.rest.users.getByUsername({ username });
  return data;
}

// ── User repos (sorted by stars) ───────────────────────────────────────────

export async function getUserRepos(username: string) {
  const { data } = await octokit.rest.repos.listForUser({
    username,
    sort: 'pushed',
    per_page: 100,
    type: 'owner',
  });
  return data;
}
