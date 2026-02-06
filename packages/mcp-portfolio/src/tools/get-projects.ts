import profileData from '../data/profile.json' with { type: 'json' };
import type { Profile, Project } from '../types.js';

const profile = profileData as Profile;

export interface GetProjectsResult {
  projects: Project[];
  filter: string | null;
  totalResults: number;
}

export function getProjects(filter?: string): GetProjectsResult {
  if (!filter || filter.trim() === '') {
    return {
      projects: profile.projects,
      filter: null,
      totalResults: profile.projects.length,
    };
  }

  const normalizedFilter = filter.toLowerCase().trim();
  const filterTerms = normalizedFilter.split(/\s+/);

  const scoredProjects = profile.projects.map((project) => {
    let score = 0;

    // Check project name
    if (project.name.toLowerCase().includes(normalizedFilter)) {
      score += 10;
    }

    // Check slug
    if (project.slug.toLowerCase().includes(normalizedFilter)) {
      score += 10;
    }

    // Check each filter term individually
    for (const term of filterTerms) {
      // Match against techStack (high relevance)
      for (const tech of project.techStack) {
        if (tech.toLowerCase().includes(term) || term.includes(tech.toLowerCase())) {
          score += 5;
        }
      }

      // Match against relevantFor tags (high relevance)
      for (const tag of project.relevantFor) {
        if (tag.toLowerCase().includes(term) || term.includes(tag.toLowerCase())) {
          score += 5;
        }
      }

      // Match against description (moderate relevance)
      if (project.description.toLowerCase().includes(term)) {
        score += 3;
      }

      // Match against outcomes (moderate relevance)
      if (project.outcomes.toLowerCase().includes(term)) {
        score += 2;
      }

      // Match against role (lower relevance)
      if (project.role.toLowerCase().includes(term)) {
        score += 1;
      }
    }

    return { project, score };
  });

  const matched = scoredProjects
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.project);

  return {
    projects: matched,
    filter: normalizedFilter,
    totalResults: matched.length,
  };
}
