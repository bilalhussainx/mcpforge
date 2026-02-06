'use client';

import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ATSBreakdown {
  formatting: number;
  sectionHeaders: number;
  parseability: number;
  keywordOptimization: number;
}

interface ATSIssue {
  message: string;
  severity: 'high' | 'medium' | 'low';
}

interface ATSScoreCardProps {
  score: number;
  breakdown: ATSBreakdown;
  issues: ATSIssue[];
  passed: string[];
}

function CircularProgress({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let scoreColor = 'text-error';
  let strokeColor = '#FB7185';
  if (score >= 80) {
    scoreColor = 'text-success';
    strokeColor = '#34D399';
  } else if (score >= 60) {
    scoreColor = 'text-warning';
    strokeColor = '#FBBF24';
  } else if (score >= 40) {
    scoreColor = 'text-accent';
    strokeColor = '#22D3EE';
  }

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-surface-light"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="ats-circle"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className={`text-3xl font-bold ${scoreColor}`}
        >
          {score}
        </motion.span>
        <span className="text-xs text-text-muted">/ 100</span>
      </div>
    </div>
  );
}

function BreakdownBar({
  label,
  value,
  max = 25,
  color,
}: {
  label: string;
  value: number;
  max?: number;
  color: string;
}) {
  const percent = Math.min((value / max) * 100, 100);

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-text-dim">{label}</span>
        <span className="text-text-muted font-mono">
          {value}/{max}
        </span>
      </div>
      <div className="h-2 bg-surface-light rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function getSeverityIcon(severity: ATSIssue['severity']) {
  switch (severity) {
    case 'high':
      return <XCircle size={14} className="text-error shrink-0" />;
    case 'medium':
      return <AlertTriangle size={14} className="text-warning shrink-0" />;
    case 'low':
      return <AlertTriangle size={14} className="text-text-muted shrink-0" />;
  }
}

export default function ATSScoreCard({ score, breakdown, issues, passed }: ATSScoreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-border bg-surface p-5 space-y-5"
    >
      {/* Header with circular score */}
      <div className="flex items-center gap-6">
        <CircularProgress score={score} />
        <div>
          <h3 className="text-lg font-semibold text-text">ATS Compatibility Score</h3>
          <p className="text-sm text-text-dim mt-1">
            {score >= 80
              ? 'Excellent! Your resume is well-optimized for ATS.'
              : score >= 60
                ? 'Good, but there are areas for improvement.'
                : 'Needs significant optimization for ATS systems.'}
          </p>
        </div>
      </div>

      {/* Breakdown bars */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider">
          Breakdown
        </h4>
        <BreakdownBar
          label="Formatting"
          value={breakdown.formatting}
          color="bg-accent"
        />
        <BreakdownBar
          label="Section Headers"
          value={breakdown.sectionHeaders}
          color="bg-success"
        />
        <BreakdownBar
          label="Parseability"
          value={breakdown.parseability}
          color="bg-warning"
        />
        <BreakdownBar
          label="Keyword Optimization"
          value={breakdown.keywordOptimization}
          color="bg-error"
        />
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider">
            Issues Found
          </h4>
          {issues.map((issue, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm">
              {getSeverityIcon(issue.severity)}
              <span className="text-text-dim">{issue.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Passed items */}
      {passed.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider">
            Passed Checks
          </h4>
          {passed.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm">
              <CheckCircle size={14} className="text-success shrink-0" />
              <span className="text-text-dim">{item}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
