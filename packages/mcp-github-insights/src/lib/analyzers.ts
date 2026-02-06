import type { TreeEntry } from '../types.js';

// ── Tech‑stack detection ───────────────────────────────────────────────────

interface PackageJsonShape {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

const KNOWN_FRAMEWORKS: Record<string, string> = {
  react: 'React',
  'react-dom': 'React',
  next: 'Next.js',
  vue: 'Vue',
  nuxt: 'Nuxt',
  angular: 'Angular',
  '@angular/core': 'Angular',
  svelte: 'Svelte',
  '@sveltejs/kit': 'SvelteKit',
  express: 'Express',
  fastify: 'Fastify',
  hono: 'Hono',
  nestjs: 'NestJS',
  '@nestjs/core': 'NestJS',
  tailwindcss: 'Tailwind CSS',
  prisma: 'Prisma',
  '@prisma/client': 'Prisma',
  drizzle: 'Drizzle',
  'drizzle-orm': 'Drizzle ORM',
  mongoose: 'Mongoose',
  typeorm: 'TypeORM',
  sequelize: 'Sequelize',
  graphql: 'GraphQL',
  '@apollo/server': 'Apollo GraphQL',
  trpc: 'tRPC',
  '@trpc/server': 'tRPC',
  redux: 'Redux',
  '@reduxjs/toolkit': 'Redux Toolkit',
  zustand: 'Zustand',
  vite: 'Vite',
  webpack: 'Webpack',
  esbuild: 'esbuild',
  tsup: 'tsup',
  vitest: 'Vitest',
  jest: 'Jest',
  mocha: 'Mocha',
  cypress: 'Cypress',
  playwright: 'Playwright',
  '@playwright/test': 'Playwright',
  storybook: 'Storybook',
  '@storybook/react': 'Storybook',
  docker: 'Docker',
  electron: 'Electron',
  'react-native': 'React Native',
  expo: 'Expo',
  three: 'Three.js',
  'd3': 'D3.js',
  socket: 'Socket.IO',
  'socket.io': 'Socket.IO',
  zod: 'Zod',
  joi: 'Joi',
};

const FILE_PATTERN_STACKS: Array<{ pattern: RegExp; tech: string }> = [
  { pattern: /^Dockerfile$/i, tech: 'Docker' },
  { pattern: /^docker-compose\.ya?ml$/i, tech: 'Docker Compose' },
  { pattern: /^\.dockerignore$/, tech: 'Docker' },
  { pattern: /^Makefile$/, tech: 'Make' },
  { pattern: /^Cargo\.toml$/, tech: 'Rust' },
  { pattern: /^go\.mod$/, tech: 'Go' },
  { pattern: /^requirements\.txt$/, tech: 'Python' },
  { pattern: /^pyproject\.toml$/, tech: 'Python' },
  { pattern: /^Pipfile$/, tech: 'Python (Pipenv)' },
  { pattern: /^Gemfile$/, tech: 'Ruby' },
  { pattern: /^pom\.xml$/, tech: 'Java (Maven)' },
  { pattern: /^build\.gradle/, tech: 'Java (Gradle)' },
  { pattern: /^\.eslintrc/, tech: 'ESLint' },
  { pattern: /^eslint\.config/, tech: 'ESLint' },
  { pattern: /^\.prettierrc/, tech: 'Prettier' },
  { pattern: /^prettier\.config/, tech: 'Prettier' },
  { pattern: /^tailwind\.config/, tech: 'Tailwind CSS' },
  { pattern: /^next\.config/, tech: 'Next.js' },
  { pattern: /^nuxt\.config/, tech: 'Nuxt' },
  { pattern: /^vite\.config/, tech: 'Vite' },
  { pattern: /^webpack\.config/, tech: 'Webpack' },
  { pattern: /^tsconfig/, tech: 'TypeScript' },
  { pattern: /^\.github\/workflows\//, tech: 'GitHub Actions' },
  { pattern: /^\.circleci\//, tech: 'CircleCI' },
  { pattern: /^Jenkinsfile$/, tech: 'Jenkins' },
  { pattern: /^\.travis\.yml$/, tech: 'Travis CI' },
  { pattern: /^vercel\.json$/, tech: 'Vercel' },
  { pattern: /^netlify\.toml$/, tech: 'Netlify' },
  { pattern: /^terraform\//, tech: 'Terraform' },
  { pattern: /\.tf$/, tech: 'Terraform' },
  { pattern: /^k8s\/|^kubernetes\//, tech: 'Kubernetes' },
  { pattern: /^\.env\.example$/, tech: 'dotenv' },
];

export function detectTechStack(
  packageJson: PackageJsonShape | null,
  tree: TreeEntry[],
): string[] {
  const detected = new Set<string>();

  // Detect from package.json dependencies
  if (packageJson) {
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    for (const dep of Object.keys(allDeps)) {
      const normalised = dep.toLowerCase();
      if (KNOWN_FRAMEWORKS[normalised]) {
        detected.add(KNOWN_FRAMEWORKS[normalised]!);
      }
    }
  }

  // Detect from file patterns in the tree
  for (const entry of tree) {
    const path = entry.path ?? '';
    for (const { pattern, tech } of FILE_PATTERN_STACKS) {
      if (pattern.test(path)) {
        detected.add(tech);
      }
    }
  }

  return [...detected].sort();
}

// ── Has tests? ─────────────────────────────────────────────────────────────

const TEST_PATTERNS = [
  /^tests?\//i,
  /^__tests__\//i,
  /^spec\//i,
  /^__spec__\//i,
  /\.test\.[jt]sx?$/,
  /\.spec\.[jt]sx?$/,
  /^test\.[jt]sx?$/,
  /^cypress\//i,
  /^e2e\//i,
  /^playwright\//i,
];

export function hasTests(tree: TreeEntry[]): boolean {
  return tree.some((entry) => {
    const path = entry.path ?? '';
    return TEST_PATTERNS.some((p) => p.test(path));
  });
}

// ── Has CI? ────────────────────────────────────────────────────────────────

const CI_PATTERNS = [
  /^\.github\/workflows\//,
  /^\.circleci\//,
  /^\.travis\.yml$/,
  /^Jenkinsfile$/,
  /^\.gitlab-ci\.yml$/,
  /^azure-pipelines\.yml$/,
  /^bitbucket-pipelines\.yml$/,
  /^\.buildkite\//,
];

export function hasCI(tree: TreeEntry[]): boolean {
  return tree.some((entry) => {
    const path = entry.path ?? '';
    return CI_PATTERNS.some((p) => p.test(path));
  });
}

// ── Has docs? (README is substantial — > 300 chars) ───────────────────────

export function hasDocs(readmeContent: string | null): boolean {
  if (!readmeContent) return false;
  return readmeContent.trim().length > 300;
}

// ── Count dependencies from package.json ──────────────────────────────────

export function countDependencies(packageJson: PackageJsonShape | null): number {
  if (!packageJson) return 0;
  const deps = Object.keys(packageJson.dependencies ?? {}).length;
  const devDeps = Object.keys(packageJson.devDependencies ?? {}).length;
  return deps + devDeps;
}
