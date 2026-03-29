/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const authBackendUrl = process.env.AUTH_BACKEND_URL || 'http://127.0.0.1:8000';
    return [
      // Proxy auth API calls to FastAPI backend
      // EXCEPT /api/auth/me and /api/auth/logout which are handled by Next.js
      {
        source: '/api/auth/signin',
        destination: `${authBackendUrl}/api/auth/signin`,
      },
      {
        source: '/api/auth/signup',
        destination: `${authBackendUrl}/api/auth/signup`,
      },
      {
        source: '/api/auth/verify-email',
        destination: `${authBackendUrl}/api/auth/verify-email`,
      },
      {
        source: '/api/auth/resend-verification',
        destination: `${authBackendUrl}/api/auth/resend-verification`,
      },
      {
        source: '/api/auth/callback/:path*',
        destination: `${authBackendUrl}/api/auth/callback/:path*`,
      },
      {
        source: '/api/auth/refresh',
        destination: `${authBackendUrl}/api/auth/refresh`,
      },
    ]
  },
}

module.exports = nextConfig