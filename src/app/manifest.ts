
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BankTalabat - طلبات البنك',
    short_name: 'BankTalabat',
    description: 'نظام تدوير وتوصيل الطعام الذكي لموظفي البنك',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1E40AF',
    icons: [
      {
        src: 'https://picsum.photos/seed/banklogo/192/192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'https://picsum.photos/seed/banklogo/512/512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
