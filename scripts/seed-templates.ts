import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
config({ path: '.env.local' })

// Helper to create a tech node
function techNode(techId: number, name: string, category: string, color: string, x: number, y: number) {
  return {
    id: `tech-${techId}`,
    type: 'tech',
    position: { x, y },
    data: { label: name, icon: '', category, color, techId, direction: 'TB' },
  }
}

function rootNode(name: string, type: 'website' | 'app') {
  return {
    id: 'root',
    type: 'root',
    position: { x: 0, y: 0 },
    data: { label: name, icon: '', projectType: type, isRoot: true, direction: 'TB' },
    draggable: false,
  }
}

function edge(sourceId: string, targetId: string) {
  return { id: `e-${sourceId}-${targetId}`, source: sourceId, target: targetId, type: 'deletable' }
}

const TEMPLATES = [
  {
    name: 'Jamstack Blog',
    description: 'Modern blog with static site generation, headless CMS, and CDN deployment. Perfect for content-focused sites with fast load times.',
    project_type: 'website',
    icon: '📝',
    nodes: [
      rootNode('Jamstack Blog', 'website'),
      techNode(114, 'Next.js', 'Frontend Framework', '#000000', 0, 120),
      techNode(108, 'React', 'Frontend Framework', '#61DAFB', -200, 120),
      techNode(33, 'TypeScript', 'Language', '#3178C6', 200, 120),
      techNode(123, 'Tailwind CSS', 'CSS Framework', '#06B6D4', -200, 240),
      techNode(99, 'Sanity', 'CMS', '#F03E2F', 0, 240),
      techNode(54, 'Vercel', 'Hosting', '#000000', 200, 240),
      techNode(136, 'Google Analytics', 'Analytics', '#E37400', -200, 360),
      techNode(152, 'Sentry', 'Monitoring', '#362D59', 0, 360),
      techNode(160, 'Cloudinary', 'Image / Media', '#3448C5', 200, 360),
    ],
    edges: [
      edge('root', 'tech-114'),
      edge('root', 'tech-108'),
      edge('root', 'tech-33'),
      edge('tech-114', 'tech-123'),
      edge('tech-114', 'tech-99'),
      edge('tech-114', 'tech-54'),
      edge('tech-54', 'tech-136'),
      edge('tech-54', 'tech-152'),
      edge('tech-99', 'tech-160'),
    ],
  },
  {
    name: 'E-commerce Store',
    description: 'Full-featured online store with payment processing, product management, and order tracking. Built for conversion and scale.',
    project_type: 'website',
    icon: '🛒',
    nodes: [
      rootNode('E-commerce Store', 'website'),
      techNode(114, 'Next.js', 'Frontend Framework', '#000000', 0, 120),
      techNode(123, 'Tailwind CSS', 'CSS Framework', '#06B6D4', -300, 120),
      techNode(33, 'TypeScript', 'Language', '#3178C6', 300, 120),
      techNode(64, 'Shopify', 'Ecommerce', '#7AB55C', -200, 240),
      techNode(146, 'Stripe', 'Payment', '#635BFF', 0, 240),
      techNode(54, 'Vercel', 'Hosting', '#000000', 200, 240),
      techNode(74, 'Neon', 'Database', '#00E599', -200, 360),
      techNode(73, 'Redis', 'Database', '#FF4438', 0, 360),
      techNode(160, 'Cloudinary', 'Image / Media', '#3448C5', 200, 360),
      techNode(136, 'Google Analytics', 'Analytics', '#E37400', -100, 480),
      techNode(152, 'Sentry', 'Monitoring', '#362D59', 100, 480),
    ],
    edges: [
      edge('root', 'tech-114'),
      edge('root', 'tech-123'),
      edge('root', 'tech-33'),
      edge('tech-114', 'tech-64'),
      edge('tech-114', 'tech-146'),
      edge('tech-114', 'tech-54'),
      edge('tech-64', 'tech-74'),
      edge('tech-146', 'tech-74'),
      edge('tech-114', 'tech-73'),
      edge('tech-114', 'tech-160'),
      edge('tech-54', 'tech-136'),
      edge('tech-54', 'tech-152'),
    ],
  },
  {
    name: 'SaaS Dashboard',
    description: 'Full-stack SaaS application with authentication, database, real-time features, and monitoring. Production-ready architecture.',
    project_type: 'website',
    icon: '📊',
    nodes: [
      rootNode('SaaS Dashboard', 'website'),
      techNode(114, 'Next.js', 'Frontend Framework', '#000000', 0, 120),
      techNode(33, 'TypeScript', 'Language', '#3178C6', -300, 120),
      techNode(123, 'Tailwind CSS', 'CSS Framework', '#06B6D4', 300, 120),
      techNode(76, 'Supabase', 'Database', '#3FCF8E', -200, 240),
      techNode(142, 'Auth0', 'Authentication', '#EB5424', 0, 240),
      techNode(54, 'Vercel', 'Hosting', '#000000', 200, 240),
      techNode(73, 'Redis', 'Database', '#FF4438', -300, 360),
      techNode(156, 'Resend', 'Email', '#000000', -100, 360),
      techNode(146, 'Stripe', 'Payment', '#635BFF', 100, 360),
      techNode(152, 'Sentry', 'Monitoring', '#362D59', 300, 360),
      techNode(136, 'Google Analytics', 'Analytics', '#E37400', -200, 480),
      techNode(171, 'GitHub Actions', 'CI/CD', '#2088FF', 0, 480),
      techNode(85, 'GitHub', 'Repository', '#181717', 200, 480),
    ],
    edges: [
      edge('root', 'tech-114'),
      edge('root', 'tech-33'),
      edge('root', 'tech-123'),
      edge('tech-114', 'tech-76'),
      edge('tech-114', 'tech-142'),
      edge('tech-114', 'tech-54'),
      edge('tech-76', 'tech-73'),
      edge('tech-142', 'tech-156'),
      edge('tech-114', 'tech-146'),
      edge('tech-54', 'tech-152'),
      edge('tech-54', 'tech-136'),
      edge('tech-85', 'tech-171'),
      edge('tech-171', 'tech-54'),
    ],
  },
  {
    name: 'Marketing Site',
    description: 'High-performance marketing website with CMS, analytics, and A/B testing. Optimised for SEO, speed, and conversion tracking.',
    project_type: 'website',
    icon: '🚀',
    nodes: [
      rootNode('Marketing Site', 'website'),
      techNode(113, 'Astro', 'Frontend Framework', '#BC52EE', 0, 120),
      techNode(123, 'Tailwind CSS', 'CSS Framework', '#06B6D4', -200, 120),
      techNode(33, 'TypeScript', 'Language', '#3178C6', 200, 120),
      techNode(98, 'Contentful', 'CMS', '#2478CC', -200, 240),
      techNode(55, 'Netlify', 'Hosting', '#00C7B7', 0, 240),
      techNode(160, 'Cloudinary', 'Image / Media', '#3448C5', 200, 240),
      techNode(136, 'Google Analytics', 'Analytics', '#E37400', -100, 360),
      techNode(177, 'Figma', 'Design', '#F24E1E', 100, 360),
    ],
    edges: [
      edge('root', 'tech-113'),
      edge('root', 'tech-123'),
      edge('root', 'tech-33'),
      edge('tech-113', 'tech-98'),
      edge('tech-113', 'tech-55'),
      edge('tech-113', 'tech-160'),
      edge('tech-55', 'tech-136'),
      edge('tech-177', 'tech-113'),
    ],
  },
  {
    name: 'Mobile App',
    description: 'Cross-platform mobile application with authentication, cloud database, push notifications, and analytics.',
    project_type: 'app',
    icon: '📱',
    nodes: [
      rootNode('Mobile App', 'app'),
      techNode(119, 'Flutter', 'Frontend Framework', '#02569B', 0, 120),
      techNode(144, 'Firebase Auth', 'Authentication', '#DD2C00', -200, 240),
      techNode(72, 'MongoDB', 'Database', '#47A248', 0, 240),
      techNode(56, 'AWS', 'Hosting', '#232F3E', 200, 240),
      techNode(160, 'Cloudinary', 'Image / Media', '#3448C5', -200, 360),
      techNode(136, 'Google Analytics', 'Analytics', '#E37400', 0, 360),
      techNode(152, 'Sentry', 'Monitoring', '#362D59', 200, 360),
      techNode(85, 'GitHub', 'Repository', '#181717', 0, 480),
    ],
    edges: [
      edge('root', 'tech-119'),
      edge('tech-119', 'tech-144'),
      edge('tech-119', 'tech-72'),
      edge('tech-119', 'tech-56'),
      edge('tech-56', 'tech-160'),
      edge('tech-56', 'tech-136'),
      edge('tech-56', 'tech-152'),
      edge('tech-119', 'tech-85'),
    ],
  },
  {
    name: 'Headless CMS Site',
    description: 'Content-driven website with a headless CMS, GraphQL API, and modern frontend. Ideal for editorial teams and content-heavy sites.',
    project_type: 'website',
    icon: '✏️',
    nodes: [
      rootNode('Headless CMS Site', 'website'),
      techNode(115, 'Nuxt.js', 'Frontend Framework', '#00DC82', 0, 120),
      techNode(109, 'Vue.js', 'Frontend Framework', '#4FC08D', -200, 120),
      techNode(33, 'TypeScript', 'Language', '#3178C6', 200, 120),
      techNode(99, 'Sanity', 'CMS', '#F03E2F', -200, 240),
      techNode(131, 'GraphQL', 'API', '#E10098', 0, 240),
      techNode(54, 'Vercel', 'Hosting', '#000000', 200, 240),
      techNode(160, 'Cloudinary', 'Image / Media', '#3448C5', -100, 360),
      techNode(136, 'Google Analytics', 'Analytics', '#E37400', 100, 360),
    ],
    edges: [
      edge('root', 'tech-115'),
      edge('root', 'tech-109'),
      edge('root', 'tech-33'),
      edge('tech-115', 'tech-99'),
      edge('tech-99', 'tech-131'),
      edge('tech-115', 'tech-54'),
      edge('tech-99', 'tech-160'),
      edge('tech-54', 'tech-136'),
    ],
  },
]

async function main() {
  const sql = neon(process.env.DATABASE_URL!)

  // Clear existing templates
  await sql`DELETE FROM project_templates`

  for (let i = 0; i < TEMPLATES.length; i++) {
    const t = TEMPLATES[i]
    await sql`
      INSERT INTO project_templates (name, description, project_type, icon, canvas_nodes, canvas_edges, canvas_direction, sort_order)
      VALUES (${t.name}, ${t.description}, ${t.project_type}, ${t.icon}, ${JSON.stringify(t.nodes)}, ${JSON.stringify(t.edges)}, ${'TB'}, ${i + 1})
    `
    console.log(`  ✓ ${t.icon} ${t.name} (${t.nodes.length - 1} techs, ${t.edges.length} connections)`)
  }

  console.log(`\n✓ ${TEMPLATES.length} templates seeded`)
}

main().catch(e => { console.error('Failed:', e.message); process.exit(1) })
