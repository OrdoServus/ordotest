'use client';
import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';

interface MenuItem {
  label: string;
  onClick: () => void;
  color?: string;
}

interface ContextMenuProps {
  items: MenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ items, position, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    position: 'absolute',
    top: `${position.y}px`,
    left: `${position.x}px`,
    opacity: 0, // Start fully transparent
    transform: 'scale(0.95)', // Slight zoom out effect
    transition: 'opacity 0.1s ease-out, transform 0.1s ease-out',
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.12)',
    padding: '6px',
    zIndex: 1000,
    minWidth: '180px',
  });

  useLayoutEffect(() => {
    if (menuRef.current) {
      const { innerWidth, innerHeight } = window;
      const { offsetWidth, offsetHeight } = menuRef.current;

      let newX = position.x;
      let newY = position.y;

      if (position.x + offsetWidth > innerWidth) {
        newX = position.x - offsetWidth;
      }
      if (position.y + offsetHeight > innerHeight) {
        newY = position.y - offsetHeight;
      }
      
      if (newX < 5) newX = 5;
      if (newY < 5) newY = 5;

      setStyle(prevStyle => ({
        ...prevStyle,
        top: `${newY}px`,
        left: `${newX}px`,
        opacity: 1,
        transform: 'scale(1)',
      }));
    }
  }, [position]);

  useEffect(() => {
    const handleInteraction = (e: Event) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    // Use a timeout to avoid the opening click from closing the menu
    const timer = setTimeout(() => {
      document.addEventListener('click', handleInteraction);
      document.addEventListener('contextmenu', handleInteraction); // Close on another right-click
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('contextmenu', handleInteraction);
    };
  }, [onClose]);

  return (
    <div ref={menuRef} style={style} onClick={e => e.stopPropagation()}>
      {items.map((item, index) => (
        <div
          key={index}
          onClick={() => { item.onClick(); onClose(); }}
          className="context-menu-item"
          style={{
            padding: '9px 14px',
            cursor: 'pointer',
            borderRadius: '6px',
            color: item.color || '#333',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
};

export default ContextMenu;
