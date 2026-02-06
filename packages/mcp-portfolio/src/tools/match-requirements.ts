import profileData from '../data/profile.json' with { type: 'json' };
import type {
  Profile,
  FitAnalysis,
  RequirementMatch,
  RequirementGap,
  SkillLevel,
} from '../types.js';

const profile = profileData as Profile;

/** All skills flattened with their proficiency level */
function getAllSkillsWithLevel(): Array<{ skill: string; level: SkillLevel }> {
  const result: Array<{ skill: string; level: SkillLevel }> = [];
  const levels: SkillLevel[] = ['expert', 'proficient', 'familiar'];
  for (const level of levels) {
    for (const skill of profile.skills[level]) {
      result.push({ skill, level });
    }
  }
  return result;
}

/** All text corpus for broad matching */
function buildSearchCorpus(): string {
  const parts: string[] = [
    profile.headline,
    profile.title,
    ...profile.specializations,
    ...profile.valueProps,
    ...profile.projects.flatMap((p) => [
      p.name,
      p.description,
      p.outcomes,
      p.role,
      ...p.techStack,
      ...p.relevantFor,
    ]),
    ...getAllSkillsWithLevel().map((s) => s.skill),
  ];
  return parts.join(' ').toLowerCase();
}

/** Keyword aliases to broaden matching */
const KEYWORD_EXPANSIONS: Record<string, string[]> = {
  frontend: ['react', 'next.js', 'javascript', 'typescript', 'tailwind', 'css', 'redux', 'html5'],
  backend: ['python', 'django', 'django rest framework', 'node.js', 'express', 'api', 'server', 'postgresql'],
  'full-stack': ['react', 'django', 'python', 'node.js', 'full-stack', 'frontend', 'backend', 'fullstack'],
  fullstack: ['react', 'django', 'python', 'node.js', 'full-stack', 'frontend', 'backend'],
  database: ['postgresql', 'mongodb', 'redis'],
  django: ['django', 'django rest framework', 'python', 'postgresql'],
  'django rest framework': ['django', 'python', 'restful api design'],
  blockchain: ['solidity', 'avalanche', 'web3auth', 'defi', 'web3', 'smart contract'],
  web3: ['solidity', 'avalanche', 'web3auth', 'blockchain', 'defi'],
  ai: ['claude code', 'langgraph', 'rag', 'multi-agent', 'ollama', 'llm', 'agents', 'prompt engineering'],
  rag: ['rag pipelines', 'langgraph', 'ai', 'llm', 'multi-agent'],
  'multi-agent': ['langgraph', 'multi-agent ai systems', 'agents', 'rag'],
  agents: ['langgraph', 'multi-agent ai systems', 'rag', 'ai'],
  llm: ['claude code', 'ollama', 'llama 3.1', 'mistral 7b', 'prompt engineering', 'rag'],
  ml: ['ai', 'python', 'langgraph', 'ollama', 'rag'],
  'machine learning': ['ai', 'python', 'langgraph', 'ollama', 'rag'],
  testing: ['playwright', 'jest', 'e2e', 'test'],
  devops: ['docker', 'aws', 'ci/cd'],
  cloud: ['aws', 'docker'],
  'real-time': ['websocket', 'webrtc', 'socket'],
  realtime: ['websocket', 'webrtc', 'socket'],
  authentication: ['jwt', 'web3auth', 'auth'],
  auth: ['jwt', 'web3auth', 'authentication'],
  agile: ['full-stack', 'development'],
  react: ['react', 'next.js', 'redux', 'frontend'],
  node: ['node.js', 'express', 'backend'],
  'node.js': ['node.js', 'express', 'backend'],
  typescript: ['typescript', 'javascript'],
  python: ['python', 'django', 'django rest framework', 'langgraph'],
  css: ['tailwind css', 'css3', 'html5'],
  api: ['django rest framework', 'express', 'restful api design', 'graphql'],
  rest: ['django rest framework', 'express', 'restful api design'],
  'prompt engineering': ['claude code', 'prompt engineering', 'ai'],
};

