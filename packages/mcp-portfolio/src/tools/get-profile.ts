import profileData from '../data/profile.json' with { type: 'json' };
import type { Profile } from '../types.js';

const profile = profileData as unknown as Profile;

export type ProfileSection = 'full' | 'summary' | 'skills' | 'education' | 'experience' | 'projects';

export function getProfile(section?: ProfileSection): Record<string, unknown> {
  switch (section) {
    case 'summary':
      return {
        name: profile.name,
        title: profile.title,
        headline: profile.headline,
        email: profile.email,
        linkedin: profile.linkedin,
        github: profile.github,
        location: profile.location,
        timezone: profile.timezone,
        yearsExperience: profile.yearsExperience,
        specializations: profile.specializations,
        valueProps: profile.valueProps,
      };

    case 'skills':
      return {
        skills: profile.skills,
        specializations: profile.specializations,
        totalSkills:
          profile.skills.expert.length +
          profile.skills.proficient.length +
          profile.skills.familiar.length,
      };

    case 'education':
      return {
        education: profile.education,
        institution: profile.education[0]?.institution,
        degree: `${profile.education[0]?.degree} in ${profile.education[0]?.field}`,
      };

    case 'experience':
      return {
        experience: profile.experience ?? [],
      };

    case 'projects':
      return {
        projects: profile.projects,
      };

    case 'full':
    default:
      return profile as unknown as Record<string, unknown>;
  }
}
