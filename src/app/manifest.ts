import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'JannahFlow - Moslem Family Management',
    short_name: 'JannahFlow',
    description: 'Aplikasi Moslem Family Management untuk manajemen ibadah, keuangan, dan kedekatan keluarga.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#059669', // emerald-600
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
