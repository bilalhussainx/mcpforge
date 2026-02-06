import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { parseResume } from './tools/parse-resume.js';
import { extractKeywords } from './tools/extract-keywords.js';
import { optimizeForJob } from './tools/optimize-for-job.js';
import { generateAtsResume } from './tools/generate-ats-resume.js';
import { scoreAts } from './tools/score-ats.js';

/**
 * Create and configure the MCP Resume server with all tools registered.
 */
export function createResumeServer(): McpServer {
  const server = new McpServer({
    name: 'mcp-resume',
    version: '1.0.0',
    description:
      'ATS Resume Optimizer — parse, score, optimize, and generate ATS-friendly resume PDFs',
  });

  // ────────────────────────────────────────────────────────
  // Tool 1: parse_resume
  // ────────────────────────────────────────────────────────
  server.tool(
    'parse_resume',
    'Extract structured data from a resume PDF. Returns name, contact info, summary, skills, experience (with bullet points), education, and certifications.',
    {
      pdf: z.string().describe('Base64-encoded PDF file content'),
    },
    async ({ pdf }) => {
      try {
        const result = await parseResume(pdf);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ error: message }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // ────────────────────────────────────────────────────────
  // Tool 2: extract_keywords
  // ────────────────────────────────────────────────────────
  server.tool(
    'extract_keywords',
    'Extract and classify keywords from a job description. Returns required skills, nice-to-have skills, action verbs, technical terms, and soft skills.',
    {
      job_description: z
        .string()
        .describe('Full text of the job description or job posting'),
    },
    async ({ job_description }) => {
      try {
        const result = await extractKeywords(job_description);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ error: message }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // ────────────────────────────────────────────────────────
  // Tool 3: optimize_for_job
  // ────────────────────────────────────────────────────────
  server.tool(
    'optimize_for_job',
    'Optimize a resume for a specific job description. Compares resume keywords against job requirements, calculates a fit score (0-100), identifies matched/missing keywords, and generates actionable optimization suggestions.',
    {
      resume_data: z
        .string()
        .describe(
          'JSON string of parsed resume data (output from parse_resume tool)'
        ),
      job_description: z
        .string()
        .describe('Full text of the job description or job posting'),
    },
    async ({ resume_data, job_description }) => {
      try {
        const result = await optimizeForJob(resume_data, job_description);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ error: message }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // ────────────────────────────────────────────────────────
  // Tool 4: generate_ats_resume
  // ────────────────────────────────────────────────────────
  server.tool(
    'generate_ats_resume',
    'Generate an ATS-optimized PDF resume from structured data. Supports three template variants: classic (traditional), modern (more spacing, blue accents), and minimal (very clean). Returns a base64-encoded PDF.',
    {
      resume_data: z
        .string()
        .describe(
          'JSON string of resume data (output from parse_resume or manually constructed)'
        ),
      template: z
        .enum(['classic', 'modern', 'minimal'])
        .optional()
        .default('classic')
        .describe(
          'Template variant: "classic" (traditional), "modern" (more spacing), or "minimal" (very clean)'
        ),
    },
    async ({ resume_data, template }) => {
      try {
        const result = await generateAtsResume(resume_data, template);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ error: message }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // ────────────────────────────────────────────────────────
  // Tool 5: score_ats
  // ────────────────────────────────────────────────────────
  server.tool(
    'score_ats',
    'Score a resume PDF for ATS (Applicant Tracking System) compatibility. Evaluates formatting (0-25), section headers (0-25), parseability (0-25), and keyword optimization (0-25) for a total score of 0-100. Returns detailed issues and passed checks.',
    {
      pdf: z.string().describe('Base64-encoded PDF file content'),
    },
    async ({ pdf }) => {
      try {
        const result = await scoreAts(pdf);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ error: message }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  return server;
}
