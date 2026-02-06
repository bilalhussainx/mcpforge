import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ResumeData } from '../types.js';

// ────────────────────────────────────────────────────────
// Resolve the templates directory relative to this file
// ────────────────────────────────────────────────────────

function getTemplatesDir(): string {
  // Works both when running from src (tsx) and from dist (compiled)
  const thisDir = dirname(fileURLToPath(import.meta.url));

  // If running from dist/lib/, templates is at ../../templates
  // If running from src/lib/, templates is at ../../templates
  return join(thisDir, '..', '..', 'templates');
}

// ────────────────────────────────────────────────────────
// HTML escaping
// ────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ────────────────────────────────────────────────────────
// Build HTML sections from ResumeData
// ────────────────────────────────────────────────────────

function buildExperienceHtml(data: ResumeData): string {
  if (data.experience.length === 0) return '<p>No experience entries provided.</p>';

  return data.experience
    .map((exp) => {
      const dateRange = [exp.startDate, exp.endDate].filter(Boolean).join(' — ') || '';
      const bullets = exp.bullets
        .map((b) => `<li>${escapeHtml(b)}</li>`)
        .join('\n            ');

      return `
        <div class="experience-entry">
          <div class="entry-header">
            <div class="entry-left">
              <span class="job-title">${escapeHtml(exp.title)}</span>
              <span class="company">${escapeHtml(exp.company)}</span>
            </div>
            <div class="entry-right">
              <span class="date-range">${escapeHtml(dateRange)}</span>
            </div>
          </div>
          <ul>
            ${bullets}
          </ul>
        </div>`;
    })
    .join('\n');
}

function buildEducationHtml(data: ResumeData): string {
  if (data.education.length === 0) return '<p>No education entries provided.</p>';

  return data.education
    .map((edu) => {
      const degreeField = [edu.degree, edu.field].filter(Boolean).join(' in ');
      return `
        <div class="education-entry">
          <div class="entry-header">
            <div class="entry-left">
              <span class="institution">${escapeHtml(edu.institution)}</span>
              <span class="degree">${escapeHtml(degreeField)}</span>
            </div>
            <div class="entry-right">
              <span class="date-range">${escapeHtml(edu.year ?? '')}</span>
            </div>
          </div>
        </div>`;
    })
    .join('\n');
}

function buildSkillsHtml(data: ResumeData): string {
  if (data.skills.length === 0) return '<p>No skills listed.</p>';
  return `<p class="skills-list">${data.skills.map(escapeHtml).join(' &bull; ')}</p>`;
}

function buildCertificationsHtml(data: ResumeData): string {
  if (data.certifications.length === 0) return '';
  const items = data.certifications.map((c) => `<li>${escapeHtml(c)}</li>`).join('\n          ');
  return `
      <section>
        <h2>Certifications</h2>
        <ul>
          ${items}
        </ul>
      </section>`;
}

// ────────────────────────────────────────────────────────
// Template injection
// ────────────────────────────────────────────────────────

function injectData(template: string, data: ResumeData, variant: string): string {
  const contactParts: string[] = [];
  if (data.email) contactParts.push(escapeHtml(data.email));
  if (data.phone) contactParts.push(escapeHtml(data.phone));
  if (data.location) contactParts.push(escapeHtml(data.location));
  const contactLine = contactParts.join(' | ');

  let html = template;
  html = html.replace(/\{\{NAME\}\}/g, escapeHtml(data.name));
  html = html.replace(/\{\{TITLE\}\}/g, escapeHtml(data.title ?? ''));
  html = html.replace(/\{\{CONTACT\}\}/g, contactLine);
  html = html.replace(/\{\{SUMMARY\}\}/g, escapeHtml(data.summary ?? ''));
  html = html.replace(/\{\{EXPERIENCE\}\}/g, buildExperienceHtml(data));
  html = html.replace(/\{\{EDUCATION\}\}/g, buildEducationHtml(data));
  html = html.replace(/\{\{SKILLS\}\}/g, buildSkillsHtml(data));
  html = html.replace(/\{\{CERTIFICATIONS\}\}/g, buildCertificationsHtml(data));
  html = html.replace(/\{\{VARIANT\}\}/g, variant);

  return html;
}

// ────────────────────────────────────────────────────────
// PDF generation via Puppeteer
// ────────────────────────────────────────────────────────

export async function generatePdf(
  resumeData: ResumeData,
  template: 'classic' | 'modern' | 'minimal' = 'classic'
): Promise<{ pdf_base64: string; filename: string }> {
  // Read the HTML template
  const templatesDir = getTemplatesDir();
  const templatePath = join(templatesDir, 'ats-resume.html');

  let templateHtml: string;
  try {
    templateHtml = await readFile(templatePath, 'utf-8');
  } catch (err) {
    throw new Error(
      `Failed to read HTML template at ${templatePath}: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  // Inject resume data into the template
  const finalHtml = injectData(templateHtml, resumeData, template);

  // Try to launch Puppeteer
  let puppeteer: typeof import('puppeteer');
  try {
    puppeteer = await import('puppeteer');
  } catch {
    throw new Error(
      'Puppeteer is not available. Please install it with: npm install puppeteer. ' +
      'On some systems you may also need to install system dependencies for Chromium.'
    );
  }

  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'Letter',
      margin: {
        top: '0.5in',
        bottom: '0.5in',
        left: '0.6in',
        right: '0.6in',
      },
      printBackground: true,
    });

    const pdf_base64 = Buffer.from(pdfBuffer).toString('base64');

    // Generate a filename based on the candidate's name
    const safeName = resumeData.name
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();
    const filename = `${safeName}_resume_${template}.pdf`;

    return { pdf_base64, filename };
  } catch (err) {
    throw new Error(
      `Failed to generate PDF: ${err instanceof Error ? err.message : String(err)}`
    );
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
