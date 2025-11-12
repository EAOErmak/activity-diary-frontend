import type { ReactNode } from 'react';
import Navbar from './Navbar';

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-gray-100">
      <Navbar />
      <main className="w-full px-0 py-0 animate-fade-in">
        {children}
      </main>
    </div>
  );
}