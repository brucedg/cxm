import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
config({ path: '.env.local' })

// Technology definitions: [simpleicons slug, display name, category, tags[]]
const TECHNOLOGIES: [string, string, string, string[]][] = [
  // Search
  ['algolia', 'Algolia', 'Search', ['search', 'saas']],
  ['elasticsearch', 'Elasticsearch', 'Search', ['search', 'open-source']],
  ['meilisearch', 'Meilisearch', 'Search', ['search', 'open-source']],
  ['typesense', 'Typesense', 'Search', ['search', 'open-source']],

  // Code Editor / IDE
  ['visualstudiocode', 'VS Code', 'Code Editor', ['editor', 'ide', 'microsoft']],
  ['jetbrains', 'JetBrains', 'Code Editor', ['editor', 'ide']],
  ['neovim', 'Neovim', 'Code Editor', ['editor', 'terminal']],
  ['cursor', 'Cursor', 'Code Editor', ['editor', 'ai']],

  // Development Language
  ['typescript', 'TypeScript', 'Language', ['language', 'microsoft']],
  ['javascript', 'JavaScript', 'Language', ['language', 'web']],
  ['python', 'Python', 'Language', ['language', 'data']],
  ['rust', 'Rust', 'Language', ['language', 'systems']],
  ['go', 'Go', 'Language', ['language', 'google']],
  ['java', 'Java', 'Language', ['language', 'enterprise']],
  ['csharp', 'C#', 'Language', ['language', 'microsoft', 'dotnet']],
  ['php', 'PHP', 'Language', ['language', 'web']],
  ['ruby', 'Ruby', 'Language', ['language', 'web']],
  ['swift', 'Swift', 'Language', ['language', 'apple', 'mobile']],
  ['kotlin', 'Kotlin', 'Language', ['language', 'android', 'mobile']],
  ['dart', 'Dart', 'Language', ['language', 'google', 'mobile']],

  // Marketing
  ['hubspot', 'HubSpot', 'Marketing', ['marketing', 'crm']],
  ['mailchimp', 'Mailchimp', 'Marketing', ['marketing', 'email']],
  ['googleads', 'Google Ads', 'Marketing', ['marketing', 'advertising']],
  ['meta', 'Meta Ads', 'Marketing', ['marketing', 'advertising', 'social']],

  // Personalisation
  ['optimizely', 'Optimizely', 'Personalisation', ['personalisation', 'testing']],

  // CDN
  ['cloudflare', 'Cloudflare', 'CDN', ['cdn', 'security', 'dns']],
  ['fastly', 'Fastly', 'CDN', ['cdn', 'edge']],
  ['akamai', 'Akamai', 'CDN', ['cdn', 'enterprise']],
  ['amazonaws', 'AWS CloudFront', 'CDN', ['cdn', 'aws']],

  // Hosting
  ['vercel', 'Vercel', 'Hosting', ['hosting', 'serverless', 'nextjs']],
  ['netlify', 'Netlify', 'Hosting', ['hosting', 'serverless']],
  ['amazonaws', 'AWS', 'Hosting', ['hosting', 'cloud', 'enterprise']],
  ['googlecloud', 'Google Cloud', 'Hosting', ['hosting', 'cloud']],
  ['microsoftazure', 'Azure', 'Hosting', ['hosting', 'cloud', 'microsoft']],
  ['railway', 'Railway', 'Hosting', ['hosting', 'paas']],
  ['render', 'Render', 'Hosting', ['hosting', 'paas']],
  ['fly.io', 'Fly.io', 'Hosting', ['hosting', 'edge']],
  ['digitalocean', 'DigitalOcean', 'Hosting', ['hosting', 'cloud']],
  ['heroku', 'Heroku', 'Hosting', ['hosting', 'paas']],

  // Ecommerce
  ['shopify', 'Shopify', 'Ecommerce', ['ecommerce', 'saas']],
  ['bigcommerce', 'BigCommerce', 'Ecommerce', ['ecommerce', 'saas']],
  ['magento', 'Magento', 'Ecommerce', ['ecommerce', 'open-source']],
  ['woocommerce', 'WooCommerce', 'Ecommerce', ['ecommerce', 'wordpress']],
  ['stripe', 'Stripe (Commerce)', 'Ecommerce', ['ecommerce', 'payments']],
  ['medusa', 'Medusa', 'Ecommerce', ['ecommerce', 'headless']],

  // Database
  ['postgresql', 'PostgreSQL', 'Database', ['database', 'sql', 'open-source']],
  ['mysql', 'MySQL', 'Database', ['database', 'sql', 'open-source']],
  ['mongodb', 'MongoDB', 'Database', ['database', 'nosql']],
  ['redis', 'Redis', 'Database', ['database', 'cache', 'in-memory']],
  ['neon', 'Neon', 'Database', ['database', 'serverless', 'postgres']],
  ['planetscale', 'PlanetScale', 'Database', ['database', 'serverless', 'mysql']],
  ['supabase', 'Supabase', 'Database', ['database', 'baas', 'postgres']],
  ['turso', 'Turso', 'Database', ['database', 'edge', 'sqlite']],
  ['sqlite', 'SQLite', 'Database', ['database', 'embedded']],
  ['cockroachlabs', 'CockroachDB', 'Database', ['database', 'distributed']],
  ['dynamodb', 'DynamoDB', 'Database', ['database', 'aws', 'nosql']],

  // AI Tools
  ['anthropic', 'Claude', 'AI Tools', ['ai', 'llm', 'anthropic']],
  ['openai', 'ChatGPT', 'AI Tools', ['ai', 'llm', 'openai']],
  ['github', 'GitHub Copilot', 'AI Tools', ['ai', 'coding']],
  ['googlegemini', 'Google Gemini', 'AI Tools', ['ai', 'llm', 'google']],

  // Repository Management
  ['github', 'GitHub', 'Repository', ['git', 'hosting']],
  ['gitlab', 'GitLab', 'Repository', ['git', 'hosting', 'cicd']],
  ['bitbucket', 'Bitbucket', 'Repository', ['git', 'hosting', 'atlassian']],
  ['azuredevops', 'Azure DevOps', 'Repository', ['git', 'hosting', 'microsoft']],

  // Virtualisation
  ['vmware', 'VMware', 'Virtualisation', ['virtualisation', 'enterprise']],
  ['proxmox', 'Proxmox', 'Virtualisation', ['virtualisation', 'open-source']],
  ['virtualbox', 'VirtualBox', 'Virtualisation', ['virtualisation', 'oracle']],

  // Containerisation
  ['docker', 'Docker', 'Containerisation', ['container', 'devops']],
  ['kubernetes', 'Kubernetes', 'Containerisation', ['container', 'orchestration']],
  ['podman', 'Podman', 'Containerisation', ['container', 'open-source']],
  ['containerd', 'containerd', 'Containerisation', ['container', 'runtime']],
  ['rancher', 'Rancher', 'Containerisation', ['container', 'management']],

  // CMS
  ['sitecore', 'Sitecore', 'CMS', ['cms', 'enterprise', 'dotnet']],
  ['contentful', 'Contentful', 'CMS', ['cms', 'headless', 'saas']],
  ['sanity', 'Sanity', 'CMS', ['cms', 'headless']],
  ['strapi', 'Strapi', 'CMS', ['cms', 'headless', 'open-source']],
  ['wordpress', 'WordPress', 'CMS', ['cms', 'open-source', 'php']],
  ['storyblok', 'Storyblok', 'CMS', ['cms', 'headless', 'visual']],
  ['prismic', 'Prismic', 'CMS', ['cms', 'headless']],
  ['directus', 'Directus', 'CMS', ['cms', 'headless', 'open-source']],
  ['ghost', 'Ghost', 'CMS', ['cms', 'blog', 'open-source']],
  ['drupal', 'Drupal', 'CMS', ['cms', 'open-source', 'php']],
  ['keystonejs', 'Keystone', 'CMS', ['cms', 'headless', 'graphql']],

  // Frontend Framework
  ['react', 'React', 'Frontend Framework', ['frontend', 'ui', 'meta']],
  ['vuedotjs', 'Vue.js', 'Frontend Framework', ['frontend', 'ui']],
  ['angular', 'Angular', 'Frontend Framework', ['frontend', 'ui', 'google']],
  ['svelte', 'Svelte', 'Frontend Framework', ['frontend', 'ui', 'compiler']],
  ['solid', 'SolidJS', 'Frontend Framework', ['frontend', 'ui', 'reactive']],
  ['astro', 'Astro', 'Frontend Framework', ['frontend', 'static', 'mpa']],
  ['nextdotjs', 'Next.js', 'Frontend Framework', ['frontend', 'react', 'fullstack']],
  ['nuxtdotjs', 'Nuxt.js', 'Frontend Framework', ['frontend', 'vue', 'fullstack']],
  ['remix', 'Remix', 'Frontend Framework', ['frontend', 'react', 'fullstack']],
  ['gatsby', 'Gatsby', 'Frontend Framework', ['frontend', 'react', 'static']],
  ['htmx', 'htmx', 'Frontend Framework', ['frontend', 'hypermedia']],
  ['flutter', 'Flutter', 'Frontend Framework', ['frontend', 'mobile', 'cross-platform']],
  ['reactnative', 'React Native', 'Frontend Framework', ['frontend', 'mobile', 'react']],
  ['electron', 'Electron', 'Frontend Framework', ['frontend', 'desktop', 'cross-platform']],
  ['tauri', 'Tauri', 'Frontend Framework', ['frontend', 'desktop', 'rust']],

  // CSS Framework
  ['tailwindcss', 'Tailwind CSS', 'CSS Framework', ['css', 'utility']],
  ['bootstrap', 'Bootstrap', 'CSS Framework', ['css', 'components']],
  ['chakraui', 'Chakra UI', 'CSS Framework', ['css', 'components', 'react']],
  ['mui', 'Material UI', 'CSS Framework', ['css', 'components', 'react']],
  ['radixui', 'Radix UI', 'CSS Framework', ['css', 'primitives', 'react']],
  ['shadcnui', 'shadcn/ui', 'CSS Framework', ['css', 'components', 'tailwind']],
  ['sass', 'Sass', 'CSS Framework', ['css', 'preprocessor']],
  ['styledcomponents', 'styled-components', 'CSS Framework', ['css', 'css-in-js']],

  // API / Integration
  ['graphql', 'GraphQL', 'API', ['api', 'query']],
  ['trpc', 'tRPC', 'API', ['api', 'typescript', 'rpc']],
  ['swagger', 'OpenAPI / Swagger', 'API', ['api', 'rest', 'docs']],
  ['apollo', 'Apollo GraphQL', 'API', ['api', 'graphql', 'client']],
  ['postman', 'Postman', 'API', ['api', 'testing', 'docs']],

  // Analytics
  ['googleanalytics', 'Google Analytics', 'Analytics', ['analytics', 'google']],
  ['mixpanel', 'Mixpanel', 'Analytics', ['analytics', 'product']],
  ['posthog', 'PostHog', 'Analytics', ['analytics', 'open-source']],
  ['amplitude', 'Amplitude', 'Analytics', ['analytics', 'product']],
  ['plausibleanalytics', 'Plausible', 'Analytics', ['analytics', 'privacy']],
  ['hotjar', 'Hotjar', 'Analytics', ['analytics', 'heatmaps']],

  // Authentication
  ['auth0', 'Auth0', 'Authentication', ['auth', 'identity', 'saas']],
  ['clerk', 'Clerk', 'Authentication', ['auth', 'identity']],
  ['firebase', 'Firebase Auth', 'Authentication', ['auth', 'google', 'baas']],
  ['okta', 'Okta', 'Authentication', ['auth', 'enterprise', 'identity']],

  // Payment
  ['stripe', 'Stripe', 'Payment', ['payment', 'billing']],
  ['paypal', 'PayPal', 'Payment', ['payment']],
  ['square', 'Square', 'Payment', ['payment', 'pos']],
  ['adyen', 'Adyen', 'Payment', ['payment', 'enterprise']],

  // Monitoring / Observability
  ['datadog', 'Datadog', 'Monitoring', ['monitoring', 'observability']],
  ['newrelic', 'New Relic', 'Monitoring', ['monitoring', 'apm']],
  ['sentry', 'Sentry', 'Monitoring', ['monitoring', 'errors']],
  ['grafana', 'Grafana', 'Monitoring', ['monitoring', 'dashboards']],
  ['prometheus', 'Prometheus', 'Monitoring', ['monitoring', 'metrics']],
  ['pagerduty', 'PagerDuty', 'Monitoring', ['monitoring', 'incidents']],

  // Email
  ['resend', 'Resend', 'Email', ['email', 'transactional']],
  ['sendgrid', 'SendGrid', 'Email', ['email', 'transactional']],
  ['mailgun', 'Mailgun', 'Email', ['email', 'transactional']],
  ['amazonsimpleemailservice', 'Amazon SES', 'Email', ['email', 'aws']],

  // Image / Media
  ['cloudinary', 'Cloudinary', 'Image / Media', ['media', 'images', 'cdn']],
  ['imgix', 'imgix', 'Image / Media', ['media', 'images']],
  ['mux', 'Mux', 'Image / Media', ['media', 'video']],
  ['uploadthing', 'UploadThing', 'Image / Media', ['media', 'uploads']],

  // Testing
  ['jest', 'Jest', 'Testing', ['testing', 'unit']],
  ['vitest', 'Vitest', 'Testing', ['testing', 'unit', 'vite']],
  ['playwright', 'Playwright', 'Testing', ['testing', 'e2e', 'microsoft']],
  ['cypress', 'Cypress', 'Testing', ['testing', 'e2e']],
  ['testinglibrary', 'Testing Library', 'Testing', ['testing', 'unit', 'react']],
  ['selenium', 'Selenium', 'Testing', ['testing', 'e2e', 'browser']],
  ['storybook', 'Storybook', 'Testing', ['testing', 'ui', 'components']],

  // CI/CD
  ['githubactions', 'GitHub Actions', 'CI/CD', ['cicd', 'github']],
  ['gitlab', 'GitLab CI', 'CI/CD', ['cicd', 'gitlab']],
  ['circleci', 'CircleCI', 'CI/CD', ['cicd']],
  ['jenkins', 'Jenkins', 'CI/CD', ['cicd', 'open-source']],
  ['terraform', 'Terraform', 'CI/CD', ['iac', 'devops']],
  ['pulumi', 'Pulumi', 'CI/CD', ['iac', 'devops']],

  // Design
  ['figma', 'Figma', 'Design', ['design', 'ui']],
  ['sketch', 'Sketch', 'Design', ['design', 'ui', 'mac']],
  ['adobexd', 'Adobe XD', 'Design', ['design', 'ui', 'adobe']],
  ['framer', 'Framer', 'Design', ['design', 'prototyping']],
  ['canva', 'Canva', 'Design', ['design', 'graphics']],
  ['invision', 'InVision', 'Design', ['design', 'prototyping']],

  // Build Tools / Bundlers
  ['vite', 'Vite', 'Build Tools', ['bundler', 'dev-server']],
  ['webpack', 'Webpack', 'Build Tools', ['bundler']],
  ['esbuild', 'esbuild', 'Build Tools', ['bundler', 'fast']],
  ['turborepo', 'Turborepo', 'Build Tools', ['monorepo', 'build']],
  ['nx', 'Nx', 'Build Tools', ['monorepo', 'build']],
  ['bun', 'Bun', 'Build Tools', ['runtime', 'bundler']],
  ['deno', 'Deno', 'Build Tools', ['runtime', 'typescript']],
  ['nodedotjs', 'Node.js', 'Build Tools', ['runtime', 'javascript']],
  ['pnpm', 'pnpm', 'Build Tools', ['package-manager']],

  // Collaboration
  ['slack', 'Slack', 'Collaboration', ['messaging', 'team']],
  ['notion', 'Notion', 'Collaboration', ['docs', 'wiki']],
  ['linear', 'Linear', 'Collaboration', ['project-management', 'issues']],
  ['jira', 'Jira', 'Collaboration', ['project-management', 'atlassian']],
  ['confluence', 'Confluence', 'Collaboration', ['docs', 'atlassian']],
  ['discord', 'Discord', 'Collaboration', ['messaging', 'community']],
  ['microsoftteams', 'Microsoft Teams', 'Collaboration', ['messaging', 'microsoft']],
]

