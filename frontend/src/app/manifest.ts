import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Next Chapter Study OS',
    short_name: 'Next Chapter',
    description: 'AI-Powered Study Tracker & Learning Planner',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B0A1A',
    theme_color: '#7C3AED',
    icons: [
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
