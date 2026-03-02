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

export const Toolbar: React.FC<ToolbarProps> = ({ view, currentTitle, searchQuery, sidebarOpen, goToday, goPrev, goNext, changeView, setSearchQuery, openCreate, setSidebarOpen, s }) => (
  <div style={s.topBar}>
    <div style={s.topLeft}>
      <button style={s.todayBtn} onClick={goToday}>Heute</button>
      <div style={s.navGroup}>
        <button style={s.navBtn} onClick={goPrev}>‹</button>
        <button style={s.navBtn} onClick={goNext}>›</button>
      </div>
      <h2 style={s.currentTitle}>{currentTitle}</h2>
    </div>
    <div style={s.topCenter}>
      <div style={s.searchWrap}>
        <span>🔍</span>
        <input style={s.searchInput} placeholder="Termine suchen…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        {searchQuery && <button style={s.clearBtn} onClick={() => setSearchQuery('')}>✕</button>}
      </div>
    </div>
    <div style={s.topRight}>
      <div style={s.viewGroup}>
        {(['dayGridMonth', 'timeGridWeek', 'timeGridDay', 'listWeek'] as ViewMode[]).map(v => (
          <button key={v} style={view === v ? { ...s.viewBtn, ...s.viewBtnActive } : s.viewBtn} onClick={() => changeView(v)}>
            {v === 'dayGridMonth' ? 'Monat' : v === 'timeGridWeek' ? 'Woche' : v === 'timeGridDay' ? 'Tag' : 'Liste'}
          </button>
        ))}
      </div>
      <button style={s.newBtn} onClick={() => openCreate()}>+ Neuer Termin</button>
      <button style={s.sidebarToggle} onClick={() => setSidebarOpen(!sidebarOpen)} title="Sidebar">
        {sidebarOpen ? '◀' : '▶'}
      </button>
    </div>
  </div>
);