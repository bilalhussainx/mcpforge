import type { ResumeData, ATSScore, ATSIssue } from '../types.js';
import { extractActionVerbs } from './keyword-matcher.js';

// ────────────────────────────────────────────────────────
// Standard section headings ATS systems expect
// ────────────────────────────────────────────────────────

const STANDARD_SECTIONS = [
  { name: 'Experience', patterns: [/experience/i, /employment/i, /work\s+history/i] },
  { name: 'Education', patterns: [/education/i, /academic/i] },
  { name: 'Skills', patterns: [/skills/i, /competencies/i, /technologies/i, /tech\s+stack/i] },
  { name: 'Summary', patterns: [/summary/i, /profile/i, /objective/i, /about\s+me/i] },
];

// ────────────────────────────────────────────────────────
// Formatting checks that ATS systems care about
// ────────────────────────────────────────────────────────

const IMAGE_INDICATORS = [
  /\[image\]/i,
  /\[logo\]/i,
  /\[photo\]/i,
  /\[picture\]/i,
  /data:image/i,
];

const TABLE_INDICATORS = [
  /\t{3,}/,  // Multiple consecutive tabs suggest table layout
  /\|.*\|.*\|/,  // Pipe-separated columns
];

const MULTI_COLUMN_INDICATORS = [
  /\s{10,}\S+\s{10,}/,  // Large whitespace gaps in the middle of a line
];

// ────────────────────────────────────────────────────────
// Quantifiable result patterns
// ────────────────────────────────────────────────────────

const QUANTIFIABLE_RE = /\d+%|\$[\d,.]+[KkMmBb]?|\d+[xX]\s|\d+\+?\s*(users|customers|clients|employees|team|engineers|developers|people|members|projects|applications|servers|requests|transactions|records|endpoints)/i;

// ────────────────────────────────────────────────────────
// Scoring functions (each returns 0-25)
// ────────────────────────────────────────────────────────

/**
 * Score formatting: single column, no images, no tables, clean structure.
 * Max 25 points.
 */
export function scoreFormatting(text: string): number {
  let score = 25;
  const lines = text.split('\n');

  // Check for image indicators (-5 each, max -10)
  let imageDeductions = 0;
  for (const pattern of IMAGE_INDICATORS) {
    if (pattern.test(text)) {
      imageDeductions += 5;
    }
  }
  score -= Math.min(imageDeductions, 10);

  // Check for table indicators (-5 each, max -10)
  let tableDeductions = 0;
  for (const pattern of TABLE_INDICATORS) {
    for (const line of lines) {
      if (pattern.test(line)) {
        tableDeductions += 5;
        break;
      }
    }
  }
  score -= Math.min(tableDeductions, 10);

  // Check for multi-column layout indicators (-5 each, max -5)
  let columnDeductions = 0;
  for (const pattern of MULTI_COLUMN_INDICATORS) {
    let multiColCount = 0;
    for (const line of lines) {
      if (pattern.test(line)) multiColCount++;
    }
    // If more than 5 lines show multi-column patterns, it's likely a multi-column layout
    if (multiColCount > 5) {
      columnDeductions += 5;
    }
  }
  score -= Math.min(columnDeductions, 5);

  // Check document length (too short or too long is problematic)
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount < 100) {
    score -= 3; // Suspiciously short
  } else if (wordCount > 2000) {
    score -= 2; // Might be too long
  }

  // Check for excessive special characters (decorative elements)
  const specialChars = (text.match(/[★☆⭐✦✧◆◇●○►▶▷▸►◄◁▽△▲▼♦♠♣♥♡♢♤♧✔✓✗✘✕✖×÷]/g) ?? []).length;
  if (specialChars > 10) {
    score -= 3;
  }

  return Math.max(0, score);
}

/**
 * Score section headers: standard naming, presence of key sections.
 * Max 25 points.
 */
