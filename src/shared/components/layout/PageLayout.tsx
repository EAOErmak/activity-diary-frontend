import type { ReactNode } from 'react';
import Navbar from './Navbar';

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-gray-100">
      <Navbar />

      <main className="w-full pt-14 animate-fade-in pt-14">
        {children}
      </main>
    </div>
  );
}

