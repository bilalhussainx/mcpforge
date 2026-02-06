import pdfParse from 'pdf-parse';
import type { ResumeData, WorkExperience, Education } from '../types.js';

// ────────────────────────────────────────────────────────
// Section heading patterns (ALL CAPS, Title Case, with/without colons, underlines)
// ────────────────────────────────────────────────────────

const SECTION_PATTERNS: Record<string, RegExp> = {
  summary: /^[\s]*(?:PROFESSIONAL\s+SUMMARY|SUMMARY|PROFILE|ABOUT\s*ME|EXECUTIVE\s+SUMMARY|CAREER\s+SUMMARY|OBJECTIVE|CAREER\s+OBJECTIVE|Professional\s+Summary|Summary|Profile|About\s*Me|Executive\s+Summary|Career\s+Summary|Objective|Career\s+Objective)\s*:?\s*$/im,
  experience: /^[\s]*(?:PROFESSIONAL\s+EXPERIENCE|WORK\s+EXPERIENCE|EXPERIENCE|EMPLOYMENT\s+HISTORY|EMPLOYMENT|WORK\s+HISTORY|RELEVANT\s+EXPERIENCE|Professional\s+Experience|Work\s+Experience|Experience|Employment\s+History|Employment|Work\s+History|Relevant\s+Experience)\s*:?\s*$/im,
  education: /^[\s]*(?:EDUCATION|ACADEMIC\s+BACKGROUND|ACADEMIC\s+HISTORY|EDUCATIONAL\s+BACKGROUND|Education|Academic\s+Background|Academic\s+History|Educational\s+Background)\s*:?\s*$/im,
  skills: /^[\s]*(?:SKILLS|TECHNICAL\s+SKILLS|CORE\s+COMPETENCIES|KEY\s+SKILLS|TECHNOLOGIES|TECH\s+STACK|AREAS\s+OF\s+EXPERTISE|PROFICIENCIES|Skills|Technical\s+Skills|Core\s+Competencies|Key\s+Skills|Technologies|Tech\s+Stack|Areas\s+of\s+Expertise|Proficiencies)\s*:?\s*$/im,
  certifications: /^[\s]*(?:CERTIFICATIONS|CERTIFICATES|LICENSES|CREDENTIALS|PROFESSIONAL\s+CERTIFICATIONS|Certifications|Certificates|Licenses|Credentials|Professional\s+Certifications)\s*:?\s*$/im,
  projects: /^[\s]*(?:PROJECTS|KEY\s+PROJECTS|NOTABLE\s+PROJECTS|PERSONAL\s+PROJECTS|Projects|Key\s+Projects|Notable\s+Projects|Personal\s+Projects)\s*:?\s*$/im,
};

const SECTION_ORDER = ['summary', 'experience', 'education', 'skills', 'certifications', 'projects'] as const;

// ────────────────────────────────────────────────────────
// Contact info extraction
// ────────────────────────────────────────────────────────

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE_RE = /(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/;
const LOCATION_PATTERNS = [
  // City, ST  or  City, State
  /([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})\b/,
  // City, State ZIP
  /([A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z]+\s+\d{5})/,
  // City, Country
  /([A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z\s]+)/,
];

// ────────────────────────────────────────────────────────
// Date patterns
// ────────────────────────────────────────────────────────

const DATE_RANGE_RE = /(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|Winter|Spring|Summer|Fall)[\s,]*)?(\d{4})\s*[-–—to]+\s*(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|Winter|Spring|Summer|Fall)[\s,]*)?(\d{4}|[Pp]resent|[Cc]urrent)/;

const SINGLE_DATE_RE = /(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[\s,]+)?(\d{4})/;

const DATE_LINE_RE = /(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|Winter|Spring|Summer|Fall)[\s,]*)?(\d{4})\s*[-–—to]+\s*(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|Winter|Spring|Summer|Fall)[\s,]*)?((?:\d{4})|[Pp]resent|[Cc]urrent)/;

// ────────────────────────────────────────────────────────
// Degree patterns
// ────────────────────────────────────────────────────────

