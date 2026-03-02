import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KodBank — Your Digital Bank',
  description: 'Secure digital banking with KodBank. Register, login, and check your balance instantly.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="bg-animated">
          <div className="bg-orb3" />
        </div>
        {children}
      </body>
    </html>
  );
}
