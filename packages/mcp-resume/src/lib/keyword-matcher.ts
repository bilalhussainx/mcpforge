import type { KeywordAnalysis } from '../types.js';

// ────────────────────────────────────────────────────────
// Comprehensive tech skills dictionary (300+ terms)
// ────────────────────────────────────────────────────────

export const TECH_SKILLS: Record<string, string[]> = {
  languages: [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Golang', 'Rust', 'C', 'C++',
    'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala', 'R', 'Perl', 'Haskell',
    'Elixir', 'Erlang', 'Clojure', 'Lua', 'Dart', 'Objective-C', 'MATLAB',
    'Shell', 'Bash', 'PowerShell', 'SQL', 'PL/SQL', 'T-SQL', 'GraphQL',
    'HTML', 'CSS', 'SASS', 'SCSS', 'Less', 'Solidity', 'VHDL', 'Verilog',
    'Assembly', 'Groovy', 'F#', 'OCaml', 'Julia', 'Zig', 'Nim', 'Crystal',
    'CoffeeScript', 'ActionScript', 'Apex', 'ABAP', 'COBOL', 'Fortran',
    'Prolog', 'Lisp', 'Scheme', 'Racket', 'Tcl', 'Ada', 'Pascal', 'Delphi',
  ],
  frontend_frameworks: [
    'React', 'React.js', 'ReactJS', 'Angular', 'AngularJS', 'Vue', 'Vue.js', 'VueJS',
    'Next.js', 'NextJS', 'Nuxt.js', 'NuxtJS', 'Svelte', 'SvelteKit',
    'Gatsby', 'Remix', 'Astro', 'Ember.js', 'EmberJS', 'Backbone.js',
    'Alpine.js', 'Solid.js', 'SolidJS', 'Preact', 'Lit', 'Stencil',
    'jQuery', 'Bootstrap', 'Tailwind CSS', 'Tailwind', 'Material UI', 'MUI',
    'Chakra UI', 'Ant Design', 'Semantic UI', 'Foundation', 'Bulma',
    'Styled Components', 'Emotion', 'CSS Modules', 'Radix UI', 'shadcn/ui',
    'Headless UI', 'Framer Motion', 'GSAP', 'Three.js', 'D3.js', 'D3',
    'Chart.js', 'Recharts', 'Highcharts', 'Plotly', 'Mapbox',
  ],
  backend_frameworks: [
    'Express', 'Express.js', 'ExpressJS', 'Fastify', 'Koa', 'Hapi', 'NestJS', 'Nest.js',
    'Django', 'Flask', 'FastAPI', 'Tornado', 'Pyramid', 'Bottle', 'Sanic',
    'Spring', 'Spring Boot', 'Spring MVC', 'Quarkus', 'Micronaut', 'Vert.x',
    'ASP.NET', '.NET', '.NET Core', 'Entity Framework', 'Blazor',
    'Ruby on Rails', 'Rails', 'Sinatra', 'Hanami',
    'Laravel', 'Symfony', 'CodeIgniter', 'CakePHP', 'Slim',
    'Gin', 'Echo', 'Fiber', 'Chi', 'Gorilla Mux',
    'Actix', 'Axum', 'Rocket', 'Warp',
    'Phoenix', 'Plug',
    'Play Framework', 'Akka', 'Ktor',
    'gRPC', 'tRPC', 'Hono',
  ],
  databases: [
    'PostgreSQL', 'Postgres', 'MySQL', 'MariaDB', 'SQLite', 'Oracle', 'SQL Server',
    'MSSQL', 'MongoDB', 'Mongoose', 'DynamoDB', 'Cassandra', 'CouchDB', 'CouchBase',
    'Redis', 'Memcached', 'Elasticsearch', 'OpenSearch', 'Solr',
    'Neo4j', 'ArangoDB', 'InfluxDB', 'TimescaleDB', 'ClickHouse',
    'Firebase', 'Firestore', 'Supabase', 'PlanetScale', 'Neon',
    'Prisma', 'TypeORM', 'Sequelize', 'Knex', 'Drizzle', 'SQLAlchemy',
    'Hibernate', 'MyBatis', 'ActiveRecord',
    'Snowflake', 'BigQuery', 'Redshift', 'Athena', 'Databricks',
    'HBase', 'Cockroach', 'CockroachDB', 'Vitess', 'TiDB',
    'FaunaDB', 'RethinkDB', 'LevelDB', 'RocksDB',
  ],
  cloud_aws: [
    'AWS', 'Amazon Web Services', 'EC2', 'S3', 'Lambda', 'API Gateway',
    'CloudFront', 'Route 53', 'RDS', 'Aurora', 'DynamoDB', 'ElastiCache',
    'ECS', 'EKS', 'Fargate', 'SQS', 'SNS', 'Kinesis', 'Step Functions',
    'CloudFormation', 'CDK', 'AWS CDK', 'SAM', 'Amplify',
    'IAM', 'Cognito', 'Secrets Manager', 'Parameter Store',
    'CloudWatch', 'X-Ray', 'EventBridge', 'AppSync',
    'Redshift', 'Athena', 'Glue', 'EMR', 'SageMaker',
    'CodePipeline', 'CodeBuild', 'CodeDeploy',
    'VPC', 'ELB', 'ALB', 'NLB', 'WAF', 'Shield',
  ],
  cloud_gcp: [
    'GCP', 'Google Cloud', 'Google Cloud Platform', 'Cloud Run', 'Cloud Functions',
    'GKE', 'App Engine', 'Compute Engine', 'Cloud Storage', 'BigQuery',
    'Cloud SQL', 'Firestore', 'Cloud Spanner', 'Pub/Sub', 'Cloud Dataflow',
    'Cloud Composer', 'Vertex AI', 'Cloud Build', 'Artifact Registry',
    'Cloud CDN', 'Cloud Armor', 'Identity Platform',
  ],
  cloud_azure: [
    'Azure', 'Microsoft Azure', 'Azure Functions', 'Azure App Service',
    'Azure DevOps', 'AKS', 'Azure Kubernetes Service', 'Azure SQL',
    'Cosmos DB', 'Azure Blob Storage', 'Azure Service Bus',
    'Azure Event Hubs', 'Azure AD', 'Azure Active Directory',
    'Azure Pipelines', 'Azure Monitor', 'Azure Key Vault',
    'Logic Apps', 'Power Automate', 'Azure Cognitive Services',
  ],
  devops_tools: [
    'Docker', 'Kubernetes', 'K8s', 'Helm', 'Istio', 'Linkerd',
    'Terraform', 'Pulumi', 'Ansible', 'Chef', 'Puppet', 'SaltStack',
    'Jenkins', 'GitHub Actions', 'GitLab CI', 'CircleCI', 'Travis CI',
    'ArgoCD', 'Argo CD', 'FluxCD', 'Tekton', 'Spinnaker',
    'Prometheus', 'Grafana', 'Datadog', 'New Relic', 'Splunk',
    'PagerDuty', 'OpsGenie', 'ELK Stack', 'Logstash', 'Kibana',
    'Jaeger', 'Zipkin', 'OpenTelemetry', 'Sentry',
    'Nginx', 'Apache', 'Caddy', 'HAProxy', 'Traefik', 'Envoy',
    'Vagrant', 'Packer', 'Consul', 'Vault', 'Nomad',
    'Podman', 'Buildah', 'Skaffold', 'Kustomize', 'Rancher',
  ],
  version_control: [
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN', 'Subversion',
    'Mercurial', 'Perforce', 'Azure Repos',
  ],
  testing: [
    'Jest', 'Mocha', 'Chai', 'Jasmine', 'Karma', 'Vitest',
    'Cypress', 'Playwright', 'Selenium', 'WebdriverIO', 'Puppeteer',
    'Testing Library', 'React Testing Library', 'Enzyme',
    'pytest', 'unittest', 'nose', 'Robot Framework',
    'JUnit', 'TestNG', 'Mockito', 'Spock',
    'RSpec', 'Minitest', 'Capybara',
    'PHPUnit', 'Pest',
    'Postman', 'Newman', 'Insomnia', 'k6', 'Locust', 'JMeter',
    'SonarQube', 'CodeClimate', 'Codecov', 'Coveralls',
    'Storybook', 'Chromatic',
  ],
  data_ml: [
    'Pandas', 'NumPy', 'SciPy', 'Matplotlib', 'Seaborn',
    'TensorFlow', 'PyTorch', 'Keras', 'scikit-learn', 'sklearn',
    'XGBoost', 'LightGBM', 'CatBoost', 'Hugging Face', 'Transformers',
    'NLTK', 'spaCy', 'Gensim', 'OpenCV', 'PIL', 'Pillow',
    'Apache Spark', 'Spark', 'PySpark', 'Hadoop', 'MapReduce',
    'Airflow', 'Apache Airflow', 'dbt', 'Dagster', 'Prefect',
    'Kafka', 'Apache Kafka', 'RabbitMQ', 'Celery',
    'Jupyter', 'Jupyter Notebook', 'Google Colab',
    'MLflow', 'Kubeflow', 'Weights & Biases', 'WandB',
    'OpenAI', 'LangChain', 'LlamaIndex', 'Pinecone', 'Weaviate',
    'ChromaDB', 'FAISS', 'Milvus', 'Qdrant',
    'Ray', 'Dask', 'Modin', 'Polars', 'Vaex',
    'ONNX', 'TensorRT', 'Triton',
  ],
  mobile: [
    'React Native', 'Flutter', 'Dart', 'SwiftUI', 'UIKit',
    'Jetpack Compose', 'Android SDK', 'iOS SDK', 'Xcode',
    'Expo', 'Ionic', 'Capacitor', 'Cordova', 'PhoneGap',
    'Xamarin', 'MAUI', 'NativeScript', 'KMM', 'Kotlin Multiplatform',
  ],
  api_protocols: [
    'REST', 'RESTful', 'REST API', 'GraphQL', 'gRPC', 'WebSocket', 'WebSockets',
    'SOAP', 'JSON-RPC', 'XML-RPC', 'Protocol Buffers', 'Protobuf',
    'OpenAPI', 'Swagger', 'API Gateway', 'OAuth', 'OAuth2', 'JWT',
    'SSE', 'Server-Sent Events', 'MQTT', 'AMQP', 'WebRTC',
    'HTTP/2', 'HTTP/3', 'QUIC',
  ],
  architecture: [
    'Microservices', 'Monolith', 'Serverless', 'Event-Driven',
    'Domain-Driven Design', 'DDD', 'CQRS', 'Event Sourcing',
    'SOA', 'Service-Oriented Architecture', 'Hexagonal Architecture',
    'Clean Architecture', 'MVC', 'MVVM', 'MVP',
    'Pub/Sub', 'Message Queue', 'Message Broker',
    'Load Balancing', 'Caching', 'CDN', 'Rate Limiting',
    'Circuit Breaker', 'Saga Pattern', 'Strangler Fig',
    'API-First', 'Design Patterns', 'SOLID',
  ],
  methodologies: [
    'Agile', 'Scrum', 'Kanban', 'SAFe', 'Lean',
    'CI/CD', 'Continuous Integration', 'Continuous Deployment', 'Continuous Delivery',
    'TDD', 'Test-Driven Development', 'BDD', 'Behavior-Driven Development',
    'DevOps', 'DevSecOps', 'SRE', 'Site Reliability Engineering',
    'GitOps', 'Infrastructure as Code', 'IaC',
    'Pair Programming', 'Code Review', 'Mob Programming',
    'Waterfall', 'Extreme Programming', 'XP',
    'Design Thinking', 'Sprint Planning', 'Retrospective',
  ],
  security: [
    'OWASP', 'SSL', 'TLS', 'HTTPS', 'SSH', 'VPN',
    'Encryption', 'Hashing', 'AES', 'RSA', 'bcrypt',
    'Penetration Testing', 'Pen Testing', 'Vulnerability Assessment',
    'SAST', 'DAST', 'IAST', 'SCA',
    'RBAC', 'ABAC', 'Zero Trust', 'MFA', 'SSO', 'SAML',
    'Snyk', 'Veracode', 'Trivy', 'Falco',
    'SOC 2', 'GDPR', 'HIPAA', 'PCI DSS', 'ISO 27001',
    'CIS Benchmarks', 'NIST',
  ],
  project_tools: [
    'Jira', 'Confluence', 'Asana', 'Trello', 'Linear', 'Notion',
    'Monday.com', 'ClickUp', 'Basecamp', 'Shortcut',
    'Figma', 'Sketch', 'Adobe XD', 'InVision', 'Zeplin', 'Miro',
    'Slack', 'Microsoft Teams', 'Zoom', 'Discord',
  ],
  other_tools: [
    'Webpack', 'Vite', 'Rollup', 'Parcel', 'esbuild', 'SWC',
    'Babel', 'ESLint', 'Prettier', 'Husky', 'lint-staged',
    'npm', 'yarn', 'pnpm', 'Bun', 'Deno', 'Node.js', 'NodeJS',
    'Vercel', 'Netlify', 'Heroku', 'Railway', 'Render', 'Fly.io',
    'Cloudflare', 'Cloudflare Workers', 'Akamai',
    'Stripe', 'PayPal', 'Twilio', 'SendGrid', 'Mailgun',
    'Auth0', 'Okta', 'Clerk', 'NextAuth',
    'Contentful', 'Sanity', 'Strapi', 'WordPress', 'Ghost',
    'LaunchDarkly', 'Optimizely', 'Segment', 'Mixpanel', 'Amplitude',
    'Google Analytics', 'Hotjar', 'FullStory',
    'Redis', 'Celery', 'Sidekiq',
    'Electron', 'Tauri',
    'Unity', 'Unreal Engine', 'Godot',
    'Blender', 'Maya',
  ],
};

