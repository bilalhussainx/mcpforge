import profileData from '../data/profile.json' with { type: 'json' };
import type { Profile } from '../types.js';

const profile = profileData as unknown as Profile;

export function getResumeText(): string {
  const lines: string[] = [];

  lines.push('='.repeat(60));
  lines.push(`${profile.name}`);
  lines.push(`${profile.title}`);
  lines.push('='.repeat(60));
  lines.push('');

  // Contact
  lines.push('CONTACT');
  lines.push('-'.repeat(40));
  if (profile.email) lines.push(`Email: ${profile.email}`);
  if (profile.linkedin) lines.push(`LinkedIn: ${profile.linkedin}`);
  if (profile.github) lines.push(`GitHub: ${profile.github}`);
  lines.push(`Location: ${profile.location}`);
  if (profile.timezone) lines.push(`Timezone: ${profile.timezone}`);
  lines.push('');

  // Summary
  lines.push('PROFESSIONAL SUMMARY');
  lines.push('-'.repeat(40));
  lines.push(profile.headline);
  lines.push(`${profile.yearsExperience} years of experience`);
  lines.push('');

  // Education
  lines.push('EDUCATION');
  lines.push('-'.repeat(40));
  for (const edu of profile.education) {
    lines.push(`${edu.degree} in ${edu.field} - ${edu.institution}`);
    if (edu.location) lines.push(`  ${edu.location}`);
    if (edu.graduated) lines.push(`  Graduated: ${edu.graduated}`);
  }
  lines.push('');

  // Skills
  lines.push('TECHNICAL SKILLS');
  lines.push('-'.repeat(40));
  lines.push(`Expert: ${profile.skills.expert.join(', ')}`);
  lines.push(`Proficient: ${profile.skills.proficient.join(', ')}`);
  lines.push(`Familiar: ${profile.skills.familiar.join(', ')}`);
  lines.push('');

  // Specializations
  lines.push('SPECIALIZATIONS');
  lines.push('-'.repeat(40));
  for (const spec of profile.specializations) {
    lines.push(`  - ${spec}`);
  }
  lines.push('');

  // Experience
  if (profile.experience && profile.experience.length > 0) {
    lines.push('PROFESSIONAL EXPERIENCE');
    lines.push('-'.repeat(40));
    for (const exp of profile.experience) {
      lines.push(`\n  ${exp.title} — ${exp.company}`);
      lines.push(`  ${exp.location} | ${exp.startDate} – ${exp.endDate}`);
      for (const bullet of exp.bullets) {
        lines.push(`  • ${bullet}`);
      }
    }
    lines.push('');
  }

  // Projects
  lines.push('PROJECTS');
  lines.push('-'.repeat(40));
  for (const project of profile.projects) {
    lines.push(`\n  ${project.name} (${project.role})`);
    lines.push(`  ${project.description}`);
    lines.push(`  Tech: ${project.techStack.join(', ')}`);
    lines.push(`  Outcomes: ${project.outcomes}`);
    if (project.url) lines.push(`  URL: ${project.url}`);
  }
  lines.push('');

  // Value Propositions
  lines.push('VALUE PROPOSITIONS');
  lines.push('-'.repeat(40));
  for (const vp of profile.valueProps) {
    lines.push(`  - ${vp}`);
  }

  return lines.join('\n');
}
