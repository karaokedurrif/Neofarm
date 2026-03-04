'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import StatusBar from './dashboard/StatusBar';
import SeedyChat from './SeedyChat';

const NO_SHELL = ['/', '/login', '/register', '/wizard'];

function isNoShell(p: string) {
  return NO_SHELL.some(x => x === '/' ? p === '/' : p === x || p.startsWith(x + '/'));
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  if (!pathname || isNoShell(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="nf-shell">
      <Sidebar />
      <main className="nf-main">
        <StatusBar />
        {children}
      </main>
      <SeedyChat />
    </div>
  );
}
