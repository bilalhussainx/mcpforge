import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { getProfile } from './tools/get-profile.js';
import { searchSkills } from './tools/search-skills.js';
import { getProjects } from './tools/get-projects.js';
import { matchRequirements } from './tools/match-requirements.js';
import { getResumeText } from './resources/resume-resource.js';
import {
  getProjectBySlug,
  getProjectSlugs,
  formatProjectText,
} from './resources/project-resource.js';

export function createPortfolioServer(): McpServer {
  const server = new McpServer({
    name: 'mcp-portfolio',
    version: '1.0.0',
  });

  // ─── Tool: get_profile ───────────────────────────────────────────
  server.tool(
    'get_profile',
    'Returns developer profile data. Use the section parameter to get a specific section (summary, skills, education) or the full profile.',
    {
      section: z
        .enum(['full', 'summary', 'skills', 'education', 'experience', 'projects'])
        .optional()
        .describe(
          'Which section to return: "full" (default), "summary", "skills", "education", "experience", or "projects"'
        ),
    },
    async ({ section }) => {
      const result = getProfile(section ?? 'full');
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // ─── Tool: search_skills ─────────────────────────────────────────
  server.tool(
    'search_skills',
    'Search for skills in the developer portfolio. Returns matched skills with proficiency levels, related skills, and the query. Supports partial and fuzzy matching.',
    {
      query: z
        .string()
        .describe(
          'The skill or technology to search for (e.g. "react", "blockchain", "ai")'
        ),
    },
    async ({ query }) => {
      const result = searchSkills(query);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // ─── Tool: get_projects ──────────────────────────────────────────
  server.tool(
    'get_projects',
    'Returns projects from the developer portfolio. Optionally filter by technology, keyword, or domain. Returns all projects if no filter is given.',
    {
      filter: z
        .string()
        .optional()
        .describe(
          'Optional filter string to match projects by name, tech stack, relevance tags, or description keywords'
        ),
    },
    async ({ filter }) => {
      const result = getProjects(filter);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // ─── Tool: match_requirements ────────────────────────────────────
  server.tool(
    'match_requirements',
    'Analyzes how well the developer profile matches a list of job requirements. Returns a fit score (0-100), matched requirements with evidence and strength, gaps with mitigation suggestions, and top highlights.',
    {
      requirements: z
        .array(z.string())
        .describe(
          'Array of job requirement strings to match against the developer profile'
        ),
    },
    async ({ requirements }) => {
      const result = matchRequirements(requirements);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // ─── Resource: portfolio://resume ────────────────────────────────
  server.resource(
    'resume',
    'portfolio://resume',
    {
      description: 'Full developer resume as structured text',
      mimeType: 'text/plain',
    },
    async (uri) => {
      const text = getResumeText();
      return {
        contents: [
          {
            uri: uri.href,
            text,
            mimeType: 'text/plain',
          },
        ],
      };
    }
  );

  // ─── Resource Template: portfolio://projects/{slug} ──────────────
  server.resource(
    'project',
    new ResourceTemplate('portfolio://projects/{slug}', {
      list: async () => {
        const slugs = getProjectSlugs();
        return {
          resources: slugs.map((slug) => ({
            uri: `portfolio://projects/${slug}`,
            name: `Project: ${slug}`,
            description: `Portfolio project data for ${slug}`,
            mimeType: 'text/plain' as const,
          })),
        };
      },
    }),
    {
      description: 'Individual project data by slug',
      mimeType: 'text/plain',
    },
    async (uri, { slug }) => {
      const project = getProjectBySlug(slug as string);
      if (!project) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Project not found: ${slug}`,
              mimeType: 'text/plain',
            },
          ],
        };
      }
      return {
        contents: [
          {
            uri: uri.href,
            text: formatProjectText(project),
            mimeType: 'text/plain',
          },
        ],
      };
    }
  );

  return server;
}
