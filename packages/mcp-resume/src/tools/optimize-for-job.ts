import {
  extractKeywordsFromText,
  matchKeywords,
  calculateKeywordDensity,
  classifyRequirements,
  extractActionVerbs,
} from '../lib/keyword-matcher.js';
import type { ResumeData, OptimizationReport, OptimizationSuggestion } from '../types.js';

/**
 * Optimize a resume for a specific job description.
 *
 * Compares resume content against job description keywords, calculates
 * a fit score, identifies matched and missing keywords, and generates
 * actionable optimization suggestions.
 *
 * @param resumeDataJson - JSON string of ResumeData
 * @param jobDescription - Full text of the job description
 * @returns OptimizationReport
 */
export async function optimizeForJob(
  resumeDataJson: string,
  jobDescription: string
): Promise<OptimizationReport> {
  if (!resumeDataJson || resumeDataJson.trim().length === 0) {
    throw new Error('No resume data provided. Please supply a JSON string of parsed resume data.');
  }

  if (!jobDescription || jobDescription.trim().length === 0) {
    throw new Error('No job description provided. Please supply the full text of the job posting.');
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
  if (!resumeData.rawText && !resumeData.skills) {
    throw new Error('Resume data appears incomplete. Ensure it contains rawText or skills fields.');
  }

  // Build the full resume text for matching
  const resumeText = buildFullResumeText(resumeData);

  // Classify job requirements
  const classified = classifyRequirements(jobDescription);
  const allJobKeywords = [...new Set([...classified.required_skills, ...classified.nice_to_have])];

  // Match keywords
  const { matched, missing } = matchKeywords(resumeText, allJobKeywords);

  // Calculate keyword density
  const keywordDensity = calculateKeywordDensity(matched.length, allJobKeywords.length);

  // Calculate fit score (0-100)
  const fitScore = calculateFitScore(matched, missing, classified, resumeData);

  // Generate optimization suggestions
  const suggestions = generateSuggestions(resumeData, classified, matched, missing, jobDescription);

  // Reorder experience by relevance to the job
  const reorderedExperience = reorderExperienceByRelevance(resumeData, jobDescription);

  return {
    fitScore,
    matchedKeywords: matched,
    missingKeywords: missing,
    keywordDensity,
    suggestions,
    reorderedExperience,
  };
}

// ────────────────────────────────────────────────────────
// Internal helpers
// ────────────────────────────────────────────────────────

function buildFullResumeText(data: ResumeData): string {
  const parts: string[] = [];

  if (data.rawText) parts.push(data.rawText);
  if (data.summary) parts.push(data.summary);
  if (data.skills.length > 0) parts.push(data.skills.join(' '));
  for (const exp of data.experience) {
    parts.push(exp.title);
    parts.push(exp.company);
    parts.push(exp.bullets.join(' '));
  }
  for (const edu of data.education) {
    parts.push(edu.degree);
    if (edu.field) parts.push(edu.field);
    parts.push(edu.institution);
  }
  if (data.certifications.length > 0) parts.push(data.certifications.join(' '));

  return parts.join(' ');
}

function calculateFitScore(
  matched: string[],
  missing: string[],
  classified: ReturnType<typeof classifyRequirements>,
  resumeData: ResumeData
): number {
  let score = 0;

  // Keyword match component (0-50 points)
  const totalKeywords = matched.length + missing.length;
  if (totalKeywords > 0) {
    score += Math.round((matched.length / totalKeywords) * 50);
  }

  // Required skills match component (0-25 points)
  if (classified.required_skills.length > 0) {
    const requiredMatched = matched.filter((k) =>
      classified.required_skills.some((r) => r.toLowerCase() === k.toLowerCase())
    );
    score += Math.round((requiredMatched.length / classified.required_skills.length) * 25);
  } else {
    score += 15; // No explicit required section, give moderate score
  }

  // Resume quality component (0-25 points)
  let qualityScore = 0;

  // Has summary (3 points)
  if (resumeData.summary && resumeData.summary.length > 30) qualityScore += 3;

  // Has enough skills (5 points)
  if (resumeData.skills.length >= 10) qualityScore += 5;
  else if (resumeData.skills.length >= 5) qualityScore += 3;

  // Has experience with bullets (7 points)
  const totalBullets = resumeData.experience.reduce((sum, e) => sum + e.bullets.length, 0);
  if (totalBullets >= 10) qualityScore += 7;
  else if (totalBullets >= 5) qualityScore += 5;
  else if (totalBullets > 0) qualityScore += 2;

  // Has action verbs (5 points)
  const allBulletsText = resumeData.experience.flatMap((e) => e.bullets).join(' ');
  const actionVerbs = extractActionVerbs(allBulletsText);
  if (actionVerbs.length >= 8) qualityScore += 5;
  else if (actionVerbs.length >= 4) qualityScore += 3;

  // Has education (3 points)
  if (resumeData.education.length > 0) qualityScore += 3;

  // Has certifications (2 points)
  if (resumeData.certifications.length > 0) qualityScore += 2;

  score += Math.min(qualityScore, 25);

  return Math.min(Math.max(score, 0), 100);
}

function generateSuggestions(
  resumeData: ResumeData,
  classified: ReturnType<typeof classifyRequirements>,
  matched: string[],
  missing: string[],
  jobDescription: string
): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [];

  // ── Skills section suggestions ──
  if (missing.length > 0) {
    // Identify skills the candidate might actually have but just didn't list
    const missingFromSkillsSection = missing.filter(
      (kw) => !resumeData.skills.some((s) => s.toLowerCase() === kw.toLowerCase())
    );

    if (missingFromSkillsSection.length > 0) {
      const topMissing = missingFromSkillsSection.slice(0, 8);
      suggestions.push({
        section: 'skills',
        current: resumeData.skills.length > 0
          ? `Current skills: ${resumeData.skills.slice(0, 5).join(', ')}${resumeData.skills.length > 5 ? '...' : ''}`
          : 'No skills section found',
        suggested: `Add these missing keywords to your skills section: ${topMissing.join(', ')}`,
        reason: `The job description requires these skills but they are not found in your resume. Adding them (if you have the experience) will improve ATS keyword matching.`,
      });
    }
  }

  // ── Summary suggestions ──
  if (!resumeData.summary || resumeData.summary.length < 30) {
    // Extract the key required skills for the summary
    const topRequired = classified.required_skills.slice(0, 5);
    suggestions.push({
      section: 'summary',
      current: resumeData.summary ?? 'No summary present',
      suggested: `Add a 2-3 sentence professional summary mentioning: ${topRequired.join(', ')}. Example: "Results-driven [title] with [X] years of experience in ${topRequired.slice(0, 3).join(', ')}. Proven track record of [key achievement]."`,
      reason: 'A keyword-rich professional summary helps ATS systems quickly identify your fit and gives recruiters an immediate snapshot of your qualifications.',
    });
  } else {
    // Check if summary contains key required terms
    const summaryLower = resumeData.summary.toLowerCase();
    const missingFromSummary = classified.required_skills
      .filter((s) => !summaryLower.includes(s.toLowerCase()))
      .slice(0, 4);
    if (missingFromSummary.length > 0) {
      suggestions.push({
        section: 'summary',
        current: resumeData.summary.slice(0, 100) + (resumeData.summary.length > 100 ? '...' : ''),
        suggested: `Incorporate these key terms into your summary: ${missingFromSummary.join(', ')}`,
        reason: 'Your summary is missing key required skills from the job description. Weaving them in naturally improves ATS matching.',
      });
    }
  }

  // ── Title suggestions ──
  // Try to extract the job title from the job description
  const jobTitleMatch = jobDescription.match(
    /(?:^|\n)\s*(?:Job\s+Title|Position|Role)\s*:?\s*(.+)/im
  );
  const targetTitle = jobTitleMatch ? jobTitleMatch[1]!.trim() : null;

  if (targetTitle && resumeData.title) {
    const currentLower = resumeData.title.toLowerCase();
    const targetLower = targetTitle.toLowerCase();
    if (!currentLower.includes(targetLower) && !targetLower.includes(currentLower)) {
      suggestions.push({
        section: 'title',
        current: resumeData.title,
        suggested: `Consider aligning your title to "${targetTitle}" if it accurately reflects your experience.`,
        reason: 'ATS systems often match the job title in your resume against the posted position. Aligning titles (when truthful) improves match scores.',
      });
    }
  }

  // ── Experience bullet suggestions ──
  // Check if bullets use action verbs
  const allBulletsText = resumeData.experience.flatMap((e) => e.bullets).join(' ');
  const actionVerbs = extractActionVerbs(allBulletsText);

  if (actionVerbs.length < 5 && resumeData.experience.length > 0) {
    suggestions.push({
      section: 'experience',
      current: `Experience bullets use only ${actionVerbs.length} action verbs`,
      suggested: 'Rewrite bullet points to start with strong action verbs: Developed, Implemented, Architected, Optimized, Led, Reduced, Increased, Delivered, Automated, Migrated',
      reason: 'Action verbs make achievements concrete and are weighted by ATS systems. Aim for each bullet to start with a unique action verb.',
    });
  }

  // Check for quantifiable results
  const allBullets = resumeData.experience.flatMap((e) => e.bullets);
  const QUANTIFIABLE_RE = /\d+%|\$[\d,.]+[KkMmBb]?|\d+[xX]\s|\d+\+?\s*(users|customers|clients|employees|team|engineers|developers|people|members|projects|applications|servers|requests|transactions|records|endpoints)/i;
  const bulletsWithMetrics = allBullets.filter((b) => QUANTIFIABLE_RE.test(b));

  if (bulletsWithMetrics.length < 3 && allBullets.length > 3) {
    suggestions.push({
      section: 'experience',
      current: `Only ${bulletsWithMetrics.length} of ${allBullets.length} bullets contain quantifiable metrics`,
      suggested: 'Add numbers and percentages to more bullet points. Examples: "Reduced API response time by 60%", "Managed deployment pipeline serving 2M daily requests", "Led team of 5 engineers"',
      reason: 'Quantifiable results demonstrate impact and are strongly weighted by both ATS systems and human reviewers.',
    });
  }

  // Check for missing keywords in experience bullets
  const missingInExperience = missing.filter((kw) => {
    const lower = kw.toLowerCase();
    return !allBulletsText.toLowerCase().includes(lower);
  });

  if (missingInExperience.length > 0) {
    const topMissingExp = missingInExperience.slice(0, 5);
    suggestions.push({
      section: 'experience',
      current: 'Experience bullets missing key job keywords',
      suggested: `Naturally incorporate these terms into your experience bullets where truthful: ${topMissingExp.join(', ')}`,
      reason: 'Keywords appearing in the context of actual work experience carry more weight than skills listed in isolation.',
    });
  }

  return suggestions;
}

