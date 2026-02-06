'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  MessageSquare,
  Terminal,
  Wrench,
  CheckCircle,
  ArrowRightLeft,
} from 'lucide-react';

export default function DemoPreview() {
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
          See It In Action
        </h2>
        <p className="text-text-dim max-w-xl mx-auto">
          Watch Claude use MCP tools in real-time with our protocol inspector showing every message.
        </p>
      </motion.div>

      {/* Mockup of the demo */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-xl border border-border overflow-hidden bg-surface glow-accent"
      >
        {/* Mock title bar */}
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-primary">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-error/60" />
              <div className="w-3 h-3 rounded-full bg-warning/60" />
              <div className="w-3 h-3 rounded-full bg-success/60" />
            </div>
            <span className="text-xs text-text-muted ml-2 font-mono">
              localhost:3000/demo
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent pulse-dot" />
            <div className="w-2 h-2 rounded-full bg-success pulse-dot" />
            <div className="w-2 h-2 rounded-full bg-warning pulse-dot" />
          </div>
        </div>

        {/* Mock split layout */}
        <div className="flex min-h-[320px]">
          {/* Mock chat panel */}
          <div className="flex-[6] border-r border-border p-4 space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={14} className="text-accent" />
              <span className="text-xs font-medium text-text">Chat</span>
            </div>

            {/* Mock user message */}
            <div className="flex justify-end">
              <div className="bg-surface-light rounded-2xl rounded-tr-md px-4 py-2.5 max-w-[80%]">
                <p className="text-sm text-text">Analyze my resume for ATS compatibility</p>
              </div>
            </div>

            {/* Mock tool call */}
            <div className="flex justify-start">
              <div className="space-y-2 max-w-[85%]">
                <div className="bg-surface rounded-2xl rounded-tl-md px-4 py-2.5">
                  <p className="text-sm text-text-dim">
                    I&apos;ll analyze your resume using the ATS scoring tool...
                  </p>
                </div>
                <div className="border-l-[3px] border-l-accent bg-accent/5 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Wrench size={12} className="text-accent" />
                    <span className="text-xs font-mono text-accent">score_ats</span>
                    <span className="text-[10px] text-text-muted">mcp-resume</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle size={12} className="text-success" />
                    <span className="text-[10px] text-text-dim">Complete (1.2s)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mock inspector panel */}
          <div className="flex-[4] p-4 bg-surface-dark">
            <div className="flex items-center gap-2 mb-4">
              <Terminal size={14} className="text-accent" />
              <span className="text-xs font-medium text-text font-mono">Protocol Inspector</span>
            </div>

            <div className="space-y-1 font-mono text-[10px]">
              {[
                { time: '14:23:01.234', dir: '->', server: 'resume', msg: 'connect', color: 'text-accent' },
                { time: '14:23:01.567', dir: '<-', server: 'resume', msg: 'connected (3 tools)', color: 'text-accent' },
                { time: '14:23:02.100', dir: '->', server: 'resume', msg: 'call score_ats', color: 'text-warning' },
                { time: '14:23:03.312', dir: '<-', server: 'resume', msg: 'result: score=85', color: 'text-success' },
                { time: '14:23:03.400', dir: '->', server: 'portfolio', msg: 'connect', color: 'text-success' },
                { time: '14:23:03.789', dir: '<-', server: 'portfolio', msg: 'connected (3 tools)', color: 'text-success' },
              ].map((row, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * idx, duration: 0.3 }}
                  className="flex items-center gap-2 py-1 border-b border-border/20"
                >
                  <span className="text-text-muted w-[85px] shrink-0">{row.time}</span>
                  <span className={row.dir === '->' ? 'text-warning' : 'text-success'}>
                    {row.dir === '->' ? <ArrowRight size={10} /> : <ArrowRightLeft size={10} />}
                  </span>
                  <span className={`${row.color} w-[55px] shrink-0`}>{row.server}</span>
                  <span className="text-text-dim truncate">{row.msg}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center mt-10"
      >
        <Link
          href="/demo"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-medium text-primary hover:bg-accent/90 transition-colors"
        >
          Launch Interactive Demo
          <ArrowRight size={16} />
        </Link>
      </motion.div>
    </section>
  );
}
