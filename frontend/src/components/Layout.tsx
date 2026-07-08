import { type ReactNode } from 'react';
import TopNav from './TopNav';
import BottomNav from './BottomNav';
import MobileHeader from './MobileHeader';

interface LayoutProps {
  children: ReactNode;
  /** Set to false on the Login screen to hide nav entirely */
  showNav?: boolean;
}

export default function Layout({ children, showNav = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background font-inter">
      {showNav && (
        <>
          <TopNav />
          <MobileHeader />
        </>
      )}
      {/* On desktop, add top padding only (no bottom needed). On mobile, add bottom padding for BottomNav */}
      <div className={showNav ? 'pb-24 md:pb-0' : ''}>
        {children}
      </div>
      {showNav && <BottomNav />}
    </div>
  );
}
