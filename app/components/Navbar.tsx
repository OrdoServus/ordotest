'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Calendar } from 'lucide-react';
import ProfileMenu from './ProfileMenu';

const Navbar: React.FC = () => {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    const isActive = pathname.startsWith(path);
    return isActive ? 'nav-button-active' : 'nav-button';
  };

  return (
    <nav className="nav-container">
      <div className="left-content">
        <div className="logo">
          <Link href="/dashboard" className="logo-link">
            OrdoServus
          </Link>
        </div>
        <div className="nav-buttons">
          <Link href="/notes" className={getLinkClass('/notes')}>
            <FileText size={18} className="icon" />
            Notes
          </Link>
          <Link href="/calendar" className={getLinkClass('/calendar')}>
            <Calendar size={18} className="icon" />
            Calendar
          </Link>
        </div>
      </div>
      <ProfileMenu />
    </nav>
  );
};

export default Navbar;