export function scoreSectionHeaders(text: string): number {
  let score = 0;
  const lines = text.split('\n').map(l => l.trim());

  for (const section of STANDARD_SECTIONS) {
    let found = false;
    for (const line of lines) {
      // Check if any line matches section patterns and looks like a header
      // (typically short, possibly ALL CAPS or Title Case)
      if (line.length > 0 && line.length < 60) {
        for (const pattern of section.patterns) {
          if (pattern.test(line)) {
            found = true;
            break;
          }
        }
      }
      if (found) break;
    }

    if (found) {
      score += 5; // 5 points per standard section found
    }
  }

  // Bonus: check if headers use consistent casing (all caps or title case)
  const headerLines: string[] = [];
  for (const line of lines) {
    for (const section of STANDARD_SECTIONS) {
      for (const pattern of section.patterns) {
        if (pattern.test(line) && line.length < 60) {
          headerLines.push(line);
        }
      }
    }
  }

  if (headerLines.length >= 2) {
    const allUpper = headerLines.every(h => h === h.toUpperCase());
    const allTitleCase = headerLines.every(h => /^[A-Z]/.test(h));
    if (allUpper || allTitleCase) {
      score += 5; // Consistency bonus
    }
  }

  return Math.min(25, score);
}

/**
 * Score parseability: can we extract meaningful structured data?
 * Max 25 points.
 */
export function scoreParseability(text: string, resumeData: ResumeData): number {
  let score = 0;

  // Name found (5 points)
  if (resumeData.name && resumeData.name !== 'Unknown') {
    score += 5;
  }

  // Email found (4 points)
  if (resumeData.email) {
    score += 4;
  }

  // Phone found (3 points)
  if (resumeData.phone) {
    score += 3;
  }

  // Experience entries parsed with dates (5 points)
  const experienceWithDates = resumeData.experience.filter(e => e.startDate || e.endDate);
  if (experienceWithDates.length > 0) {
    score += 5;
  }

  // Education entries parsed (4 points)
  if (resumeData.education.length > 0) {
    score += 4;
  }

  // Bullet points are clean and extractable (4 points)
  const totalBullets = resumeData.experience.reduce((sum, e) => sum + e.bullets.length, 0);
  if (totalBullets >= 5) {
    score += 4;
  } else if (totalBullets > 0) {
    score += 2;
  }

  return Math.min(25, score);
}

/**
 * Score keyword optimization: skills section, action verbs, quantifiable results.
 * Max 25 points.
 */
export function scoreKeywordOptimization(resumeData: ResumeData): number {
  let score = 0;

  // Skills section present with items (7 points)
  if (resumeData.skills.length >= 10) {
    score += 7;
  } else if (resumeData.skills.length >= 5) {
    score += 5;
  } else if (resumeData.skills.length > 0) {
    score += 3;
  }

  // Bullet points contain action verbs (8 points)
  const allBullets = resumeData.experience.flatMap(e => e.bullets).join(' ');
  const actionVerbs = extractActionVerbs(allBullets);
  if (actionVerbs.length >= 10) {
    score += 8;
  } else if (actionVerbs.length >= 5) {
    score += 6;
  } else if (actionVerbs.length > 0) {
    score += 3;
  }

  // Bullet points contain quantifiable results (7 points)
  const bulletsWithNumbers = resumeData.experience.flatMap(e => e.bullets).filter(b => QUANTIFIABLE_RE.test(b));
  if (bulletsWithNumbers.length >= 5) {
    score += 7;
  } else if (bulletsWithNumbers.length >= 2) {
    score += 5;
  } else if (bulletsWithNumbers.length > 0) {
    score += 2;
  }

  // Summary/objective present (3 points)
  if (resumeData.summary && resumeData.summary.length > 30) {
    score += 3;
  }

  return Math.min(25, score);
}

// ────────────────────────────────────────────────────────
// Issue detection
// ────────────────────────────────────────────────────────