// Flatten all skills into a lookup set (lowercase -> canonical form)
const SKILL_LOOKUP = new Map<string, string>();
for (const category of Object.values(TECH_SKILLS)) {
  for (const skill of category) {
    SKILL_LOOKUP.set(skill.toLowerCase(), skill);
  }
}

// ────────────────────────────────────────────────────────
// Action verbs commonly used in resumes
// ────────────────────────────────────────────────────────

const ACTION_VERBS = [
  'achieved', 'administered', 'analyzed', 'architected', 'automated',
  'built', 'championed', 'coached', 'collaborated', 'consolidated',
  'contributed', 'coordinated', 'created', 'debugged', 'decreased',
  'delivered', 'deployed', 'designed', 'developed', 'directed',
  'drove', 'eliminated', 'enabled', 'engineered', 'enhanced',
  'established', 'evaluated', 'executed', 'expanded', 'facilitated',
  'formulated', 'generated', 'grew', 'headed', 'identified',
  'implemented', 'improved', 'increased', 'influenced', 'initiated',
  'innovated', 'integrated', 'introduced', 'launched', 'led',
  'leveraged', 'maintained', 'managed', 'mentored', 'migrated',
  'modernized', 'monitored', 'negotiated', 'optimized', 'orchestrated',
  'overhauled', 'oversaw', 'partnered', 'performed', 'piloted',
  'pioneered', 'planned', 'presented', 'prioritized', 'produced',
  'programmed', 'proposed', 'published', 'rebuilt', 'reduced',
  'refactored', 'refined', 're-engineered', 'reorganized', 'resolved',
  'restructured', 'revamped', 'scaled', 'secured', 'simplified',
  'solved', 'spearheaded', 'standardized', 'streamlined', 'strengthened',
  'supervised', 'supported', 'tested', 'trained', 'transformed',
  'troubleshot', 'unified', 'upgraded', 'utilized', 'validated',
];

