'use client';
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { EventClickArg, EventDropArg, EventInput, EventResizeDoneArg, DateSelectArg, EventMountArg } from '@fullcalendar/core';
import { useCalendars } from './hooks/useCalendar';
import { useEvents } from './hooks/useEvents';
import { ViewMode, CATEGORIES } from './utils/types';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { EventModal } from './components/EventModal';
import { CalendarModal } from './components/CalendarModal';
import { updateEvent } from './utils/firebase';
import { useAuth } from '../AuthContext';

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const s: { [key: string]: React.CSSProperties } = {
  page: {
    display: 'flex', flexDirection: 'column', height: '100%',
    backgroundColor: '#FFFFFF',
    fontFamily: "'Lora', 'Georgia', serif",
    overflow: 'hidden',
  },
  body: { display: 'flex', flex: 1, overflow: 'hidden' },
  calArea: { flex: 1, overflowY: 'auto', padding: '20px 24px', minWidth: 0 },

  // Top bar — clean white with subtle shadow
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 20px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E8EAF0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    flexShrink: 0, gap: '12px', flexWrap: 'wrap',
    zIndex: 10, position: 'relative',
  },
  topLeft:  { display: 'flex', alignItems: 'center', gap: '10px' },
  topCenter: { flex: 1, minWidth: '160px', maxWidth: '340px' },
  topRight:  { display: 'flex', alignItems: 'center', gap: '10px' },

  currentTitle: {
    fontSize: '1.05rem', fontWeight: 700, color: '#1A1A2E', margin: 0,
    fontFamily: "'Lora', 'Georgia', serif", letterSpacing: '-0.01em',
    minWidth: '160px',
  },
  todayBtn: {
    padding: '7px 16px',
    backgroundColor: '#FFFFFF', color: '#374151',
    border: '1px solid #D1D5DB', borderRadius: '7px',
    cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
    letterSpacing: '0.01em', fontFamily: "'Lora', 'Georgia', serif",
    transition: 'all 0.15s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  navGroup: { display: 'flex', gap: '2px' },
  navBtn: {
    width: '32px', height: '32px',
    border: '1px solid #E5E7EB', borderRadius: '7px',
    backgroundColor: '#FFFFFF', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#6B7280', transition: 'all 0.15s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  searchWrap: {
    display: 'flex', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderRadius: '8px',
    padding: '0 12px', border: '1px solid #E5E7EB', gap: '8px',
    transition: 'border-color 0.15s',
  },
  searchInput: {
    border: 'none', background: 'transparent', outline: 'none',
    padding: '8px 0', fontSize: '0.88rem', width: '100%',
    color: '#374151', fontFamily: "'Lora', 'Georgia', serif",
  },
  clearBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '2px',
  },
  viewGroup: {
    display: 'flex', border: '1px solid #E5E7EB',
    borderRadius: '8px', overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  viewBtn: {
    padding: '7px 14px', border: 'none',
    backgroundColor: '#FFFFFF', cursor: 'pointer', fontSize: '0.8rem',
    color: '#6B7280', fontFamily: "'Lora', 'Georgia', serif",
    fontWeight: 500, transition: 'all 0.15s', letterSpacing: '0.01em',
  },
  viewBtnActive: {
    backgroundColor: '#1A1A2E', color: '#FFFFFF', fontWeight: 700,
  },
  newBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 18px',
    background: 'linear-gradient(135deg, #7B3B6E 0%, #5C2A52 100%)',
    color: '#FFFFFF', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
    fontFamily: "'Lora', 'Georgia', serif",
    boxShadow: '0 2px 8px rgba(92,42,82,0.35)',
    transition: 'transform 0.15s, box-shadow 0.15s',
    letterSpacing: '0.02em',
  },
  sidebarToggle: {
    width: '34px', height: '34px',
    border: '1px solid #E5E7EB', borderRadius: '7px',
    backgroundColor: '#FFFFFF', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#6B7280', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    transition: 'background 0.15s',
  },

  // Sidebar — light & clean
  sidebar: {
    width: '258px', minWidth: '258px',
    backgroundColor: '#FAFBFC',
    borderRight: '1px solid #E8EAF0',
    overflowY: 'auto', flexShrink: 0,
  },
  sideSection: { padding: '16px', borderBottom: '1px solid #F0F2F7' },
  sideHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '12px',
  },
  sideTitle: {
    fontSize: '0.68rem', fontWeight: 700, color: '#9CA3AF',
    textTransform: 'uppercase' as const, letterSpacing: '0.12em',
  },
  addBtn: {
    width: '26px', height: '26px', borderRadius: '6px',
    border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF',
    cursor: 'pointer', color: '#374151', fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.95rem', lineHeight: 1,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'background 0.15s',
  },
  calRow: {
    display: 'flex', alignItems: 'center', gap: '9px',
    marginBottom: '8px', padding: '4px 2px',
    borderRadius: '6px', cursor: 'default',
  },
  calLabel: {
    flex: 1, fontWeight: 600, fontSize: '0.87rem',
    cursor: 'pointer', color: '#374151',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
  },
  editCalBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    opacity: 0, color: '#9CA3AF', padding: '2px',
    display: 'flex', alignItems: 'center',
    transition: 'opacity 0.15s',
  },
  upcomingItem: {
    borderLeft: '3px solid',
    padding: '8px 10px', borderRadius: '0 6px 6px 0',
    cursor: 'pointer', marginBottom: '7px',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  upcomingTitle: { fontSize: '0.84rem', fontWeight: 600, color: '#1A1A2E' },
  upcomingDate: { fontSize: '0.73rem', color: '#9CA3AF', marginTop: '3px' },
  sideEmpty: { fontSize: '0.82rem', color: '#C4C9D4', margin: '4px 0 0', fontStyle: 'italic' },

  // Modal — crisp white
  overlay: {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(6px)',
    zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px', padding: '28px',
    width: '100%', maxWidth: '540px',
    maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 24px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '22px', paddingBottom: '16px',
    borderBottom: '1px solid #F0F2F7',
  },
  modalTitle: {
    fontSize: '1.15rem', fontWeight: 700, color: '#1A1A2E', margin: 0,
    fontFamily: "'Lora', 'Georgia', serif",
  },
  modalClose: {
    background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '50%',
    width: '32px', height: '32px', cursor: 'pointer', color: '#6B7280',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.8rem', fontWeight: 700, transition: 'background 0.15s',
  },
  ml: {
    display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#6B7280',
    marginBottom: '6px', textTransform: 'uppercase' as const, letterSpacing: '0.09em',
  },
  subLabel: {
    fontSize: '0.68rem', color: '#9CA3AF', marginBottom: '4px', letterSpacing: '0.04em',
  },
  mi: {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: '1px solid #E5E7EB', fontSize: '0.9rem',
    boxSizing: 'border-box' as const,
    backgroundColor: '#FAFBFC', marginBottom: '14px',
    fontFamily: "'Lora', 'Georgia', serif", color: '#1A1A2E',
    outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  sectionBox: {
    backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB',
    borderRadius: '10px', padding: '14px', marginBottom: '14px',
  },
  previewBar: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '11px 16px', borderRadius: '8px', marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626',
    padding: '10px 14px', borderRadius: '8px', marginBottom: '16px',
    fontSize: '0.87rem', display: 'flex', alignItems: 'center', gap: '8px',
  },
  modalActions: {
    display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center',
    paddingTop: '18px', borderTop: '1px solid #F0F2F7',
  },
  saveBtn: {
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #059669, #047857)',
    color: 'white', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
    fontFamily: "'Lora', 'Georgia', serif",
    boxShadow: '0 2px 8px rgba(5,150,105,0.3)',
    transition: 'opacity 0.15s',
  },
  cancelBtn: {
    padding: '10px 18px', backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB', borderRadius: '8px',
    cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#374151',
    fontFamily: "'Lora', 'Georgia', serif", transition: 'background 0.15s',
  },
  deleteBtn: {
    padding: '10px 16px',
    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
    color: 'white', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontWeight: 700, marginRight: 'auto',
    fontSize: '0.85rem', fontFamily: "'Lora', 'Georgia', serif",
    boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
  },

  // Event popover
  popover: {
    position: 'fixed', zIndex: 1100,
    backgroundColor: '#FFFFFF', borderRadius: '12px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
    padding: '16px', minWidth: '240px', maxWidth: '320px',
    animation: 'fadeIn 0.15s ease',
  },
};

