'use client'

const brands = [
  { name: 'Sitecore', src: '/images/brands/sitecore.svg' },
  { name: 'Contentful', src: '/images/brands/contentful.svg' },
  { name: 'React', src: '/images/brands/react.svg' },
  { name: 'Vercel', src: '/images/brands/vercel.svg' },
  { name: 'Azure DevOps', src: '/images/brands/azure-devops.svg' },
  { name: 'Sanity', src: '/images/brands/sanity.svg' },
  { name: 'Strapi', src: '/images/brands/strapi.svg' },
  { name: 'Next.js', src: '/images/brands/nextjs.svg' },
  { name: 'TypeScript', src: '/images/brands/typescript.svg' },
  { name: 'Google Analytics', src: '/images/brands/google-analytics.svg' },
  { name: 'Cloudinary', src: '/images/brands/cloudinary.svg' },
  { name: 'Algolia', src: '/images/brands/algolia.svg' },
  { name: 'AWS S3', src: '/images/brands/aws-s3.svg' },
  { name: 'Node.js', src: '/images/brands/nodejs.svg' },
  { name: 'GraphQL', src: '/images/brands/graphql.svg' },
  { name: 'Tailwind CSS', src: '/images/brands/tailwind.svg' },
  { name: 'Figma', src: '/images/brands/figma.svg' },
  { name: 'GitHub', src: '/images/brands/github.svg' },
  { name: 'Docker', src: '/images/brands/docker.svg' },
  { name: 'PostgreSQL', src: '/images/brands/postgresql.svg' },
]

export function BrandGrid() {
  return (
    <div className="v2-clients-strip">
      <p>Technologies we work with</p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
        gap: '20px',
        alignItems: 'center',
        justifyItems: 'center',
      }}>
        {brands.map(b => (
          <div
            key={b.name}
            title={b.name}
            style={{
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.5,
              transition: 'opacity .2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
          >
            <img
              src={b.src}
              alt={b.name}
              style={{ width: 36, height: 36, objectFit: 'contain' }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