const ACTION_VERB_SET = new Set(ACTION_VERBS.map(v => v.toLowerCase()));

// ────────────────────────────────────────────────────────
// Soft skills
// ────────────────────────────────────────────────────────

const SOFT_SKILLS = [
  'communication', 'leadership', 'teamwork', 'problem-solving', 'problem solving',
  'critical thinking', 'time management', 'adaptability', 'creativity',
  'collaboration', 'attention to detail', 'work ethic', 'interpersonal',
  'decision-making', 'decision making', 'conflict resolution', 'emotional intelligence',
  'negotiation', 'presentation', 'public speaking', 'mentoring', 'mentorship',
  'project management', 'strategic thinking', 'analytical', 'analytical skills',
  'organizational', 'organization', 'multitasking', 'self-motivated',
  'customer-focused', 'customer focus', 'stakeholder management',
  'cross-functional', 'cross functional', 'team building', 'delegation',
  'initiative', 'proactive', 'accountability', 'resilience',
  'flexibility', 'empathy', 'persuasion', 'active listening',
  'written communication', 'verbal communication',
];

const SOFT_SKILL_SET = new Set(SOFT_SKILLS.map(s => s.toLowerCase()));

// ────────────────────────────────────────────────────────
// Requirement classification phrases
// ────────────────────────────────────────────────────────