function matchRequirement(requirement: string): RequirementMatch | null {
  const normalized = requirement.toLowerCase().trim();
  const corpus = buildSearchCorpus();
  const allSkills = getAllSkillsWithLevel();

  // 1. Try exact skill match
  for (const { skill, level } of allSkills) {
    if (normalized.includes(skill.toLowerCase()) || skill.toLowerCase().includes(normalized)) {
      const strengthMap: Record<SkillLevel, 'exact' | 'strong' | 'partial'> = {
        expert: 'exact',
        proficient: 'strong',
        familiar: 'partial',
      };

      const projectEvidence = profile.projects
        .filter(
          (p) =>
            p.techStack.some((t) => t.toLowerCase() === skill.toLowerCase()) ||
            p.description.toLowerCase().includes(skill.toLowerCase())
        )
        .map((p) => p.name);

      const evidenceParts = [`${skill} - ${level} level`];
      if (projectEvidence.length > 0) {
        evidenceParts.push(`Used in: ${projectEvidence.join(', ')}`);
      }

      return {
        requirement,
        matched: true,
        evidence: evidenceParts.join('. '),
        strength: strengthMap[level],
      };
    }
  }

  // 2. Try keyword expansion matching
  for (const [keyword, expansions] of Object.entries(KEYWORD_EXPANSIONS)) {
    if (normalized.includes(keyword)) {
      // Check if any expansion matches a skill
      for (const expansion of expansions) {
        for (const { skill, level } of allSkills) {
          if (skill.toLowerCase() === expansion || skill.toLowerCase().includes(expansion)) {
            const projectEvidence = profile.projects
              .filter(
                (p) =>
                  p.techStack.some((t) => t.toLowerCase().includes(expansion)) ||
                  p.relevantFor.some((r) => r.toLowerCase().includes(keyword)) ||
                  p.description.toLowerCase().includes(keyword)
              )
              .map((p) => p.name);

            const evidenceParts = [
              `Related skill: ${skill} (${level})`,
            ];
            if (projectEvidence.length > 0) {
              evidenceParts.push(`Relevant projects: ${projectEvidence.join(', ')}`);
            }

            return {
              requirement,
              matched: true,
              evidence: evidenceParts.join('. '),
              strength: level === 'expert' ? 'strong' : 'partial',
            };
          }
        }
      }
    }
  }

  // 3. Try corpus text search for broader matches
  const words = normalized.split(/\s+/).filter((w) => w.length > 2);
  const matchedWords = words.filter((word) => corpus.includes(word));

  if (matchedWords.length > 0 && matchedWords.length >= words.length * 0.4) {
    // Find which projects or value props relate
    const relevantProjects = profile.projects.filter((p) => {
      const projectText =
        `${p.description} ${p.outcomes} ${p.techStack.join(' ')} ${p.relevantFor.join(' ')}`.toLowerCase();
      return matchedWords.some((w) => projectText.includes(w));
    });

    const relevantValueProps = profile.valueProps.filter((vp) =>
      matchedWords.some((w) => vp.toLowerCase().includes(w))
    );

    const evidenceParts: string[] = [];
    if (relevantProjects.length > 0) {
      evidenceParts.push(
        `Related projects: ${relevantProjects.map((p) => p.name).join(', ')}`
      );
    }
    if (relevantValueProps.length > 0) {
      evidenceParts.push(`Value prop: ${relevantValueProps[0]}`);
    }
    if (evidenceParts.length === 0) {
      evidenceParts.push(`Matched keywords in profile: ${matchedWords.join(', ')}`);
    }

    return {
      requirement,
      matched: true,
      evidence: evidenceParts.join('. '),
      strength: 'partial',
    };
  }

  return null;
}

