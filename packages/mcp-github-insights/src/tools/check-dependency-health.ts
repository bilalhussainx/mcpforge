import type { DependencyHealth, DependencyInfo } from '../types.js';
import { getRepo, getFileContent } from '../lib/github-client.js';

// ── npm registry lookup ────────────────────────────────────────────────────

async function fetchLatestVersion(packageName: string): Promise<string | null> {
  try {
    // Handle scoped packages: @scope/name -> @scope%2Fname
    const encodedName = packageName.startsWith('@')
      ? packageName.replace('/', '%2F')
      : packageName;

    const url = `https://registry.npmjs.org/${encodedName}/latest`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as { version?: string };
    return data.version ?? null;
  } catch {
    return null;
  }
}

// ── Strip semver range prefix ──────────────────────────────────────────────

function stripRange(version: string): string {
  return version.replace(/^[\^~>=<! ]+/, '').trim();
}

// ── Compare versions (simple: check if latest differs from current) ────────

function isOutdated(current: string, latest: string): boolean {
  const cleanCurrent = stripRange(current);
  // If the current version is a URL, git ref, file path, or wildcard, skip
  if (
    cleanCurrent.startsWith('http') ||
    cleanCurrent.startsWith('git') ||
    cleanCurrent.startsWith('file:') ||
    cleanCurrent === '*' ||
    cleanCurrent === 'latest'
  ) {
    return false;
  }

  // Parse major.minor.patch for both
  const parseSemver = (v: string) => {
    const match = /^(\d+)\.(\d+)\.(\d+)/.exec(v);
    if (!match) return null;
    return {
      major: parseInt(match[1]!, 10),
      minor: parseInt(match[2]!, 10),
      patch: parseInt(match[3]!, 10),
    };
  };

  const cur = parseSemver(cleanCurrent);
  const lat = parseSemver(latest);

  if (!cur || !lat) return false;

  if (lat.major > cur.major) return true;
  if (lat.major === cur.major && lat.minor > cur.minor) return true;
  if (lat.major === cur.major && lat.minor === cur.minor && lat.patch > cur.patch) return true;
  return false;
}

// ── Main tool ──────────────────────────────────────────────────────────────

export async function checkDependencyHealth(
  owner: string,
  repo: string,
): Promise<DependencyHealth> {
  const repoData = await getRepo(owner, repo);
  const packageJsonRaw = await getFileContent(owner, repo, 'package.json');

  if (!packageJsonRaw) {
    return {
      repoFullName: repoData.full_name,
      totalDependencies: 0,
      outdatedCount: 0,
      upToDateCount: 0,
      unknownCount: 0,
      dependencies: [],
      checkedAt: new Date().toISOString(),
    };
  }

  let packageJson: {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  try {
    packageJson = JSON.parse(packageJsonRaw) as typeof packageJson;
  } catch {
    return {
      repoFullName: repoData.full_name,
      totalDependencies: 0,
      outdatedCount: 0,
      upToDateCount: 0,
      unknownCount: 0,
      dependencies: [],
      checkedAt: new Date().toISOString(),
    };
  }

  const deps = packageJson.dependencies ?? {};
  const devDeps = packageJson.devDependencies ?? {};

  // Build list of all dependencies to check
  const toCheck: Array<{
    name: string;
    currentVersion: string;
    type: 'dependency' | 'devDependency';
  }> = [];

  for (const [name, version] of Object.entries(deps)) {
    toCheck.push({ name, currentVersion: version, type: 'dependency' });
  }
  for (const [name, version] of Object.entries(devDeps)) {
    toCheck.push({ name, currentVersion: version, type: 'devDependency' });
  }

  // Fetch latest versions concurrently (batch in groups of 15 to be nice)
  const BATCH_SIZE = 15;
  const results: DependencyInfo[] = [];

  for (let i = 0; i < toCheck.length; i += BATCH_SIZE) {
    const batch = toCheck.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (dep) => {
        const latestVersion = await fetchLatestVersion(dep.name);
        const outdated =
          latestVersion !== null
            ? isOutdated(dep.currentVersion, latestVersion)
            : false;

        return {
          name: dep.name,
          currentVersion: dep.currentVersion,
          latestVersion,
          isOutdated: outdated,
          type: dep.type,
        } satisfies DependencyInfo;
      }),
    );
    results.push(...batchResults);
  }

  const outdatedCount = results.filter((d) => d.isOutdated).length;
  const unknownCount = results.filter((d) => d.latestVersion === null).length;
  const upToDateCount = results.length - outdatedCount - unknownCount;

  return {
    repoFullName: repoData.full_name,
    totalDependencies: results.length,
    outdatedCount,
    upToDateCount,
    unknownCount,
    dependencies: results,
    checkedAt: new Date().toISOString(),
  };
}
