import React from 'react';
import { Calendar, CalEvent } from '../utils/types';

interface SidebarProps {
  calendars: Calendar[];
  visibleCals: Record<string, boolean>;
  upcomingEvents: CalEvent[];
  openCalModal: (cal: Calendar | null) => void;
  toggleCalVis: (id: string) => void;
  openEdit: (event: CalEvent) => void;
  s: { [key: string]: React.CSSProperties };
}

export const Sidebar: React.FC<SidebarProps> = ({ calendars, visibleCals, upcomingEvents, openCalModal, toggleCalVis, openEdit, s }) => (
  <aside style={s.sidebar}>
    <div style={s.sideSection}>
      <div style={s.sideHeader}>
        <span style={s.sideTitle}>Meine Kalender</span>
        <button style={s.addBtn} onClick={() => openCalModal(null)}>+</button>
      </div>
      {calendars.map(cal => (
        <div key={cal.id} style={s.calRow}>
          <input type="checkbox" checked={visibleCals[cal.id] ?? true} onChange={() => toggleCalVis(cal.id)} style={{ accentColor: cal.color, width: '15px', height: '15px', cursor: 'pointer' }} />
          <span style={{ ...s.calLabel, color: cal.color }}>{cal.name}</span>
          <button style={s.editCalBtn} onClick={() => openCalModal(cal)}>✏️</button>
        </div>
      ))}
    </div>
    <div style={s.sideSection}>
      <div style={s.sideTitle}>Nächste Termine</div>
      {upcomingEvents.length === 0 && <p style={s.sideEmpty}>Keine bevorstehenden Termine.</p>}
      {upcomingEvents.map(ev => (
        <div key={ev.id} style={{ ...s.upcomingItem, borderLeftColor: ev.color }} onClick={() => openEdit(ev)}>
          <div style={s.upcomingTitle}>{ev.title}</div>
          <div style={s.upcomingDate}>
            {new Date(ev.start.length === 10 ? ev.start + 'T00:00:00' : ev.start).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}
            {ev.location && ` · ${ev.location}`}
          </div>
        </div>
      ))}
    </div>
  </aside>
);