export function getIssues(text: string, resumeData: ResumeData): ATSIssue[] {
  const issues: ATSIssue[] = [];
  const lines = text.split('\n');

  // ── Critical issues ──

  if (!resumeData.name || resumeData.name === 'Unknown') {
    issues.push({
      severity: 'critical',
      category: 'Contact Info',
      message: 'Name could not be detected at the top of the resume.',
      fix: 'Place your full name prominently on the first line of the resume.',
    });
  }

  if (!resumeData.email) {
    issues.push({
      severity: 'critical',
      category: 'Contact Info',
      message: 'Email address not found in the resume.',
      fix: 'Add a professional email address near the top of your resume.',
    });
  }

  // Check for image indicators
  for (const pattern of IMAGE_INDICATORS) {
    if (pattern.test(text)) {
      issues.push({
        severity: 'critical',
        category: 'Formatting',
        message: 'Resume appears to contain images or embedded graphics.',
        fix: 'Remove all images, logos, and photos. ATS systems cannot parse image content.',
      });
      break;
    }
  }

  // Check if experience section exists
  const hasExperience = STANDARD_SECTIONS[0]!.patterns.some(p => {
    return lines.some(l => p.test(l.trim()) && l.trim().length < 60);
  });
  if (!hasExperience) {
    issues.push({
      severity: 'critical',
      category: 'Section Headers',
      message: 'No "Experience" or "Work Experience" section header found.',
      fix: 'Add a clearly labeled "Professional Experience" or "Work Experience" section.',
    });
  }

  // ── Warnings ──

  if (!resumeData.phone) {
    issues.push({
      severity: 'warning',
      category: 'Contact Info',
      message: 'Phone number not found in the resume.',
      fix: 'Include a phone number for recruiter callbacks.',
    });
  }

  if (resumeData.skills.length === 0) {
    issues.push({
      severity: 'warning',
      category: 'Skills',
      message: 'No dedicated skills section detected.',
      fix: 'Add a "Technical Skills" or "Skills" section with relevant keywords from your target job descriptions.',
    });
  } else if (resumeData.skills.length < 5) {
    issues.push({
      severity: 'warning',
      category: 'Skills',
      message: `Skills section only contains ${resumeData.skills.length} items, which is quite sparse.`,
      fix: 'Expand your skills section to include at least 8-12 relevant technical and professional skills.',
    });
  }

  if (resumeData.education.length === 0) {
    issues.push({
      severity: 'warning',
      category: 'Education',
      message: 'No education entries detected.',
      fix: 'Add an "Education" section with your degree(s), institution(s), and graduation year(s).',
    });
  }

  // Check for missing dates in experience
  const entriesWithoutDates = resumeData.experience.filter(e => !e.startDate && !e.endDate);
  if (entriesWithoutDates.length > 0) {
    issues.push({
      severity: 'warning',
      category: 'Experience',
      message: `${entriesWithoutDates.length} experience entry/entries missing date ranges.`,
      fix: 'Add start and end dates (e.g., "Jan 2020 – Present") for all positions. ATS systems use dates to calculate experience length.',
    });
  }

  // Check for table/multi-column layout
  for (const pattern of TABLE_INDICATORS) {
    for (const line of lines) {
      if (pattern.test(line)) {
        issues.push({
          severity: 'warning',
          category: 'Formatting',
          message: 'Resume may contain a table-based layout.',
          fix: 'Replace tables with simple left-aligned text. Use standard bullet points for lists.',
        });
        break;
      }
    }
  }

  // Check for excessive length
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount > 1500) {
    issues.push({
      severity: 'warning',
      category: 'Length',
      message: `Resume is approximately ${wordCount} words, which may be too long.`,
      fix: 'Aim for a concise resume (400-800 words for 1 page, 800-1200 for 2 pages). Focus on the most relevant experience.',
    });
  }

  // ── Info-level suggestions ──

  if (!resumeData.summary) {
    issues.push({
      severity: 'info',
      category: 'Summary',
      message: 'No professional summary or objective detected.',
      fix: 'Add a 2-3 sentence professional summary at the top to quickly convey your value proposition.',
    });
  }

  // Check for action verbs in bullets
  const allBullets = resumeData.experience.flatMap(e => e.bullets).join(' ');
  const actionVerbs = extractActionVerbs(allBullets);
  if (actionVerbs.length < 5 && resumeData.experience.length > 0) {
    issues.push({
      severity: 'info',
      category: 'Language',
      message: 'Bullet points use few strong action verbs.',
      fix: 'Start each bullet point with a strong action verb (e.g., "Developed", "Implemented", "Optimized", "Led").',
    });
  }

  // Check for quantifiable results
  const allBulletsList = resumeData.experience.flatMap(e => e.bullets);
  const bulletsWithNumbers = allBulletsList.filter(b => QUANTIFIABLE_RE.test(b));
  if (bulletsWithNumbers.length < 3 && allBulletsList.length > 5) {
    issues.push({
      severity: 'info',
      category: 'Impact',
      message: `Only ${bulletsWithNumbers.length} bullet points contain quantifiable results.`,
      fix: 'Add metrics and numbers to more bullet points (e.g., "Reduced load time by 40%", "Managed team of 8 engineers").',
    });
  }

  if (resumeData.certifications.length === 0) {
    issues.push({
      severity: 'info',
      category: 'Certifications',
      message: 'No certifications section detected.',
      fix: 'If you have relevant certifications (AWS, PMP, Google, etc.), add a Certifications section.',
    });
  }

  return issues;
}

