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
        src: '/favicon.ico',
        sizes: '64x64',
        type: 'image/x-icon',
      },
    ],
  };
}