const DEGREE_RE = /(?:Bachelor(?:'s)?|Master(?:'s)?|Doctor(?:ate)?|Ph\.?D\.?|M\.?B\.?A\.?|M\.?S\.?|B\.?S\.?|B\.?A\.?|A\.?S\.?|A\.?A\.?|Associate(?:'s)?|B\.?Sc\.?|M\.?Sc\.?|B\.?Eng\.?|M\.?Eng\.?|Diploma|Certificate)(?:\s+(?:of|in|for))?\s+(?:[A-Z][a-zA-Z\s,&]+)?/i;

// ────────────────────────────────────────────────────────
// Main parse function
// ────────────────────────────────────────────────────────

export async function parsePdf(base64: string): Promise<ResumeData> {
  const buffer = Buffer.from(base64, 'base64');

  let rawText: string;
  try {
    const data = await pdfParse(buffer);
    rawText = data.text;
  } catch (err) {
    throw new Error(`Failed to parse PDF: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (!rawText || rawText.trim().length === 0) {
    throw new Error('PDF contained no extractable text. The file may be an image-only PDF.');
  }

  const lines = rawText.split('\n').map(l => l.trimEnd());

  // Extract contact info from the top portion (first ~15 lines)
  const headerBlock = lines.slice(0, 15).join('\n');

  const email = extractEmail(headerBlock);
  const phone = extractPhone(headerBlock);
  const location = extractLocation(headerBlock);

  // Determine name: usually the first non-empty line
  const name = extractName(lines);

  // Identify section boundaries
  const sections = identifySections(lines);

  // Extract structured data from sections
  const summary = extractSummary(lines, sections);
  const title = extractTitle(lines, sections, name);
  const skills = extractSkills(lines, sections);
  const experience = extractExperience(lines, sections);
  const education = extractEducation(lines, sections);
  const certifications = extractCertifications(lines, sections);

  return {
    name,
    email,
    phone,
    location,
    title,
    summary,
    skills,
    experience,
    education,
    certifications,
    rawText,
  };
}

// ────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────

function extractEmail(text: string): string | null {
  const m = text.match(EMAIL_RE);
  return m ? m[0] : null;
}

function extractPhone(text: string): string | null {
  const m = text.match(PHONE_RE);
  return m ? m[0].trim() : null;
}

function extractLocation(text: string): string | null {
  for (const pat of LOCATION_PATTERNS) {
    const m = text.match(pat);
    if (m) return m[1]!.trim();
  }
  return null;
}

function extractName(lines: string[]): string {
  // The name is typically the first non-empty, non-email, non-phone line that
  // is not a section header. Often it's the very first line.
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (EMAIL_RE.test(trimmed)) continue;
    if (/^\+?\d[\d\s.()-]{7,}$/.test(trimmed)) continue;
    // Skip if it matches a section header
    let isHeader = false;
    for (const pat of Object.values(SECTION_PATTERNS)) {
      if (pat.test(trimmed)) { isHeader = true; break; }
    }
    if (isHeader) continue;
    // Likely the name
    return trimmed;
  }
  return 'Unknown';
}

function extractTitle(lines: string[], sections: Map<string, { start: number; end: number }>, name: string): string | null {
  // The title is often the line right after the name, before any section header
  const nameIndex = lines.findIndex(l => l.trim() === name);
  if (nameIndex === -1) return null;

  // Look at the next few non-empty lines before the first section
  const firstSectionStart = getFirstSectionStart(sections);
  for (let i = nameIndex + 1; i < Math.min(nameIndex + 5, firstSectionStart, lines.length); i++) {
    const trimmed = lines[i]!.trim();
    if (!trimmed) continue;
    if (EMAIL_RE.test(trimmed)) continue;
    if (PHONE_RE.test(trimmed)) continue;
    // Check for location-like patterns
    if (LOCATION_PATTERNS.some(p => p.test(trimmed))) continue;
    // This could be a title (e.g. "Senior Software Engineer")
    if (trimmed.length > 3 && trimmed.length < 80) {
      return trimmed;
    }
  }
  return null;
}

interface SectionBounds {
  start: number;
  end: number;
}

function identifySections(lines: string[]): Map<string, SectionBounds> {
  const found: Array<{ key: string; lineIndex: number }> = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i]!.trim();
    if (!trimmed) continue;
    for (const [key, pat] of Object.entries(SECTION_PATTERNS)) {
      if (pat.test(trimmed)) {
        found.push({ key, lineIndex: i });
        break; // one match per line
      }
    }
  }

  // Sort by lineIndex (should already be sorted, but be safe)
  found.sort((a, b) => a.lineIndex - b.lineIndex);

  const sections = new Map<string, SectionBounds>();
  for (let i = 0; i < found.length; i++) {
    const entry = found[i]!;
    const nextStart = i + 1 < found.length ? found[i + 1]!.lineIndex : lines.length;
    sections.set(entry.key, {
      start: entry.lineIndex + 1, // content starts after the heading
      end: nextStart,
    });
  }

  return sections;
}

function getFirstSectionStart(sections: Map<string, SectionBounds>): number {
  let min = Infinity;
  for (const { start } of sections.values()) {
    if (start - 1 < min) min = start - 1; // heading line is start-1
  }
  return min === Infinity ? Infinity : min;
}

function getSectionLines(lines: string[], sections: Map<string, SectionBounds>, key: string): string[] {
  const bounds = sections.get(key);
  if (!bounds) return [];
  return lines.slice(bounds.start, bounds.end);
}

function extractSummary(lines: string[], sections: Map<string, SectionBounds>): string | null {
  const sectionLines = getSectionLines(lines, sections, 'summary');
  if (sectionLines.length === 0) return null;
  const text = sectionLines
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .join(' ')
    .trim();
  return text || null;
}

function extractSkills(lines: string[], sections: Map<string, SectionBounds>): string[] {
  const sectionLines = getSectionLines(lines, sections, 'skills');
  if (sectionLines.length === 0) return [];

  const skills: string[] = [];
  for (const line of sectionLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Handle "Category: skill1, skill2, skill3" format
    const colonIdx = trimmed.indexOf(':');
    const skillPart = colonIdx !== -1 ? trimmed.slice(colonIdx + 1) : trimmed;

    // Split by commas, pipes, semicolons, or bullet characters
    const parts = skillPart.split(/[,|;•·●■▪►▸–—]/).map(s => s.trim()).filter(s => s.length > 0);
    for (const part of parts) {
      // Remove leading/trailing dashes or bullets
      const cleaned = part.replace(/^[\-\s*]+/, '').replace(/[\-\s*]+$/, '').trim();
      if (cleaned.length > 0 && cleaned.length < 60) {
        skills.push(cleaned);
      }
    }
  }

  return [...new Set(skills)];
}

function extractExperience(lines: string[], sections: Map<string, SectionBounds>): WorkExperience[] {
  const sectionLines = getSectionLines(lines, sections, 'experience');
  if (sectionLines.length === 0) return [];

  const experiences: WorkExperience[] = [];
  let current: Partial<WorkExperience> | null = null;
  let currentBullets: string[] = [];

  for (let i = 0; i < sectionLines.length; i++) {
    const line = sectionLines[i]!;
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if this line has a date range (indicator of a new experience entry)
    const dateMatch = trimmed.match(DATE_LINE_RE);

    // Detect if this is a new entry header:
    // Heuristic: a line with a date range, or a line that is not a bullet and
    // follows a blank line or is the first line
    const isBullet = /^[•·●■▪►▸\-*]\s/.test(trimmed) || /^\d+[.)]\s/.test(trimmed);

    if (dateMatch && !isBullet) {
      // Save previous entry
      if (current) {
        experiences.push(finalizeExperience(current, currentBullets));
      }

      // Parse new entry
      const startDate = buildDateString(dateMatch[1], dateMatch[2]!);
      const endDate = buildDateString(dateMatch[3], dateMatch[4]!);

      // The company/title might be on this line or the previous non-empty line
      const beforeDate = trimmed.replace(DATE_LINE_RE, '').trim().replace(/[|,\-–—]+$/, '').trim();

      // Try to split into company and title
      const { company, title } = parseCompanyTitle(beforeDate, sectionLines, i);

      current = { company, title, startDate, endDate };
      currentBullets = [];
    } else if (isBullet && current) {
      // This is a bullet point for the current entry
      const bulletText = trimmed.replace(/^[•·●■▪►▸\-*]\s*/, '').replace(/^\d+[.)]\s*/, '').trim();
      if (bulletText) currentBullets.push(bulletText);
    } else if (!isBullet && current && !dateMatch) {
      // Could be a continuation line or sub-header (title/company on separate line)
      // If the current entry has no title yet, this might be the title
      if (current.title === '' && trimmed.length < 80) {
        current.title = trimmed;
      } else if (current.company === '' && trimmed.length < 80) {
        current.company = trimmed;
      }
      // Otherwise, might be a non-bulleted description line; treat as bullet
      else if (trimmed.length > 20) {
        currentBullets.push(trimmed);
      }
    } else if (!current && !isBullet) {
      // First line before any date — could be company name
      // We'll try to start an entry if the next lines have a date
      const nextLines = sectionLines.slice(i + 1, i + 4).join(' ');
      const nextDate = nextLines.match(DATE_LINE_RE);
      if (nextDate) {
        current = { company: trimmed, title: '' };
        currentBullets = [];
      }
    }
  }

  // Save last entry
  if (current) {
    experiences.push(finalizeExperience(current, currentBullets));
  }

  return experiences;
}

function buildDateString(month: string | undefined, year: string): string {
  if (!year) return '';
  const y = year.trim();
  if (month) return `${month.trim()} ${y}`;
  return y;
}

function parseCompanyTitle(beforeDate: string, sectionLines: string[], currentIdx: number): { company: string; title: string } {
  // Common patterns:
  // "Company Name | Job Title"
  // "Company Name — Job Title"
  // "Job Title at Company Name"
  // "Company Name" on one line, "Job Title" on the next (or vice-versa)

  // Try splitting by pipe or dash
  const separators = /\s*[|–—]\s*/;
  const parts = beforeDate.split(separators).filter(p => p.trim().length > 0);

  if (parts.length >= 2) {
    return { company: parts[0]!.trim(), title: parts[1]!.trim() };
  }

  // Try "at" pattern
  const atMatch = beforeDate.match(/^(.+?)\s+at\s+(.+)$/i);
  if (atMatch) {
    return { company: atMatch[2]!.trim(), title: atMatch[1]!.trim() };
  }

  // Check previous line for the other part
  if (currentIdx > 0) {
    const prevLine = sectionLines[currentIdx - 1]?.trim() ?? '';
    if (prevLine && !DATE_LINE_RE.test(prevLine) && !/^[•·●■▪►▸\-*]\s/.test(prevLine)) {
      // Previous line might be company, current line before date is title, or vice versa
      return { company: prevLine, title: beforeDate || prevLine };
    }
  }

  return { company: beforeDate || 'Unknown', title: '' };
}

function finalizeExperience(partial: Partial<WorkExperience>, bullets: string[]): WorkExperience {
  return {
    company: partial.company ?? 'Unknown',
    title: partial.title ?? '',
    startDate: partial.startDate ?? null,
    endDate: partial.endDate ?? null,
    bullets,
  };
}

function extractEducation(lines: string[], sections: Map<string, SectionBounds>): Education[] {
  const sectionLines = getSectionLines(lines, sections, 'education');
  if (sectionLines.length === 0) return [];

  const entries: Education[] = [];
  let buffer: string[] = [];

  for (const line of sectionLines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (buffer.length > 0) {
        const edu = parseEducationBlock(buffer);
        if (edu) entries.push(edu);
        buffer = [];
      }
      continue;
    }
    buffer.push(trimmed);
  }

  // Last block
  if (buffer.length > 0) {
    const edu = parseEducationBlock(buffer);
    if (edu) entries.push(edu);
  }

  // If nothing was parsed from blocks, try treating the whole section as one entry
  if (entries.length === 0 && sectionLines.some(l => l.trim())) {
    const allText = sectionLines.map(l => l.trim()).filter(Boolean);
    const edu = parseEducationBlock(allText);
    if (edu) entries.push(edu);
  }

  return entries;
}

function parseEducationBlock(blockLines: string[]): Education | null {
  const block = blockLines.join(' ');

  // Try to find degree
  const degreeMatch = block.match(DEGREE_RE);
  const degree = degreeMatch ? degreeMatch[0].trim() : '';

  // Try to find year
  const yearMatch = block.match(/\b(19|20)\d{2}\b/g);
  const year = yearMatch ? yearMatch[yearMatch.length - 1]! : null;

  // Institution: usually the first line, or the part that isn't the degree
  let institution = blockLines[0] ?? '';
  // Remove degree text from institution if it appears there
  if (degreeMatch && institution.includes(degreeMatch[0])) {
    institution = institution.replace(degreeMatch[0], '').trim();
    if (!institution && blockLines.length > 1) {
      institution = blockLines[1] ?? '';
    }
  }
  // Remove date from institution
  institution = institution.replace(/\b(19|20)\d{2}\b/g, '').replace(/[-–—]/g, '').trim();
  institution = institution.replace(/[,|]\s*$/, '').trim();

  if (!institution && !degree) return null;

  // Try to extract field from degree string
  let field: string | null = null;
  const fieldMatch = degree.match(/(?:in|of|for)\s+(.+)/i);
  if (fieldMatch) {
    field = fieldMatch[1]!.trim();
  }

  return {
    institution: institution || 'Unknown',
    degree: degree || blockLines.join(' ').slice(0, 100),
    field,
    year,
  };
}

function extractCertifications(lines: string[], sections: Map<string, SectionBounds>): string[] {
  const sectionLines = getSectionLines(lines, sections, 'certifications');
  if (sectionLines.length === 0) return [];

  const certs: string[] = [];
  for (const line of sectionLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Remove bullet prefixes
    const cleaned = trimmed.replace(/^[•·●■▪►▸\-*]\s*/, '').replace(/^\d+[.)]\s*/, '').trim();
    if (cleaned.length > 0) {
      certs.push(cleaned);
    }
  }
  return certs;
}
