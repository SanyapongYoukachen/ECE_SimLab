import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  redirects() {
    return [
      // Module 3 was the convolution theorem until it became AC circuits;
      // keep old bookmarks and shared links working.
      { source: '/theorem', destination: '/ac', permanent: true },
    ];
  },
};

export default nextConfig;
