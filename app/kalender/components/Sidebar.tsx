import React from 'react';
import { Calendar, CalEvent, CATEGORIES } from '../utils/types';

interface SidebarProps {
  calendars: Calendar[];
  visibleCals: Record<string, boolean>;
  upcomingEvents: CalEvent[];
  openCalModal: (cal: Calendar | null) => void;
  toggleCalVis: (id: string) => void;
  openEdit: (event: CalEvent) => void;
  s: { [key: string]: React.CSSProperties };
}

function formatUpcomingDate(start: string): string {
  const date = new Date(start.length === 10 ? start + 'T00:00:00' : start);
  const now = new Date();
  const diffDays = Math.round((date.setHours(0,0,0,0) - now.setHours(0,0,0,0)) / 86400000);

  if (diffDays === 0) return 'Heute';
  if (diffDays === 1) return 'Morgen';
  if (diffDays === 2) return 'Übermorgen';
  return new Date(start.length === 10 ? start + 'T00:00:00' : start)
    .toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatTime(start: string): string {
  if (start.length === 10) return '';
  return new Date(start).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';
}

export const Sidebar: React.FC<SidebarProps> = ({
  calendars, visibleCals, upcomingEvents, openCalModal, toggleCalVis, openEdit, s
}) => {
  const allHidden = calendars.every(c => !visibleCals[c.id]);

  return (
    <aside style={s.sidebar}>
      {/* Calendars */}
      <div style={s.sideSection}>
        <div style={s.sideHeader}>
          <span style={s.sideTitle}>Meine Kalender</span>
          <button
            style={s.addBtn}
            onClick={() => openCalModal(null)}
            title="Kalender hinzufügen"
          >
            +
          </button>
        </div>

        {calendars.length === 0 && (
          <p style={s.sideEmpty}>Noch keine Kalender.</p>
        )}

        {calendars.map(cal => (
          <div
            key={cal.id}
            style={{
              ...s.calRow,
              opacity: visibleCals[cal.id] === false ? 0.45 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            <button
              onClick={() => toggleCalVis(cal.id)}
              style={{
                width: '16px', height: '16px', borderRadius: '4px',
                border: `2px solid ${cal.color}`,
                backgroundColor: visibleCals[cal.id] !== false ? cal.color : 'transparent',
                cursor: 'pointer', flexShrink: 0, padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
              title={visibleCals[cal.id] !== false ? 'Ausblenden' : 'Einblenden'}
            >
              {visibleCals[cal.id] !== false && (
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="white" strokeWidth="2">
                  <polyline points="1,4.5 3.5,7 8,2"/>
                </svg>
              )}
            </button>
            <span
              style={{ ...s.calLabel }}
              onClick={() => openCalModal(cal)}
              title="Kalender bearbeiten"
            >
              {cal.name}
            </span>
            <button
              style={s.editCalBtn}
              onClick={() => openCalModal(cal)}
              title="Bearbeiten"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M9.5 1.5L11.5 3.5L4.5 10.5H2.5V8.5L9.5 1.5Z"/>
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Upcoming Events */}
      <div style={s.sideSection}>
        <div style={{ ...s.sideTitle, marginBottom: '12px' }}>Nächste Termine</div>

        {upcomingEvents.length === 0 && (
          <p style={s.sideEmpty}>
            {allHidden ? 'Alle Kalender ausgeblendet.' : 'Keine bevorstehenden Termine.'}
          </p>
        )}

        {upcomingEvents.map(ev => {
          const cat = CATEGORIES.find(c => c.value === ev.category);
          const timeStr = formatTime(ev.start);

          return (
            <div
              key={ev.id}
              style={{ ...s.upcomingItem, borderLeftColor: ev.color }}
              onClick={() => openEdit(ev)}
              title="Termin bearbeiten"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                <div style={s.upcomingTitle}>
                  {cat && <span style={{ marginRight: '4px', fontSize: '0.8rem' }}>{cat.icon}</span>}
                  {ev.title}
                </div>
                {ev.recurrence && (
                  <span style={{ fontSize: '0.7rem', color: '#9CA3AF', flexShrink: 0 }}>🔁</span>
                )}
              </div>
              <div style={s.upcomingDate}>
                {formatUpcomingDate(ev.start)}
                {timeStr && <span> · {timeStr}</span>}
                {ev.location && <span> · {ev.location}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats footer */}
      {upcomingEvents.length > 0 && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid #F0F2F7' }}>
          <p style={{ ...s.sideEmpty, margin: 0, textAlign: 'center' }}>
            {upcomingEvents.length} bevorstehende Termine
          </p>
        </div>
      )}
    </aside>
  );
};