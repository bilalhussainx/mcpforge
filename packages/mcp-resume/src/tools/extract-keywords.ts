import { analyzeJobDescription } from '../lib/keyword-matcher.js';
import type { KeywordAnalysis } from '../types.js';

/**
 * Extract and classify keywords from a job description.
 *
 * Identifies required skills, nice-to-have skills, action verbs,
 * technical terms, and soft skills from the job posting text.
 *
 * @param jobDescription - Full text of the job description/posting
 * @returns KeywordAnalysis with classified keywords
 */
export async function extractKeywords(jobDescription: string): Promise<KeywordAnalysis> {
  if (!jobDescription || jobDescription.trim().length === 0) {
    throw new Error('No job description provided. Please supply the full text of the job posting.');
  }

  if (jobDescription.trim().length < 20) {
    throw new Error(
      'Job description is too short to extract meaningful keywords. ' +
      'Please provide the full job posting text (at least a few sentences).'
    );
  }

  try {
    const analysis = analyzeJobDescription(jobDescription);

    // Provide useful defaults if nothing was found
    if (
      analysis.required_skills.length === 0 &&
      analysis.nice_to_have.length === 0 &&
      analysis.technical_terms.length === 0
    ) {
      return {
        ...analysis,
        required_skills: [],
        nice_to_have: [],
        action_verbs: analysis.action_verbs,
        technical_terms: [],
        soft_skills: analysis.soft_skills,
      };
    }

    return analysis;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to extract keywords: ${message}`);
  }
}
