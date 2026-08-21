/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:5000/api'
    const backendOrigin = backendUrl.replace(/\/api\/?$/, '')
    return [
      { source: '/backend-api/:path*', destination: `${backendUrl}/:path*` },
      { source: '/company_logo/:path*', destination: `${backendOrigin}/company_logo/:path*` },
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