async function main() {
  const sql = neon(process.env.DATABASE_URL!)

  // Dynamic import of simple-icons
  const si = await import('simple-icons')

  let inserted = 0
  let skipped = 0
  let noIcon = 0

  for (const [slug, name, category, tags] of TECHNOLOGIES) {
    // Try to find the icon in simple-icons
    const key = `si${slug.charAt(0).toUpperCase()}${slug.slice(1)}` as keyof typeof si
    const icon = (si as any)[key]

    let svgLogo = ''
    let color = ''

    if (icon) {
      svgLogo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="${icon.path}"/></svg>`
      color = `#${icon.hex}`
    } else {
      noIcon++
    }

    try {
      await sql`
        INSERT INTO brands (name, category, svg_logo, color, tags, description, sort_order)
        VALUES (${name}, ${category}, ${svgLogo}, ${color}, ${tags}, ${''}, ${inserted})
        ON CONFLICT DO NOTHING
      `
      inserted++
      if (inserted % 20 === 0) console.log(`  ... ${inserted} technologies inserted`)
    } catch (e: any) {
      // Might be duplicate name — try update instead
      await sql`
        UPDATE brands SET
          category = ${category},
          svg_logo = COALESCE(NULLIF(${svgLogo}, ''), svg_logo),
          color = COALESCE(NULLIF(${color}, ''), color),
          tags = ${tags}
        WHERE name = ${name}
      `
      skipped++
    }
  }

  console.log(`\n✓ Done: ${inserted} inserted, ${skipped} updated, ${noIcon} missing icons`)
}

main().catch(e => { console.error('Seed failed:', e.message); process.exit(1) })