const REQUIRED_INDICATORS = [
  'must have', 'required', 'requirements', 'minimum', 'essential',
  'mandatory', 'need', 'needs', 'shall', 'must', 'expect',
  'qualifications', 'responsibilities',
];

const NICE_TO_HAVE_INDICATORS = [
  'preferred', 'nice to have', 'nice-to-have', 'bonus', 'plus',
  'desirable', 'ideally', 'advantageous', 'a plus', 'would be nice',
  'optional', 'extra credit', 'not required', 'familiarity with',
  'exposure to', 'experience with',
];

// ────────────────────────────────────────────────────────
// Core functions
// ────────────────────────────────────────────────────────

/**
 * Extract all recognized tech skills/terms from text.
 * Uses word-boundary matching to avoid false positives.
 */
export function extractKeywordsFromText(text: string): string[] {
  const found = new Set<string>();
  const lowerText = text.toLowerCase();

  for (const [lowerSkill, canonical] of SKILL_LOOKUP.entries()) {
    // For short terms (1-2 chars like C, R), require word boundaries
    if (lowerSkill.length <= 2) {
      const re = new RegExp(`\\b${escapeRegex(lowerSkill)}\\b`, 'i');
      if (re.test(text)) {
        found.add(canonical);
      }
    } else {
      // For longer terms, simple case-insensitive includes with boundary check
      const idx = lowerText.indexOf(lowerSkill);
      if (idx !== -1) {
        // Verify word boundaries
        const before = idx > 0 ? lowerText[idx - 1]! : ' ';
        const after = idx + lowerSkill.length < lowerText.length ? lowerText[idx + lowerSkill.length]! : ' ';
        if (isWordBoundary(before) && isWordBoundary(after)) {
          found.add(canonical);
        }
      }
    }
  }

  return [...found].sort();
}

