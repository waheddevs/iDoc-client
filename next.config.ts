import type { NextConfig } from 'next';
const config: NextConfig = {
  distDir: process.env.IDOC_TEST_BUILD === 'true' ? '.next-e2e' : '.next',
  poweredByHeader: false,
  devIndicators: false,
  logging: { incomingRequests: { ignore: [/\/api\/auth\/google\/callback/] } },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
};
export default config;
