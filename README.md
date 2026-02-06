# MCPForge

**Custom MCP servers that give AI models new capabilities** — resume optimization, portfolio queries, and GitHub intelligence.

3 published MCP servers + 1 demo web app with live protocol inspector.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     DEMO WEB APP (Next.js 15)                │
│                                                              │
│   Chat Panel (Claude)     │     Protocol Inspector           │
│   "Optimize my resume     │     → listTools()                │
│    for this React job"    │     ← 13 tools across 3 servers  │
│                           │     → callTool("parse_resume")   │
│                           │     ← {name, skills, ...}        │
├───────────────────────────┴──────────────────────────────────┤
│  🟢 mcp-resume (5 tools)  🟢 mcp-portfolio (4 tools)        │
│  🟢 mcp-github-insights (4 tools)                           │
└──────────────────────────────────────────────────────────────┘
              │              │              │
     ┌────────┘      ┌──────┘      ┌───────┘
     ▼               ▼             ▼
  mcp-resume     mcp-portfolio  mcp-github-insights
  (port 3001)    (port 3002)    (port 3003)
```

## MCP Servers

### @bilalr/mcp-resume (Star Server)
Parse resumes, optimize for ATS, generate job-tailored PDFs, score ATS compatibility.

**Tools:** `parse_resume`, `extract_keywords`, `optimize_for_job`, `generate_ats_resume`, `score_ats`

### @bilalr/mcp-portfolio
Developer profile as queryable MCP tools and resources.

**Tools:** `get_profile`, `search_skills`, `get_projects`, `match_requirements`
**Resources:** `portfolio://resume`, `portfolio://projects/{slug}`

### @bilalr/mcp-github-insights
GitHub codebase intelligence via GitHub API.

**Tools:** `analyze_repo`, `get_contribution_stats`, `compare_repos`, `check_dependency_health`

## Quick Start

### With Docker Compose (Recommended)

```bash
# Clone the repo
git clone https://github.com/bilalhussainx/mcpforge.git
cd mcpforge

# Set your API key
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Start everything
docker-compose up
```

Open http://localhost:3000 to use the demo app.

### Without Docker

```bash
# Install dependencies
npm install

# Start all MCP servers (in separate terminals or use concurrently)
npm run dev:portfolio    # port 3002
npm run dev:resume       # port 3001
npm run dev:github       # port 3003

# Start the demo app
npm run dev:demo         # port 3000
```

## Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...

# Optional (raises GitHub API rate limit from 60 to 5000 req/hr)
GITHUB_TOKEN=ghp_...
```

## Tech Stack

- **MCP Servers:** TypeScript, Express, @modelcontextprotocol/sdk, Streamable HTTP transport
- **Resume Server:** pdf-parse, Puppeteer (HTML-to-PDF), Zod
- **GitHub Server:** Octokit
- **Demo App:** Next.js 15, React 19, Tailwind CSS v4, Zustand, Framer Motion
- **AI:** Claude API (Sonnet 4.5) via @anthropic-ai/sdk

## Project Structure

```
mcpforge/
├── packages/
│   ├── mcp-resume/          # ATS resume optimizer server
│   ├── mcp-portfolio/       # Portfolio query server
│   └── mcp-github-insights/ # GitHub intelligence server
├── apps/
│   └── demo/                # Next.js demo web app
├── docker-compose.yml       # One-command startup
└── README.md
```

## License

MIT
