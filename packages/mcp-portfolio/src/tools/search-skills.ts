import profileData from '../data/profile.json' with { type: 'json' };
import type { Profile, SkillLevel, SkillMatch } from '../types.js';

const profile = profileData as Profile;

const SKILL_ALIASES: Record<string, string[]> = {
  react: ['next.js', 'jsx', 'frontend'],
  'next.js': ['react', 'vercel', 'ssr'],
  'node.js': ['express', 'backend', 'server'],
  typescript: ['javascript', 'js', 'ts'],
  javascript: ['typescript', 'js', 'ts'],
  mongodb: ['mongoose', 'nosql', 'database'],
  postgresql: ['postgres', 'sql', 'database'],
  python: ['django', 'flask', 'ml'],
  solidity: ['blockchain', 'smart contracts', 'ethereum', 'avalanche', 'web3'],
  avalanche: ['blockchain', 'solidity', 'web3', 'defi'],
  docker: ['containers', 'devops', 'kubernetes'],
  aws: ['cloud', 'infrastructure', 'devops'],
  'claude api': ['ai', 'llm', 'anthropic', 'claude'],
  'claude code': ['ai', 'llm', 'anthropic', 'claude'],
  langgraph: ['agents', 'ai', 'llm', 'langchain'],
  ollama: ['ai', 'llm', 'local models'],
  websocket: ['real-time', 'socket', 'ws'],
  playwright: ['testing', 'e2e', 'automation'],
  'tailwind css': ['css', 'styling', 'ui'],
  graphql: ['api', 'query language'],
  redis: ['cache', 'database', 'in-memory'],
  supabase: ['database', 'backend', 'postgresql', 'baas'],
  jwt: ['auth', 'authentication', 'security'],
  web3auth: ['auth', 'web3', 'blockchain', 'authentication'],
  git: ['version control', 'github', 'source control'],
  express: ['node.js', 'backend', 'api', 'server'],
};

export interface SearchSkillsResult {
  matches: SkillMatch[];
  relatedSkills: string[];
  query: string;
  totalMatches: number;
}

export function searchSkills(query: string): SearchSkillsResult {
  const normalizedQuery = query.toLowerCase().trim();
  const matches: SkillMatch[] = [];
  const relatedSkillsSet = new Set<string>();

  const levels: SkillLevel[] = ['expert', 'proficient', 'familiar'];

  for (const level of levels) {
    for (const skill of profile.skills[level]) {
      const normalizedSkill = skill.toLowerCase();

      // Exact match
      if (normalizedSkill === normalizedQuery) {
        matches.push({ skill, level, query: normalizedQuery });
        addRelatedSkills(normalizedSkill, relatedSkillsSet, skill);
        continue;
      }

      // Substring match (query is part of skill name or vice versa)
      if (
        normalizedSkill.includes(normalizedQuery) ||
        normalizedQuery.includes(normalizedSkill)
      ) {
        matches.push({ skill, level, query: normalizedQuery });
        addRelatedSkills(normalizedSkill, relatedSkillsSet, skill);
        continue;
      }

      // Check if query matches any alias of this skill
      const aliases = SKILL_ALIASES[normalizedSkill];
      if (aliases) {
        const aliasMatch = aliases.some(
          (alias) =>
            alias.includes(normalizedQuery) ||
            normalizedQuery.includes(alias)
        );
        if (aliasMatch) {
          matches.push({ skill, level, query: normalizedQuery });
          addRelatedSkills(normalizedSkill, relatedSkillsSet, skill);
        }
      }
    }
  }

  // Also check if query matches alias keys pointing to skills we haven't matched yet
  for (const [aliasKey, aliasValues] of Object.entries(SKILL_ALIASES)) {
    if (
      aliasKey.includes(normalizedQuery) ||
      normalizedQuery.includes(aliasKey)
    ) {
      for (const relatedAlias of aliasValues) {
        // Find if any profile skill matches this related alias
        for (const level of levels) {
          for (const skill of profile.skills[level]) {
            if (skill.toLowerCase() === relatedAlias) {
              const alreadyMatched = matches.some(
                (m) => m.skill.toLowerCase() === skill.toLowerCase()
              );
              if (!alreadyMatched) {
                relatedSkillsSet.add(skill);
              }
            }
          }
        }
      }
    }
  }

  // Remove matched skills from related skills
  for (const match of matches) {
    relatedSkillsSet.delete(match.skill);
  }

  return {
    matches,
    relatedSkills: Array.from(relatedSkillsSet),
    query: normalizedQuery,
    totalMatches: matches.length,
  };
}

function addRelatedSkills(
  normalizedSkill: string,
  relatedSet: Set<string>,
  _matchedSkill: string
): void {
  const aliases = SKILL_ALIASES[normalizedSkill];
  if (!aliases) return;

  const levels: SkillLevel[] = ['expert', 'proficient', 'familiar'];

  for (const alias of aliases) {
    for (const level of levels) {
      for (const skill of profile.skills[level]) {
        if (skill.toLowerCase() === alias) {
          relatedSet.add(skill);
        }
      }
    }
  }
}
