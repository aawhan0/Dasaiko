import React from 'react';
import { Sidebar, SidebarToggle } from './Sidebar';
import { TopNav } from './TopNav';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-base text-zinc-300">
      <TopNav />
      <div className="relative flex flex-1 overflow-hidden">
        <SidebarToggle />
        <Sidebar />
        <main className="flex-1 flex overflow-hidden min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
