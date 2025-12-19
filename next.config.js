/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server Actions are enabled by default in Next.js 14+
  // experimental.serverActions can be safely removed
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/index.html',
      },
    ]
  },
}

module.exports = nextConfig