import { parsePdf } from '../lib/pdf-parser.js';
import { calculateATSScore } from '../lib/ats-rules.js';
import type { ATSScore } from '../types.js';

/**
 * Score a resume PDF for ATS compatibility.
 *
 * Parses the PDF, then applies comprehensive scoring rules across
 * formatting, section headers, parseability, and keyword optimization.
 *
 * @param pdf - Base64-encoded PDF file content
 * @returns ATSScore with overall score, breakdown, issues, and passed checks
 */
export async function scoreAts(pdf: string): Promise<ATSScore> {
  if (!pdf || pdf.trim().length === 0) {
    throw new Error('No PDF content provided. Please supply a base64-encoded PDF string.');
  }

  // Strip potential data URL prefix
  const cleaned = pdf.replace(/^data:application\/pdf;base64,/, '').trim();

  // Basic base64 validation
  if (!/^[A-Za-z0-9+/\s]+=*$/.test(cleaned.slice(0, 200))) {
    throw new Error(
      'The provided string does not appear to be valid base64-encoded content. ' +
      'Ensure the PDF is properly base64-encoded without extra characters.'
    );
  }

  // Step 1: Parse the PDF to get raw text and structured data
  let resumeData;
  try {
    resumeData = await parsePdf(cleaned);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse resume PDF for ATS scoring: ${message}`);
  }

  // Step 2: Apply ATS scoring rules
  try {
    const score = calculateATSScore(resumeData.rawText, resumeData);
    return score;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to calculate ATS score: ${message}`);
  }
}
