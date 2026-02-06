'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Cpu, Zap } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-success/5 rounded-full blur-[100px]" />
        <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-warning/3 rounded-full blur-[80px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-20 sm:py-32 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 mb-8"
        >
          <Sparkles size={14} className="text-accent" />
          <span className="text-xs font-medium text-accent">Model Context Protocol</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-7xl font-bold tracking-tight mb-6"
        >
          <span className="gradient-text">MCPForge</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl sm:text-2xl text-text-dim max-w-2xl mx-auto mb-4"
        >
          Custom MCP servers that give AI models new capabilities
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-sm sm:text-base text-text-muted max-w-xl mx-auto mb-10"
        >
          Three purpose-built servers for resume analysis, portfolio evaluation, and GitHub insights
          -- connected to Claude via the Model Context Protocol.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-medium text-primary hover:bg-accent/90 transition-colors glow-accent"
          >
            Try the Demo
            <ArrowRight size={16} />
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-medium text-text-dim hover:text-text hover:border-accent/50 transition-colors"
          >
            View on GitHub
          </a>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-3 mt-16"
        >
          {[
            { icon: <Cpu size={14} />, label: '3 MCP Servers', color: 'text-accent' },
            { icon: <Zap size={14} />, label: '10+ AI Tools', color: 'text-success' },
            { icon: <Sparkles size={14} />, label: 'Claude Integration', color: 'text-warning' },
          ].map((pill, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-1.5 rounded-full border border-border/50 bg-surface/50 px-3 py-1.5 text-xs ${pill.color}`}
            >
              {pill.icon}
              <span>{pill.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
