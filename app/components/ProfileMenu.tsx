'use client';
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { MoreVertical, User, LogOut, Gift, Info, HelpCircle, Bug, Github } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../AuthContext';

const ProfileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [version, setVersion] = useState('...'); // Default loading text
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { logout } = useAuth();

  // Fetch and set the current version from the JSON file
  useEffect(() => {
    fetch('/updates.json')
      .then(res => res.json())
      .then(data => {
        // The latest version is the first entry in the array
        if (data && data.length > 0 && data[0].version) {
          setVersion(data[0].version);
        }
      })
      .catch(() => setVersion('N/A')); // Set to N/A if fetching fails
  }, []);

  const toggleMenu = () => {
    setIsOpen(prev => !prev);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  useLayoutEffect(() => {
    if (isOpen && menuRef.current && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menuWidth = menuRef.current.offsetWidth;
      const menuHeight = menuRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;

      let top = buttonRect.bottom + 8;
      let left = buttonRect.right - menuWidth;

      if (left < 10) left = 10;
      if (top + menuHeight > viewportHeight - 10) {
        top = buttonRect.top - menuHeight - 8;
      }

      menuRef.current.style.top = `${top}px`;
      menuRef.current.style.left = `${left}px`;
      menuRef.current.style.opacity = '1';
      menuRef.current.style.transform = 'scale(1)';
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);
  
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <button ref={buttonRef} onClick={toggleMenu} style={styles.menuButton}>
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div ref={menuRef} style={styles.dropdownMenu}>
          <div style={styles.mainContent}>
            <Link href="/profile" style={styles.dropdownItemLink} onClick={closeMenu}>
              <User size={16} style={{ marginRight: '10px' }} />
              Profil
            </Link>
            <div style={styles.dropdownSeparator}></div>
            <Link href="/info/whats-new" style={styles.dropdownItemLink} onClick={closeMenu}>
              <Gift size={16} style={{ marginRight: '10px' }} />
              Das ist neu
            </Link>
            <Link href="/info" style={styles.dropdownItemLink} onClick={closeMenu}>
              <Info size={16} style={{ marginRight: '10px' }} />
              Über OrdoServus
            </Link>
            <Link href="/wiki" style={styles.dropdownItemLink} onClick={closeMenu}>
              <HelpCircle size={16} style={{ marginRight: '10px' }} />
              Hilfe
            </Link>
            <Link href="/info/kontakt" style={styles.dropdownItemLink} onClick={closeMenu}>
              <Bug size={16} style={{ marginRight: '10px' }} />
              Fehler melden
            </Link>
            <div style={styles.dropdownSeparator}></div>
            <button onClick={handleLogout} style={styles.dropdownItemButton}>
              <LogOut size={16} style={{ marginRight: '10px' }} />
              Abmelden
            </button>
          </div>
          <div style={styles.dropdownSeparator}></div>
          <div style={styles.footer}>
             <p style={styles.footerText}>Version {version}</p>
            <a href="https://github.com/Lorganiz/OrdoServus" target="_blank" rel="noopener noreferrer" style={styles.footerLink}>
                <Github size={14} />
            </a>
            <p style={styles.footerText}>&copy; 2026</p>
          </div>
        </div>
      )}
    </>
  );
};

const dropdownItemBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  padding: '9px 14px',
  fontSize: '0.9rem',
  borderRadius: '6px',
  cursor: 'pointer',
  textAlign: 'left',
  background: 'none',
  border: 'none',
};

const styles: { [key: string]: React.CSSProperties } = {
  menuButton: {
    background: 'transparent',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    padding: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#495057',
  },
  dropdownMenu: {
    position: 'fixed',
    opacity: 0,
    transform: 'scale(0.95)',
    transition: 'opacity 0.1s ease-out, transform 0.1s ease-out',
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.12)',
    zIndex: 1100,
    minWidth: '220px',
    display: 'flex',
    flexDirection: 'column',
  },
  mainContent: {
    padding: '6px',
  },
  dropdownItemLink: {
    ...dropdownItemBase,
    color: '#333',
    textDecoration: 'none',
  },
  dropdownItemButton: {
    ...dropdownItemBase,
    color: '#e74c3c',
  },
  dropdownSeparator: {
    height: '1px',
    backgroundColor: '#f1f3f5',
    margin: '5px 0',
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '8px 12px',
    gap: '10px',
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: '12px',
    borderBottomRightRadius: '12px',
  },
  footerText: {
    color: '#6c757d',
    fontSize: '0.75rem',
    margin: 0,
  },
  footerLink: {
    color: '#6c757d',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
  },
};

export default ProfileMenu;