// ────────────────────────────────────────────────────────
// Passed checks
// ────────────────────────────────────────────────────────

export function getPassed(text: string, resumeData: ResumeData): string[] {
  const passed: string[] = [];
  const lines = text.split('\n');

  if (resumeData.name && resumeData.name !== 'Unknown') {
    passed.push('Name is clearly identifiable at the top of the resume.');
  }

  if (resumeData.email) {
    passed.push('Professional email address is present.');
  }

  if (resumeData.phone) {
    passed.push('Phone number is included.');
  }

  if (resumeData.location) {
    passed.push('Location information is provided.');
  }

  // Check for standard sections
  for (const section of STANDARD_SECTIONS) {
    const found = lines.some(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && trimmed.length < 60 && section.patterns.some(p => p.test(trimmed));
    });
    if (found) {
      passed.push(`"${section.name}" section header found with standard naming.`);
    }
  }

  if (resumeData.skills.length >= 5) {
    passed.push(`Skills section contains ${resumeData.skills.length} items — good keyword density.`);
  }

  const totalBullets = resumeData.experience.reduce((sum, e) => sum + e.bullets.length, 0);
  if (totalBullets >= 5) {
    passed.push(`Experience section has ${totalBullets} bullet points with clear descriptions.`);
  }

  const allBullets = resumeData.experience.flatMap(e => e.bullets).join(' ');
  const actionVerbs = extractActionVerbs(allBullets);
  if (actionVerbs.length >= 5) {
    passed.push(`Uses ${actionVerbs.length} strong action verbs in experience bullets.`);
  }

  const allBulletsList = resumeData.experience.flatMap(e => e.bullets);
  const bulletsWithNumbers = allBulletsList.filter(b => QUANTIFIABLE_RE.test(b));
  if (bulletsWithNumbers.length >= 3) {
    passed.push(`${bulletsWithNumbers.length} bullet points include quantifiable metrics.`);
  }

  if (resumeData.experience.length > 0 && resumeData.experience.every(e => e.startDate || e.endDate)) {
    passed.push('All experience entries include date ranges.');
  }

  if (resumeData.education.length > 0) {
    passed.push('Education section is present with parsed entries.');
  }

  if (resumeData.summary && resumeData.summary.length > 30) {
    passed.push('Professional summary/objective is present.');
  }

  // Check that no images were detected
  const hasImages = IMAGE_INDICATORS.some(p => p.test(text));
  if (!hasImages) {
    passed.push('No images or embedded graphics detected — ATS-safe.');
  }

  return passed;
}

// ────────────────────────────────────────────────────────
// Full ATS scoring
// ────────────────────────────────────────────────────────

export function calculateATSScore(text: string, resumeData: ResumeData): ATSScore {
  const formatting = scoreFormatting(text);
  const sectionHeaders = scoreSectionHeaders(text);
  const parseability = scoreParseability(text, resumeData);
  const keywordOptimization = scoreKeywordOptimization(resumeData);

  const overallScore = formatting + sectionHeaders + parseability + keywordOptimization;
  const issues = getIssues(text, resumeData);
  const passedChecks = getPassed(text, resumeData);

  return {
    overallScore,
    breakdown: {
      formatting,
      sectionHeaders,
      parseability,
      keywordOptimization,
    },
    issues,
    passed: passedChecks,
  };
}