/* ─── Event Detail Popover ────────────────────────────────────────────────── */
interface PopoverState {
  event: any;
  x: number;
  y: number;
}

function EventPopover({
  state, onEdit, onClose, calendars
}: {
  state: PopoverState;
  onEdit: () => void;
  onClose: () => void;
  calendars: any[];
}) {
  const cal = calendars.find(c => c.id === state.event.calendarId);
  const cat = CATEGORIES.find(c => c.value === state.event.category);

  const style: React.CSSProperties = {
    ...s.popover,
    left: Math.min(state.x, window.innerWidth - 340),
    top: Math.min(state.y, window.innerHeight - 300),
  };

  return (
    <div style={style}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: state.event.color, flexShrink: 0 }} />
          <h3 style={{ margin: 0, fontSize: '0.97rem', fontWeight: 700, color: '#1A1A2E', fontFamily: "'Lora', Georgia, serif" }}>
            {state.event.title}
          </h3>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '0.85rem', padding: '0 0 0 8px', lineHeight: 1 }}>✕</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '14px' }}>
        {cal && (
          <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
            <span style={{ color: cal.color, fontWeight: 600 }}>●</span> {cal.name}
          </div>
        )}
        {cat && (
          <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>{cat.icon} {cat.label}</div>
        )}
        <div style={{ fontSize: '0.82rem', color: '#374151', fontWeight: 500 }}>
          {state.event.allDay
            ? '📅 Ganztägig'
            : `🕐 ${new Date(state.event.start).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}${state.event.end ? ' – ' + new Date(state.event.end).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : ''} Uhr`
          }
        </div>
        {state.event.location && (
          <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>📍 {state.event.location}</div>
        )}
        {state.event.description && (
          <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '4px', lineHeight: 1.5 }}>
            📝 {state.event.description}
          </div>
        )}
        {state.event.url && (
          <a href={state.event.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: '#7B3B6E' }}>
            🔗 Link öffnen
          </a>
        )}
        {state.event.recurrence && (
          <div style={{ fontSize: '0.76rem', color: '#9CA3AF' }}>🔁 Wiederholend</div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={onEdit} style={{ ...s.saveBtn, padding: '7px 16px', fontSize: '0.78rem', flex: 1, textAlign: 'center' }}>
          ✏️ Bearbeiten
        </button>
        <button onClick={onClose} style={{ ...s.cancelBtn, padding: '7px 12px', fontSize: '0.78rem' }}>
          Schließen
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export default function KalenderPage() {
  const { user } = useAuth();
  const calRef = useRef<FullCalendar>(null);

  const {
    calendars, visibleCals, calModalOpen, calForm, editingCalendar,
    isLoading: isCalLoading, COLORS, setCalModalOpen, openCalModal,
    handleSaveCal, handleDeleteCal, toggleCalVis, setCalForm,
  } = useCalendars();

  const {
    events, eventModalOpen, eventForm, editingEventId, formError,
    isLoading: isEventLoading, setEventModalOpen, openCreate, openEdit,
    handleFormChange, handleRecurrenceChange, handleSaveEvent, handleDeleteEvent,
  } = useEvents(calendars);

  const [view, setView] = useState<ViewMode>('timeGridWeek');
  const [currentTitle, setCurrentTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [popover, setPopover] = useState<PopoverState | null>(null);

  const goToday = useCallback(() => calRef.current?.getApi().today(), []);
  const goPrev  = useCallback(() => calRef.current?.getApi().prev(), []);
  const goNext  = useCallback(() => calRef.current?.getApi().next(), []);
  const changeView = useCallback((v: ViewMode) => {
    setView(v);
    calRef.current?.getApi().changeView(v);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (eventModalOpen || calModalOpen) return;

      switch (e.key) {
        case 'n': case 'N': openCreate(); break;
        case 't': case 'T': goToday(); break;
        case 'ArrowLeft':   goPrev(); break;
        case 'ArrowRight':  goNext(); break;
        case 'm': changeView('dayGridMonth'); break;
        case 'w': changeView('timeGridWeek'); break;
        case 'd': changeView('timeGridDay'); break;
        case 'l': changeView('listWeek'); break;
        case 'Escape': setPopover(null); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openCreate, eventModalOpen, calModalOpen, goToday, goPrev, goNext, changeView]);

  const updateTitle = useCallback(() => {
    if (calRef.current) setCurrentTitle(calRef.current.getApi().getCurrentData().viewTitle);
  }, []);

  const handleDateClick = useCallback((arg: DateClickArg) => {
    setPopover(null);
    openCreate(arg.dateStr);
  }, [openCreate]);

  const handleEventClick = useCallback((arg: EventClickArg) => {
    arg.jsEvent.preventDefault();
    arg.jsEvent.stopPropagation();
    const ev = events.find(e => e.id === arg.event.id);
    if (!ev) return;

    const rect = arg.el.getBoundingClientRect();
    setPopover({
      event: { ...ev, color: arg.event.backgroundColor },
      x: rect.right + 8,
      y: rect.top,
    });
  }, [events]);

  const handleEventDrop = useCallback(async (arg: EventDropArg) => {
    if (!user) return;
    try {
      await updateEvent(user.uid, arg.event.id, {
        start: arg.event.startStr,
        end: arg.event.endStr || null,
      });
    } catch { arg.revert(); }
  }, [user]);

  const handleEventResize = useCallback(async (arg: EventResizeDoneArg) => {
    if (!user) return;
    try {
      await updateEvent(user.uid, arg.event.id, {
        start: arg.event.startStr,
        end: arg.event.endStr || null,
      });
    } catch { arg.revert(); }
  }, [user]);

  const handleSelect = useCallback((selectInfo: DateSelectArg) => {
    openCreate(selectInfo.startStr.slice(0, 10));
  }, [openCreate]);

  const handleEventDidMount = useCallback((mountInfo: EventMountArg) => {
    const { location, description, category } = mountInfo.event.extendedProps;
    const cat = CATEGORIES.find(c => c.value === category);
    const parts = [
      cat ? `${cat.icon} ${cat.label}` : null,
      mountInfo.event.title,
      location ? `📍 ${location}` : null,
      description ? `📝 ${description}` : null,
    ].filter(Boolean);
    mountInfo.el.title = parts.join('\n');
  }, []);

  const filteredEvents = useMemo(() => events.filter(ev =>
    (visibleCals[ev.calendarId] !== false) &&
    (!searchQuery || [ev.title, ev.description ?? '', ev.location ?? ''].some(
      f => f.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  ), [events, visibleCals, searchQuery]);

  const upcomingEvents = useMemo(() => filteredEvents
    .filter(ev => ev.start >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 10), [filteredEvents]);

  const calendarEvents: EventInput[] = useMemo(() => filteredEvents.map(e => ({
    id:              e.id,
    title:           e.title,
    start:           e.start,
    end:             e.end,
    backgroundColor: e.color,
    borderColor:     'transparent',
    allDay:          e.allDay ?? true,
    extendedProps: {
      location:    e.location,
      description: e.description,
      category:    e.category,
      calendarId:  e.calendarId,
      url:         e.url,
      recurrence:  e.recurrence,
    },
  })), [filteredEvents]);

  const popoverEvent = popover ? events.find(e => e.id === popover.event.id) : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');

        /* ─ FullCalendar overrides ─ */
        .fc {
          font-family: 'Lora', Georgia, serif !important;
          --fc-border-color: #EEF0F5;
          --fc-today-bg-color: rgba(123,59,110,0.04);
          --fc-page-bg-color: transparent;
          --fc-event-border-color: transparent;
          --fc-now-indicator-color: #7B3B6E;
        }
        .fc .fc-col-header-cell {
          border-bottom: 1px solid #EEF0F5 !important;
          padding: 8px 0;
        }
        .fc .fc-col-header-cell-cushion {
          color: #9CA3AF !important;
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 700;
          text-decoration: none !important;
        }
        .fc .fc-daygrid-day-number {
          color: #374151 !important;
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none !important;
          padding: 6px 10px;
        }
        .fc .fc-day-today .fc-daygrid-day-number {
          background: #7B3B6E;
          color: white !important;
          border-radius: 50%;
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          margin: 4px;
          font-weight: 700;
        }
        .fc .fc-timegrid-slot-label-cushion { color: #9CA3AF !important; font-size: 0.73rem; }
        .fc .fc-timegrid-slot { height: 44px; }
        .fc .fc-timegrid-axis-cushion { color: #9CA3AF !important; font-size: 0.72rem; }
        .fc-event {
          border-radius: 6px !important;
          font-size: 0.8rem !important;
          font-weight: 600 !important;
          padding: 2px 6px !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15) !important;
          border: none !important;
          cursor: pointer !important;
          transition: transform 0.12s, box-shadow 0.12s !important;
        }
        .fc-event:hover {
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
          z-index: 10 !important;
        }
        .fc-event .fc-event-main { padding: 1px 0; }
        .fc .fc-scrollgrid { border-color: #EEF0F5 !important; border-radius: 10px; overflow: hidden; }
        .fc .fc-scrollgrid-section > td { border: none !important; }
        .fc-theme-standard td, .fc-theme-standard th { border-color: #F3F4F6 !important; }
        .fc .fc-list-empty { color: #9CA3AF !important; font-style: italic; }
        .fc .fc-list-event:hover td { background: #F9FAFB !important; }
        .fc .fc-list-day-cushion { background: #F9FAFB !important; }
        .fc .fc-list-day-text, .fc .fc-list-day-side-text {
          color: #374151 !important; font-weight: 700; font-size: 0.85rem;
          text-decoration: none !important;
        }
        .fc .fc-more-link { color: #7B3B6E !important; font-weight: 700; font-size: 0.78rem; }
        .fc .fc-daygrid-day:hover { background: #FAFBFC !important; }
        .fc .fc-daygrid-event { margin: 1px 2px; }
        .fc .fc-timegrid-event { margin: 0 2px; }
        .fc .fc-list-event-title a { color: #1A1A2E !important; text-decoration: none !important; }
        .fc .fc-now-indicator-line { border-color: #7B3B6E !important; border-width: 2px; }
        .fc .fc-now-indicator-arrow { border-top-color: #7B3B6E !important; }

        /* Input focus */
        input:focus, textarea:focus, select:focus {
          border-color: #7B3B6E !important;
          box-shadow: 0 0 0 3px rgba(123,59,110,0.1) !important;
        }

        /* Sidebar hover effects */
        .cal-row:hover .edit-cal-btn { opacity: 0.6 !important; }
        .upcoming-item:hover {
          transform: translateX(2px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }
      `}</style>

      <div style={s.page} onClick={() => popover && setPopover(null)}>
        <Toolbar
          s={s} view={view} currentTitle={currentTitle}
          searchQuery={searchQuery} sidebarOpen={sidebarOpen}
          goToday={goToday} goPrev={goPrev} goNext={goNext}
          changeView={changeView} setSearchQuery={setSearchQuery}
          openCreate={openCreate} setSidebarOpen={setSidebarOpen}
        />

        <div style={s.body}>
          {sidebarOpen && (
            <Sidebar
              s={s} calendars={calendars} visibleCals={visibleCals}
              upcomingEvents={upcomingEvents} openCalModal={openCalModal}
              toggleCalVis={toggleCalVis} openEdit={ev => { setPopover(null); openEdit(ev); }}
            />
          )}

          <div style={s.calArea} onClick={() => setPopover(null)}>
            <FullCalendar
              ref={calRef}
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
              initialView={view}
              locale="de"
              headerToolbar={false}
              events={calendarEvents}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              eventResize={handleEventResize}
              editable
              droppable
              selectable
              selectMirror
              height="auto"
              dayMaxEvents={4}
              datesSet={updateTitle}
              nowIndicator
              businessHours={{ startTime: '08:00', endTime: '20:00' }}
              select={handleSelect}
              eventDidMount={handleEventDidMount}
            />
          </div>
        </div>

        {/* Event detail popover */}
        {popover && popoverEvent && (
          <EventPopover
            state={popover}
            calendars={calendars}
            onEdit={() => { setPopover(null); openEdit(popoverEvent); }}
            onClose={() => setPopover(null)}
          />
        )}

        {eventModalOpen && (
          <EventModal
            s={s} eventForm={eventForm} calendars={calendars}
            editingEventId={editingEventId} formError={formError}
            isLoading={isEventLoading} handleFormChange={handleFormChange}
            handleRecurrenceChange={handleRecurrenceChange}
            handleSaveEvent={handleSaveEvent} handleDeleteEvent={handleDeleteEvent}
            setEventModalOpen={setEventModalOpen}
          />
        )}

        {calModalOpen && (
          <CalendarModal
            s={s} calForm={calForm} editingCalendar={editingCalendar}
            isLoading={isCalLoading} COLORS={COLORS}
            handleSaveCal={handleSaveCal} handleDeleteCal={handleDeleteCal}
            setCalModalOpen={setCalModalOpen} setCalForm={setCalForm}
          />
        )}
      </div>
    </>
  );
}
