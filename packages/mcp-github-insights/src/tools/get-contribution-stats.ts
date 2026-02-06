import type { ContributionStats, TopRepo } from '../types.js';
import {
  getUserProfile,
  getUserEvents,
  getUserRepos,
} from '../lib/github-client.js';

export async function getContributionStats(
  username: string,
): Promise<ContributionStats> {
  // Fire independent requests concurrently
  const [profile, events, repos] = await Promise.all([
    getUserProfile(username),
    getUserEvents(username),
    getUserRepos(username),
  ]);

  // ── Analyse events (last 90 days) ────────────────────────────────────────

  let totalCommits = 0;
  let totalPushEvents = 0;
  let totalPRs = 0;
  let totalIssues = 0;
  const languageSet = new Set<string>();
  const repoActivityMap = new Map<string, number>();
  const commitDates = new Set<string>();

  for (const event of events) {
    const eventType = event['type'] as string | undefined;
    const repoObj = event['repo'] as { name?: string } | undefined;
    const repoName = repoObj?.name ?? 'unknown';
    const createdAt = event['created_at'] as string | undefined;

    // Track which day had activity for streak calculation
    if (createdAt) {
      const dayStr = createdAt.slice(0, 10); // YYYY-MM-DD
      commitDates.add(dayStr);
    }

    // Track repo activity
    repoActivityMap.set(repoName, (repoActivityMap.get(repoName) ?? 0) + 1);

    switch (eventType) {
      case 'PushEvent': {
        totalPushEvents++;
        const payload = event['payload'] as { commits?: unknown[] } | undefined;
        const commits = payload?.commits;
        if (Array.isArray(commits)) {
          totalCommits += commits.length;
        }
        break;
      }
      case 'PullRequestEvent':
        totalPRs++;
        break;
      case 'IssuesEvent':
        totalIssues++;
        break;
      default:
        break;
    }
  }

  // ── Top languages from user's own repos ───────────────────────────────────

  for (const r of repos) {
    if (r.language) {
      languageSet.add(r.language);
    }
  }

  // Sort languages by how many repos use them
  const langCount = new Map<string, number>();
  for (const r of repos) {
    if (r.language) {
      langCount.set(r.language, (langCount.get(r.language) ?? 0) + 1);
    }
  }
  const topLanguages = [...langCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([lang]) => lang);

  // ── Active repos (by event count) ────────────────────────────────────────

  const activeRepos = [...repoActivityMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name]) => name);

  // ── Streak calculation ───────────────────────────────────────────────────

  const sortedDates = [...commitDates].sort().reverse();
  let streakDays = 0;

  if (sortedDates.length > 0) {
    streakDays = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const current = new Date(sortedDates[i]!);
      const previous = new Date(sortedDates[i - 1]!);
      const diffMs = previous.getTime() - current.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (diffDays <= 1.5) {
        // Allow minor timezone drift
        streakDays++;
      } else {
        break;
      }
    }
  }

  // ── Top repos (by stars) ─────────────────────────────────────────────────

  const topRepos: TopRepo[] = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 10)
    .map((r) => ({
      name: r.name,
      fullName: r.full_name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      url: r.html_url,
    }));

  return {
    username: profile.login,
    name: profile.name,
    avatarUrl: profile.avatar_url,
    bio: profile.bio,
    publicRepos: profile.public_repos,
    followers: profile.followers,
    following: profile.following,
    createdAt: profile.created_at,
    contributions: {
      totalCommits,
      totalPushEvents,
      totalPRs,
      totalIssues,
      topLanguages,
      activeRepos,
      streakDays,
    },
    topRepos,
  };
}
