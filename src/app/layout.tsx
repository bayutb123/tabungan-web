import type { Metadata } from 'next';
import './globals.css';
import MuiProvider from '@/providers/MuiProvider';
import AuthProvider from '@/providers/AuthProvider';

export const metadata: Metadata = {
  title: 'Tracker Tabungan',
  description: 'Aplikasi pencatatan tabungan pribadi berbasis Next.js + Firebase',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <MuiProvider>
          <AuthProvider>{children}</AuthProvider>
        </MuiProvider>
      </body>
    </html>
  );
}
