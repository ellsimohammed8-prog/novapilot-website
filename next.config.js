/** @type {import('next').NextConfig} */

// Production-grade Content Security Policy (CSP)
// Fully supports Next.js static export / SSR, React 19 hydration, HTML5 video playback, Three.js WebGL shaders, and Canvas scripts.
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  media-src 'self' blob:;
  connect-src 'self' https://github.com https://api.github.com;
  font-src 'self' data:;
  worker-src 'self' blob:;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  object-src 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy,
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin',
  },
  {
    key: 'Cross-Origin-Resource-Policy',
    value: 'same-origin',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
];

const nextConfig = {
  // Strip X-Powered-By: Next.js header to prevent framework fingerprinting
  poweredByHeader: false,

  // Disable production browser sourcemaps to prevent leaking local filesystem structures
  productionBrowserSourceMaps: false,

  // Enable React Strict Mode
  reactStrictMode: true,

  // Apply Security Headers to all routes & assets
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/videos/:path*',
        headers: [
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Content-Type',
            value: 'video/mp4',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
        ],
      },
      {
        source: '/(.*)\\.(mp4|webm)',
        headers: [
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Content-Type',
            value: 'video/mp4',
          },
        ],
      },
    ];
  },

  // Directory traversal and index enumeration prevention
  async redirects() {
    return [
      {
        source: '/videos',
        destination: '/',
        permanent: true,
      },
      {
        source: '/images',
        destination: '/',
        permanent: true,
      },
      {
        source: '/fonts',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
