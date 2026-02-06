'use client';

import { motion } from 'framer-motion';
import { FileText, Globe, GitBranch, Wrench } from 'lucide-react';

interface ServerInfo {
  name: string;
  displayName: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  bgColor: string;
  glowClass: string;
  tools: { name: string; description: string }[];
  npmPackage: string;
}

const servers: ServerInfo[] = [
  {
    name: 'mcp-resume',
    displayName: 'Resume Parser',
    description:
      'Parse resumes, score ATS compatibility, and get improvement suggestions. Extracts structured data from PDF resumes.',
    icon: <FileText size={24} />,
    color: 'text-accent',
    borderColor: 'border-accent/30',
    bgColor: 'bg-accent/5',
    glowClass: 'glow-accent',
    tools: [
      { name: 'parse_resume', description: 'Extract structured data from PDF resumes' },
      { name: 'score_ats', description: 'Score resume for ATS compatibility (0-100)' },
      { name: 'suggest_improvements', description: 'Get actionable improvement suggestions' },
    ],
    npmPackage: '@mcpforge/mcp-resume',
  },
  {
    name: 'mcp-portfolio',
    displayName: 'Portfolio Analyzer',
    description:
      'Analyze developer portfolios, extract technical skills, and generate professional summaries from portfolio websites.',
    icon: <Globe size={24} />,
    color: 'text-success',
    borderColor: 'border-success/30',
    bgColor: 'bg-success/5',
    glowClass: 'glow-success',
    tools: [
      { name: 'analyze_portfolio', description: 'Analyze a developer portfolio website' },
      { name: 'extract_skills', description: 'Extract and categorize technical skills' },
      { name: 'generate_summary', description: 'Generate a professional summary' },
    ],
    npmPackage: '@mcpforge/mcp-portfolio',
  },
  {
    name: 'mcp-github-insights',
    displayName: 'GitHub Insights',
    description:
      'Analyze GitHub repositories, get contribution statistics, and compare project health and activity metrics.',
    icon: <GitBranch size={24} />,
    color: 'text-warning',
    borderColor: 'border-warning/30',
    bgColor: 'bg-warning/5',
    glowClass: 'glow-warning',
    tools: [
      { name: 'analyze_repo', description: "Analyze a repository's health and activity" },
      { name: 'get_contributions', description: 'Get contribution statistics' },
      { name: 'compare_repos', description: 'Compare two repositories' },
    ],
    npmPackage: '@mcpforge/mcp-github-insights',
  },
];

export default function ServerShowcase() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
          Three Purpose-Built Servers
        </h2>
        <p className="text-text-dim max-w-xl mx-auto">
          Each MCP server specializes in a domain, exposing tools that Claude can use to perform
          complex analysis tasks.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {servers.map((server, idx) => (
          <motion.div
            key={server.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className={`rounded-xl border ${server.borderColor} ${server.bgColor} p-6 ${server.glowClass} hover:scale-[1.02] transition-transform`}
          >
            {/* Icon and name */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-lg ${server.bgColor} flex items-center justify-center ${server.color}`}
              >
                {server.icon}
              </div>
              <div>
                <h3 className={`font-semibold ${server.color}`}>{server.displayName}</h3>
                <p className="text-xs font-mono text-text-muted">{server.name}</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-text-dim mb-5">{server.description}</p>

            {/* Tools */}
            <div className="space-y-2 mb-5">
              <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider flex items-center gap-1">
                <Wrench size={12} />
                Tools ({server.tools.length})
              </h4>
              {server.tools.map((tool) => (
                <div key={tool.name} className="rounded-lg bg-surface-dark/50 p-2.5">
                  <code className={`text-xs font-mono ${server.color}`}>
                    {tool.name}
                  </code>
                  <p className="text-xs text-text-muted mt-0.5">{tool.description}</p>
                </div>
              ))}
            </div>

            {/* Package name */}
            <div className="pt-4 border-t border-border/30">
              <code className="text-xs font-mono text-text-muted">
                npm i {server.npmPackage}
              </code>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