/**
 * Match resume keywords against job description keywords.
 * Returns matched (present in both) and missing (in job but not resume).
 */
export function matchKeywords(
  resumeText: string,
  jobKeywords: string[]
): { matched: string[]; missing: string[] } {
  const resumeKeywords = new Set(extractKeywordsFromText(resumeText).map(k => k.toLowerCase()));

  const matched: string[] = [];
  const missing: string[] = [];

  for (const keyword of jobKeywords) {
    if (resumeKeywords.has(keyword.toLowerCase())) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  }

  return { matched, missing };
}

/**
 * Calculate keyword density as a percentage.
 */
export function calculateKeywordDensity(matchedCount: number, totalCount: number): number {
  if (totalCount === 0) return 0;
  return Math.round((matchedCount / totalCount) * 100 * 10) / 10;
}

/**
 * Classify job description requirements into required vs nice-to-have.
 * Splits the text into sentences/bullet points and classifies each based on
 * proximity to indicator phrases.
 */
export function classifyRequirements(jobText: string): {
  required_skills: string[];
  nice_to_have: string[];
  technical_terms: string[];
} {
  const lines = jobText.split(/[\n\r]+/).map(l => l.trim()).filter(Boolean);
  const allKeywords = extractKeywordsFromText(jobText);

  const requiredKeywords = new Set<string>();
  const niceToHaveKeywords = new Set<string>();

  // Track the current context: are we in a "required" or "nice-to-have" section?
  let currentContext: 'required' | 'nice_to_have' | 'neutral' = 'neutral';

  for (const line of lines) {
    const lower = line.toLowerCase();

    // Check if this line is a section header that sets context
    if (REQUIRED_INDICATORS.some(ind => lower.includes(ind))) {
      currentContext = 'required';
    }
    if (NICE_TO_HAVE_INDICATORS.some(ind => lower.includes(ind))) {
      currentContext = 'nice_to_have';
    }

    // Extract keywords from this line
    const lineKeywords = extractKeywordsFromText(line);

    for (const kw of lineKeywords) {
      if (currentContext === 'nice_to_have') {
        niceToHaveKeywords.add(kw);
      } else {
        // Default to required if context is required or neutral
        requiredKeywords.add(kw);
      }
    }
  }

  // Remove from required if they also appear in nice-to-have (and not in required context)
  // But if something is in both, keep it in required
  const finalRequired = [...requiredKeywords].sort();
  const finalNiceToHave = [...niceToHaveKeywords].filter(k => !requiredKeywords.has(k)).sort();

  return {
    required_skills: finalRequired,
    nice_to_have: finalNiceToHave,
    technical_terms: allKeywords,
  };
}

