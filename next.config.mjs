/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      appDir: true,
      serverComponentsExternalPackages: ['mongoose']
    },
    images: {
      domains: [
        'localhost',
        'images.unsplash.com',
        'res.cloudinary.com',
        // Add your image hosting domains here
      ],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**',
        },
      ],
    },
    env: {
      MONGODB_URI: process.env.MONGODB_URI,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      WHATSAPP_API_URL: process.env.WHATSAPP_API_URL,
      WHATSAPP_API_TOKEN: process.env.WHATSAPP_API_TOKEN,
    },
    webpack: (config) => {
      config.experiments = {
        ...config.experiments,
        topLevelAwait: true,
      }
      return config
    },
    async headers() {
      return [
        {
          source: '/api/:path*',
          headers: [
            { key: 'Access-Control-Allow-Credentials', value: 'true' },
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
            { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
          ]
        }
      ]
    },
    async rewrites() {
      return [
        {
          source: '/dashboard',
          destination: '/dashboard/redirect'
        }
      ]
    }
  }
  
 export default nextConfig