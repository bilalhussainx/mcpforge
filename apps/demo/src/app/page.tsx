'use client';

import Link from 'next/link';
import { Github, ArrowUp } from 'lucide-react';
import Hero from '@/components/landing/Hero';
import ServerShowcase from '@/components/landing/ServerShowcase';
import DemoPreview from '@/components/landing/DemoPreview';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-primary">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-primary/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold gradient-text">MCPForge</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/demo"
              className="text-sm text-text-dim hover:text-text transition-colors"
            >
              Demo
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-text transition-colors"
            >
              <Github size={20} />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <Hero />

      {/* Server Showcase */}
      <ServerShowcase />

      {/* Architecture overview */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-text mb-4">How It Works</h2>
          <p className="text-text-dim">
            The demo app bridges Claude AI and MCP servers through a streaming architecture.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2">
          {[
            { label: 'User', sub: 'Chat UI', color: 'border-accent' },
            { label: 'Next.js API', sub: 'Bridge Route', color: 'border-text-muted' },
            { label: 'Claude AI', sub: 'claude-sonnet-4-5-20250929', color: 'border-warning' },
            { label: 'MCP Servers', sub: '3 Servers', color: 'border-success' },
          ].map((step, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div
                className={`rounded-lg border-2 ${step.color} bg-surface p-4 text-center min-w-[130px]`}
              >
                <p className="text-sm font-medium text-text">{step.label}</p>
                <p className="text-xs text-text-muted mt-0.5">{step.sub}</p>
              </div>
              {idx < 3 && (
                <div className="hidden md:block text-text-muted">
                  <ArrowUp size={16} className="rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-text-muted max-w-lg mx-auto">
          The API route connects to MCP servers, discovers tools, then orchestrates Claude and tool
          calls in a loop, streaming all events to the frontend in real-time.
        </div>
      </section>

      {/* Demo Preview */}
      <DemoPreview />

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold gradient-text">MCPForge</span>
            <span className="text-xs text-text-muted">
              Built with Next.js 15, Tailwind CSS v4, and the Model Context Protocol
            </span>
          </div>
          <div className="flex items-center gap-4 text-text-muted">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text transition-colors"
            >
              <Github size={18} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