/**
 * Extract action verbs from text (typically bullet points).
 */
export function extractActionVerbs(text: string): string[] {
  const found = new Set<string>();
  // Split into words and check each
  const words = text.split(/\s+/);

  for (const word of words) {
    const cleaned = word.toLowerCase().replace(/[^a-z-]/g, '');
    if (ACTION_VERB_SET.has(cleaned)) {
      found.add(cleaned);
    }
  }

  return [...found].sort();
}

/**
 * Extract soft skills from text.
 */
export function extractSoftSkills(text: string): string[] {
  const found = new Set<string>();
  const lowerText = text.toLowerCase();

  for (const skill of SOFT_SKILLS) {
    const lower = skill.toLowerCase();
    if (lowerText.includes(lower)) {
      found.add(skill);
    }
  }

  return [...found].sort();
}

/**
 * Full keyword analysis of a job description.
 */
export function analyzeJobDescription(jobDescription: string): KeywordAnalysis {
  const classified = classifyRequirements(jobDescription);
  const actionVerbs = extractActionVerbs(jobDescription);
  const softSkills = extractSoftSkills(jobDescription);

  return {
    required_skills: classified.required_skills,
    nice_to_have: classified.nice_to_have,
    action_verbs: actionVerbs,
    technical_terms: classified.technical_terms,
    soft_skills: softSkills,
  };
}

// ────────────────────────────────────────────────────────
// Utility helpers
// ────────────────────────────────────────────────────────

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isWordBoundary(ch: string): boolean {
  return /[\s,.;:!?()[\]{}<>/"'`~@#$%^&*+=|\\-]/.test(ch) || ch === '';
}
