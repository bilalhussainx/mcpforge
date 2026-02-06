import { generatePdf } from '../lib/pdf-generator.js';
import type { ResumeData } from '../types.js';

/**
 * Generate an ATS-optimized PDF resume from structured resume data.
 *
 * @param resumeDataJson - JSON string of ResumeData
 * @param template - Template variant: 'classic', 'modern', or 'minimal'
 * @returns Object with pdf_base64 (base64-encoded PDF) and filename
 */
export async function generateAtsResume(
  resumeDataJson: string,
  template: 'classic' | 'modern' | 'minimal' = 'classic'
): Promise<{ pdf_base64: string; filename: string }> {
  if (!resumeDataJson || resumeDataJson.trim().length === 0) {
    throw new Error('No resume data provided. Please supply a JSON string of parsed resume data.');
  }

  let resumeData: ResumeData;
  try {
    resumeData = JSON.parse(resumeDataJson) as ResumeData;
  } catch {
    throw new Error(
      'Invalid resume data JSON. Please provide a valid JSON string (output from parse_resume tool).'
    );
  }

  // Validate essential fields
  if (!resumeData.name || resumeData.name === 'Unknown') {
    throw new Error(
      'Resume data is missing a name. The "name" field is required to generate a PDF.'
    );
  }

  // Validate template parameter
  const validTemplates = ['classic', 'modern', 'minimal'] as const;
  if (!validTemplates.includes(template)) {
    throw new Error(
      `Invalid template "${template}". Must be one of: ${validTemplates.join(', ')}`
    );
  }

  try {
    const result = await generatePdf(resumeData, template);
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to generate ATS resume PDF: ${message}`);
  }
}
