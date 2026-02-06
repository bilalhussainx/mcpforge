import profileData from '../data/profile.json' with { type: 'json' };
import type { Profile, Project } from '../types.js';

const profile = profileData as Profile;

export function getProjectBySlug(slug: string): Project | null {
  return profile.projects.find((p) => p.slug === slug) ?? null;
}

export function getProjectSlugs(): string[] {
  return profile.projects.map((p) => p.slug);
}

export function formatProjectText(project: Project): string {
  const lines: string[] = [];
  lines.push(`Project: ${project.name}`);
  lines.push(`Slug: ${project.slug}`);
  lines.push(`Role: ${project.role}`);
  lines.push('');
  lines.push('Description:');
  lines.push(project.description);
  lines.push('');
  lines.push('Tech Stack:');
  lines.push(project.techStack.join(', '));
  lines.push('');
  lines.push('Outcomes:');
  lines.push(project.outcomes);
  lines.push('');
  lines.push('Relevant For:');
  lines.push(project.relevantFor.join(', '));
  return lines.join('\n');
}
