/** @type {import('next').NextConfig} */
const securityHeaders = [
  {key: 'X-Frame-Options', value: 'SAMEORIGIN'},
  {key: 'X-Content-Type-Options', value: 'nosniff'},
  {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
]

const nextConfig = {
  async headers() {
    return [{source: '/:path*', headers: securityHeaders}]
  },
}

export default nextConfig
