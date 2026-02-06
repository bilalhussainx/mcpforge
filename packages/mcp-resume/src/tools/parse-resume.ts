import { parsePdf } from '../lib/pdf-parser.js';
import type { ResumeData } from '../types.js';

/**
 * Parse a base64-encoded PDF resume and extract structured data.
 *
 * @param pdf - Base64-encoded PDF file content
 * @returns Structured ResumeData
 */
export async function parseResume(pdf: string): Promise<ResumeData> {
  if (!pdf || pdf.trim().length === 0) {
    throw new Error('No PDF content provided. Please supply a base64-encoded PDF string.');
  }

  // Strip potential data URL prefix (e.g., "data:application/pdf;base64,")
  const cleaned = pdf.replace(/^data:application\/pdf;base64,/, '').trim();

  // Basic validation: check that it looks like base64
  if (!/^[A-Za-z0-9+/\s]+=*$/.test(cleaned.slice(0, 200))) {
    throw new Error(
      'The provided string does not appear to be valid base64-encoded content. ' +
      'Ensure the PDF is properly base64-encoded without extra characters.'
    );
  }

  try {
    const resumeData = await parsePdf(cleaned);
    return resumeData;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse resume PDF: ${message}`);
  }
}