function generateGapMitigation(requirement: string): string {
  const normalized = requirement.toLowerCase();

  // Context-specific mitigations
  if (normalized.includes('years') || normalized.includes('senior') || normalized.includes('lead')) {
    return `${profile.yearsExperience} years of experience with demonstrated senior-level ownership across multiple production projects. Harvard CS foundation accelerates learning curve.`;
  }
  if (normalized.includes('team') || normalized.includes('leadership') || normalized.includes('management')) {
    return 'Demonstrated technical leadership as sole developer on multiple complex projects (EssayMentor, CoreZenith, MCPForge). Strong collaboration at Penomo Protocol.';
  }
  if (normalized.includes('deploy') || normalized.includes('ci') || normalized.includes('cd') || normalized.includes('devops')) {
    return 'Familiar with Docker and AWS. Deployed multiple production applications. Strong fundamentals enable rapid upskilling in DevOps tooling.';
  }
  if (normalized.includes('mobile') || normalized.includes('ios') || normalized.includes('android') || normalized.includes('react native')) {
    return 'Deep React expertise transfers directly to React Native. Strong JavaScript/TypeScript foundation makes mobile transition straightforward.';
  }
  if (normalized.includes('java') || normalized.includes('c#') || normalized.includes('c++') || normalized.includes('.net')) {
    return 'Harvard CS provides strong language-agnostic fundamentals. TypeScript experience with strict typing maps well to statically-typed languages.';
  }

  // Generic mitigation
  return `While not a direct match, ${profile.yearsExperience} years of full-stack experience and Harvard CS education provide strong fundamentals for rapid skill acquisition. AI-first workflow enables faster learning and adaptation.`;
}

function selectHighlights(
  matchedReqs: RequirementMatch[],
  gaps: RequirementGap[]
): string[] {
  const highlights: string[] = [];

  // Always lead with strongest differentiators
  const exactMatches = matchedReqs.filter((m) => m.strength === 'exact');
  if (exactMatches.length > 0) {
    highlights.push(
      `Expert-level match on ${exactMatches.length} requirement(s): ${exactMatches.map((m) => m.requirement).slice(0, 3).join(', ')}`
    );
  }

  // Add value props based on what was matched
  const allEvidence = matchedReqs.map((m) => m.evidence.toLowerCase()).join(' ');

  if (allEvidence.includes('ai') || allEvidence.includes('claude') || allEvidence.includes('agent')) {
    highlights.push(profile.valueProps[0]!); // AI-first development
  }
  if (allEvidence.includes('blockchain') || allEvidence.includes('harvard')) {
    highlights.push(profile.valueProps[1]!); // Harvard + blockchain
  }
  if (allEvidence.includes('agent') || allEvidence.includes('langgraph')) {
    highlights.push(profile.valueProps[2]!); // Multi-agent systems
  }
  if (allEvidence.includes('react') || allEvidence.includes('node') || allEvidence.includes('full')) {
    highlights.push(profile.valueProps[3]!); // Full-stack depth
  }

  // Ensure we have at least 3 highlights, dedup
  const uniqueHighlights = [...new Set(highlights)];
  if (uniqueHighlights.length < 3) {
    for (const vp of profile.valueProps) {
      if (!uniqueHighlights.includes(vp)) {
        uniqueHighlights.push(vp);
      }
      if (uniqueHighlights.length >= 3) break;
    }
  }

  return uniqueHighlights.slice(0, 3);
}

export function matchRequirements(requirements: string[]): FitAnalysis {
  const matchedRequirements: RequirementMatch[] = [];
  const gaps: RequirementGap[] = [];

  for (const req of requirements) {
    const match = matchRequirement(req);
    if (match) {
      matchedRequirements.push(match);
    } else {
      matchedRequirements.push({
        requirement: req,
        matched: false,
        evidence: 'No direct match found in profile.',
        strength: 'partial',
      });
      gaps.push({
        requirement: req,
        mitigation: generateGapMitigation(req),
      });
    }
  }

  // Calculate fit score
  const totalRequirements = requirements.length;
  if (totalRequirements === 0) {
    return {
      fitScore: 0,
      matchedRequirements: [],
      gaps: [],
      highlights: profile.valueProps.slice(0, 3),
    };
  }

  let score = 0;
  for (const match of matchedRequirements) {
    if (!match.matched) continue;
    switch (match.strength) {
      case 'exact':
        score += 100;
        break;
      case 'strong':
        score += 75;
        break;
      case 'partial':
        score += 40;
        break;
    }
  }

  const fitScore = Math.min(100, Math.round(score / totalRequirements));
  const highlights = selectHighlights(matchedRequirements, gaps);

  return {
    fitScore,
    matchedRequirements,
    gaps,
    highlights,
  };
}
