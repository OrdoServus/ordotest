'use client';
import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, User, LogOut, Gift, Info, HelpCircle, Bug, Github } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../AuthContext';

const ProfileMenu: React.FC = () => {
  const [isOpen,  setIsOpen]  = useState(false);
  const [version, setVersion] = useState('…');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef   = useRef<HTMLDivElement>(null);
  const { logout, userProfile } = useAuth();

  useEffect(() => {
    fetch('https://api.github.com/repos/ordoservus/ordoservus/releases/latest')
      .then(r => r.json())
      .then(data => { if (data?.tag_name) setVersion(data.tag_name.replace('v', '')); })
      .catch(() => setVersion('N/A'));
  }, []);

  useEffect(() => {
    if (!isOpen || !menuRef.current || !buttonRef.current) return;
    const btn  = buttonRef.current.getBoundingClientRect();
    const menu = menuRef.current;
    const mw   = menu.offsetWidth;
    const mh   = menu.offsetHeight;

    let top  = btn.bottom + 8;
    let left = btn.right  - mw;
    if (left < 10) left = 10;
    if (top + mh > window.innerHeight - 10) top = btn.top - mh - 8;

    menu.style.top     = `${top}px`;
    menu.style.left    = `${left}px`;
    menu.style.opacity = '1';
    menu.style.transform = 'scale(1)';
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e: MouseEvent) => {
      if (
        menuRef.current   && !menuRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) setIsOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [isOpen]);

  const close = () => setIsOpen(false);

  const initials = userProfile?.firstName && userProfile?.lastName
    ? `${userProfile.firstName[0]}${userProfile.lastName[0]}`.toUpperCase()
    : null;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(p => !p)}
        style={styles.menuButton}
        aria-label="Menü öffnen"
        aria-expanded={isOpen}
      >
        {initials ? (
          <span style={styles.avatar}>{initials}</span>
        ) : (
          <MoreVertical size={20} />
        )}
      </button>

      {isOpen && (
        <div ref={menuRef} style={styles.dropdownMenu} role="menu">
          {/* User info header */}
          {userProfile?.firstName && (
            <div style={styles.userHeader}>
              <div style={styles.avatarLarge}>{initials}</div>
              <div>
                <div style={styles.userName}>{userProfile.firstName} {userProfile.lastName}</div>
                {userProfile.role && <div style={styles.userRole}>{userProfile.role}</div>}
              </div>
            </div>
          )}
          <div style={styles.separator} />

          <div style={styles.mainContent}>
            <Link href="/profile" style={styles.item} onClick={close}>
              <User size={15} /> Profil bearbeiten
            </Link>
            <div style={styles.separator} />
            <Link href="/info/whats-new" style={styles.item} onClick={close}>
              <Gift size={15} /> Was ist neu?
            </Link>
            <Link href="/info" style={styles.item} onClick={close}>
              <Info size={15} /> Über OrdoServus
            </Link>
            <a
              href="https://github.com/flohulo/ordoservus/wiki"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.item}
              onClick={close}
            >
              <HelpCircle size={15} /> Hilfe & Dokumentation
            </a>
            <Link href="/info/kontakt" style={styles.item} onClick={close}>
              <Bug size={15} /> Fehler melden
            </Link>
            <div style={styles.separator} />
            <button onClick={async () => { close(); await logout(); }} style={styles.logoutItem}>
              <LogOut size={15} /> Abmelden
            </button>
          </div>

          {/* Footer */}
          <div style={styles.separator} />
          <div style={styles.footer}>
            <span style={styles.footerText}>v{version}</span>
            <a
              href="https://github.com/flohulo/ordoservus"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.footerLink}
              aria-label="GitHub"
            >
              <Github size={13} />
            </a>
            <span style={styles.footerText}>© {new Date().getFullYear()}</span>
          </div>
        </div>
      )}
    </>
  );
};

const itemBase: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
  padding: '8px 12px', fontSize: '0.88rem', borderRadius: '6px',
  cursor: 'pointer', textAlign: 'left', background: 'none', border: 'none',
  textDecoration: 'none', color: '#333', transition: 'background 0.15s',
};

const styles: { [key: string]: React.CSSProperties } = {
  menuButton: {
    background: 'transparent', border: '1px solid #dee2e6', borderRadius: '8px',
    padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#495057', gap: '6px',
  },
  avatar:     { width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#2c3e50', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 },
  dropdownMenu: {
    position: 'fixed', opacity: 0, transform: 'scale(0.95)',
    transition: 'opacity 0.1s ease-out, transform 0.1s ease-out',
    backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '12px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.12)', zIndex: 1100, minWidth: '230px',
  },
  userHeader: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 14px 10px' },
  avatarLarge:{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#2c3e50', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 },
  userName:   { fontSize: '0.9rem', fontWeight: 600, color: '#2c3e50' },
  userRole:   { fontSize: '0.75rem', color: '#7f8c8d', marginTop: '2px' },
  separator:  { height: '1px', backgroundColor: '#f1f3f5', margin: '4px 0' },
  mainContent:{ padding: '4px 6px' },
  item:       { ...itemBase },
  logoutItem: { ...itemBase, color: '#e74c3c' },
  footer:     { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '8px 12px', gap: '10px', backgroundColor: '#f8f9fa', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' },
  footerText: { color: '#6c757d', fontSize: '0.72rem' },
  footerLink: { color: '#6c757d', textDecoration: 'none', display: 'flex', alignItems: 'center' },
};

export default ProfileMenu;