function reorderExperienceByRelevance(resumeData: ResumeData, jobDescription: string): string[] {
  if (resumeData.experience.length <= 1) {
    return resumeData.experience.map(
      (e) => `${e.title} at ${e.company}`
    );
  }

  const jobKeywords = new Set(extractKeywordsFromText(jobDescription).map((k) => k.toLowerCase()));

  // Score each experience entry by relevance to the job
  const scored = resumeData.experience.map((exp) => {
    const expText = [exp.title, exp.company, ...exp.bullets].join(' ').toLowerCase();
    let relevanceScore = 0;

    for (const keyword of jobKeywords) {
      if (expText.includes(keyword)) {
        relevanceScore++;
      }
    }

    // Bonus for recency (if end date is "Present" or recent)
    if (exp.endDate) {
      const endLower = exp.endDate.toLowerCase();
      if (endLower.includes('present') || endLower.includes('current')) {
        relevanceScore += 3;
      } else {
        const yearMatch = exp.endDate.match(/\d{4}/);
        if (yearMatch) {
          const year = parseInt(yearMatch[0], 10);
          const currentYear = new Date().getFullYear();
          if (year >= currentYear - 1) relevanceScore += 2;
          else if (year >= currentYear - 3) relevanceScore += 1;
        }
      }
    }

    return {
      label: `${exp.title} at ${exp.company}`,
      score: relevanceScore,
    };
  });

  // Sort by relevance score (descending)
  scored.sort((a, b) => b.score - a.score);

  return scored.map((s) => s.label);
}
