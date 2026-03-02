import React from 'react';
import { ViewMode } from '../utils/types';

interface ToolbarProps {
  view: ViewMode;
  currentTitle: string;
  searchQuery: string;
  sidebarOpen: boolean;
  goToday: () => void;
  goPrev: () => void;
  goNext: () => void;
  changeView: (view: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  openCreate: () => void;
  setSidebarOpen: (open: boolean) => void;
  s: { [key: string]: React.CSSProperties };
}

const VIEW_LABELS: Record<ViewMode, string> = {
  dayGridMonth: 'Monat',
  timeGridWeek: 'Woche',
  timeGridDay:  'Tag',
  listWeek:     'Liste',
};

export const Toolbar: React.FC<ToolbarProps> = ({
  view, currentTitle, searchQuery, sidebarOpen,
  goToday, goPrev, goNext, changeView, setSearchQuery, openCreate, setSidebarOpen, s
}) => (
  <div style={s.topBar}>
    {/* Left: Navigation */}
    <div style={s.topLeft}>
      <button style={s.sidebarToggle} onClick={() => setSidebarOpen(!sidebarOpen)} title="Sidebar umschalten">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="1" y="1" width="14" height="14" rx="2"/>
          <line x1="5" y1="1" x2="5" y2="15"/>
        </svg>
      </button>

      <div style={{ width: '1px', height: '24px', backgroundColor: '#E8EAF0' }} />

      <button style={s.todayBtn} onClick={goToday}>Heute</button>

      <div style={s.navGroup}>
        <button style={s.navBtn} onClick={goPrev} title="Zurück">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9,2 4,7 9,12"/>
          </svg>
        </button>
        <button style={s.navBtn} onClick={goNext} title="Weiter">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="5,2 10,7 5,12"/>
          </svg>
        </button>
      </div>

      <h2 style={s.currentTitle}>{currentTitle}</h2>
    </div>

    {/* Center: Search */}
    <div style={s.topCenter}>
      <div style={s.searchWrap}>
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="#9CA3AF" strokeWidth="1.8">
          <circle cx="6.5" cy="6.5" r="4.5"/>
          <line x1="10.5" y1="10.5" x2="13.5" y2="13.5"/>
        </svg>
        <input
          style={s.searchInput}
          placeholder="Termine suchen…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button style={s.clearBtn} onClick={() => setSearchQuery('')} title="Löschen">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="1" y1="1" x2="11" y2="11"/>
              <line x1="11" y1="1" x2="1" y2="11"/>
            </svg>
          </button>
        )}
      </div>
    </div>

    {/* Right: View switcher + New */}
    <div style={s.topRight}>
      <div style={s.viewGroup}>
        {(['dayGridMonth', 'timeGridWeek', 'timeGridDay', 'listWeek'] as ViewMode[]).map((v, i, arr) => (
          <button
            key={v}
            style={{
              ...s.viewBtn,
              ...(view === v ? s.viewBtnActive : {}),
              borderRight: i < arr.length - 1 ? '1px solid #E8EAF0' : 'none',
            }}
            onClick={() => changeView(v)}
          >
            {VIEW_LABELS[v]}
          </button>
        ))}
      </div>

      <button style={s.newBtn} onClick={() => openCreate()}>
        <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span>
        <span>Neuer Termin</span>
      </button>
    </div>
  </div>
);