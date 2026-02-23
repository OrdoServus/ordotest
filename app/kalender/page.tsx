'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { EventClickArg, EventInput, EventDropArg } from '@fullcalendar/core';
import { db } from '../firebase/config';
import { useAuth } from '../AuthContext';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  where,
  getDocs,
} from 'firebase/firestore';

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface Calendar {
  id: string;
  name: string;
  color: string;
  visible: boolean;
}

interface CalendarEvent {
  id: string;
  calendarId: string;
  title: string;
  start: string;
  end?: string | null;
  color: string;
  category: string;
  description?: string;
  location?: string;
  allDay?: boolean;
}

interface EventFormData {
  calendarId: string;
  title: string;
  start: string;
  end: string;
  startTime: string;
  endTime: string;
  color: string;
  category: string;
  description: string;
  location: string;
  allDay: boolean;
}

type ViewMode = 'dayGridMonth' | 'dayGridWeek' | 'dayGridDay';

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_CALENDARS: Omit<Calendar, 'id'>[] = [
  { name: 'Pfarrkalender', color: '#8e44ad', visible: true },
  { name: 'Privat', color: '#e67e22', visible: true },
  { name: 'Beerdigungen', color: '#7f8c8d', visible: false },
];

const COLOR_OPTIONS = ['#8e44ad', '#e67e22', '#3498db', '#27ae60', '#e84393', '#c0392b', '#2c3e50', '#f39c12'];

// ─── Helper ───────────────────────────────────────────────────────────────────
const toDateStr = (d: Date) => d.toISOString().slice(0, 10);
const today = () => toDateStr(new Date());

// ─── Component ────────────────────────────────────────────────────────────────
export default function KalenderPage() {
  const { user } = useAuth();
  const calendarRef = useRef<InstanceType<typeof FullCalendar>>(null);

  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [visibleCalendars, setVisibleCalendars] = useState<{[key: string]: boolean}>({});
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<ViewMode>('dayGridMonth');

  const [isEventModalOpen, setEventModalOpen] = useState(false);
  const [eventFormData, setEventFormData] = useState<EventFormData | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [isCalendarModalOpen, setCalendarModalOpen] = useState(false);
  const [calendarFormData, setCalendarFormData] = useState<{name: string, color: string}>({ name: '', color: COLOR_OPTIONS[0]});
  const [editingCalendar, setEditingCalendar] = useState<Calendar | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTitle, setCurrentTitle] = useState('');

  const EMPTY_FORM = (): EventFormData => ({
    calendarId: calendars.find(c => c.visible)?.id ?? '',
    title: '', start: '', end: '', startTime: '09:00', endTime: '10:00', color: '#2c3e50',
    category: 'gottesdienst', description: '', location: '', allDay: true,
  });

  // ─── Firestore Sync ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const unsubEvents = onSnapshot(query(collection(db, 'users', user.uid, 'events'), orderBy('start', 'asc')), (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CalendarEvent, 'id'>) })));
    });
    const unsubCalendars = onSnapshot(query(collection(db, 'users', user.uid, 'calendars')), async (snap) => {
      if (snap.empty) {
        const batch = writeBatch(db);
        const defaultCals = DEFAULT_CALENDARS.map(cal => { const docRef = doc(collection(db, 'users', user.uid, 'calendars')); batch.set(docRef, cal); return { id: docRef.id, ...cal }; });
        await batch.commit();
        setCalendars(defaultCals);
        setVisibleCalendars(Object.fromEntries(defaultCals.map(c => [c.id, c.visible])));
      } else {
        const cals = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Calendar, 'id'>) }));
        setCalendars(cals);
        setVisibleCalendars(p => cals.reduce((acc, c) => ({...acc, [c.id]: p[c.id] ?? c.visible}), {}));
      }
    });
    return () => { unsubEvents(); unsubCalendars(); };
  }, [user]);

  // ─── UI Control ──────────────────────────────────────────────────────────
  const goToday  = () => calendarRef.current?.getApi().today();
  const goPrev   = () => calendarRef.current?.getApi().prev();
  const goNext   = () => calendarRef.current?.getApi().next();
  const changeView = (v: ViewMode) => { setView(v); calendarRef.current?.getApi().changeView(v); };
  const updateTitle = useCallback(() => { if (calendarRef.current) setCurrentTitle(calendarRef.current.getApi().getCurrentData().viewTitle); }, []);

  // ─── Event Modal Handlers ────────────────────────────────────────────────
  const openCreateEvent = useCallback((dateStr?: string) => {
    setEditingEventId(null);
    setEventFormData({ ...EMPTY_FORM(), start: dateStr ?? today(), end: dateStr ?? today() });
    setError(null);
    setEventModalOpen(true);
  }, [calendars]);

  const openEditEvent = useCallback((ev: CalendarEvent) => {
    setEditingEventId(ev.id);
    setEventFormData({
      calendarId: ev.calendarId, title: ev.title,
      start: ev.start.slice(0, 10), end: ev.end ? ev.end.slice(0, 10) : ev.start.slice(0, 10),
      startTime: ev.start.length > 10 ? ev.start.slice(11, 16) : '09:00',
      endTime: ev.end && ev.end.length > 10 ? ev.end.slice(11, 16) : '10:00',
      color: ev.color, category: ev.category, description: ev.description ?? '', location: ev.location ?? '', allDay: ev.allDay ?? true,
    });
    setError(null);
    setEventModalOpen(true);
  }, []);

  const handleDateClick = useCallback((arg: DateClickArg) => openCreateEvent(arg.dateStr), [openCreateEvent]);
  const handleEventClick = useCallback((arg: EventClickArg) => { const ev = events.find((e) => e.id === arg.event.id); if (ev) openEditEvent(ev); }, [events, openEditEvent]);
  const handleEventDrop = useCallback(async (arg: EventDropArg) => {
    if (!user) return;
    try { await updateDoc(doc(db, 'users', user.uid, 'events', arg.event.id), { start: arg.event.startStr, end: arg.event.endStr || null }); }
    catch { arg.revert(); }
  }, [user]);

  // ─── Calendar Modal Handlers ─────────────────────────────────────────────
  const openCalendarModal = (cal: Calendar | null) => {
    setEditingCalendar(cal);
    setCalendarFormData(cal ? { name: cal.name, color: cal.color } : { name: '', color: COLOR_OPTIONS[0] });
    setCalendarModalOpen(true);
  }

  const handleSaveCalendar = async () => {
    if (!user || !calendarFormData.name.trim()) return;
    setIsLoading(true);
    try {
      const payload = { name: calendarFormData.name.trim(), color: calendarFormData.color };
      if (editingCalendar) {
        await updateDoc(doc(db, 'users', user.uid, 'calendars', editingCalendar.id), payload);
      } else {
        await addDoc(collection(db, 'users', user.uid, 'calendars'), { ...payload, visible: true });
      }
      setCalendarModalOpen(false);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  }

  const handleDeleteCalendar = async () => {
    if (!user || !editingCalendar || !confirm(`Kalender "${editingCalendar.name}" und alle zugehörigen Termine wirklich löschen?`)) return;
    setIsLoading(true);
    try {
      const batch = writeBatch(db);
      // Delete calendar doc
      batch.delete(doc(db, 'users', user.uid, 'calendars', editingCalendar.id));
      // Find and delete all events in that calendar
      const eventsQuery = query(collection(db, 'users', user.uid, 'events'), where('calendarId', '==', editingCalendar.id));
      const eventSnap = await getDocs(eventsQuery);
      eventSnap.docs.forEach(eventDoc => batch.delete(eventDoc.ref));
      await batch.commit();
      setCalendarModalOpen(false);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  }

  // ─── General State & Form Handlers ────────────────────────────────────────
  const handleEventFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!eventFormData) return;
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setEventFormData(p => ({ ...p!, [name]: val }));
    if (name === 'calendarId') {
      const cal = calendars.find(c => c.id === value);
      if (cal) setEventFormData(p => ({...p!, color: cal.color }))
    }
  };

  const toggleCalendarVisibility = async (id: string) => {
    if (!user) return;
    const newVisibility = !visibleCalendars[id];
    setVisibleCalendars(prev => ({ ...prev, [id]: newVisibility }));
    try { await updateDoc(doc(db, 'users', user.uid, 'calendars', id), { visible: newVisibility }); }
    catch (err) { setVisibleCalendars(prev => ({ ...prev, [id]: !newVisibility })); console.error(err); }
  };

  // ─── Save / Delete Event ────────────────────────────────────────────────────
  const handleSaveEvent = async () => {
    if (!user || !eventFormData) return;
    if (!eventFormData.title.trim() || !eventFormData.start || !eventFormData.calendarId) return setError('Titel, Datum und Kalender sind erforderlich.');
    setIsLoading(true); setError(null);
    try {
      const payload = { ...eventFormData, start: eventFormData.allDay ? eventFormData.start : `${eventFormData.start}T${eventFormData.startTime}`, end: eventFormData.end && eventFormData.end !== eventFormData.start ? (eventFormData.allDay ? eventFormData.end : `${eventFormData.end}T${eventFormData.endTime}`) : null };
      if (editingEventId) {
        await updateDoc(doc(db, 'users', user.uid, 'events', editingEventId), payload);
      } else {
        await addDoc(collection(db, 'users', user.uid, 'events'), payload);
      }
      setEventModalOpen(false); setEventFormData(null); setEditingEventId(null);
    } catch { setError('Fehler beim Speichern.'); } finally { setIsLoading(false); }
  };

  const handleDeleteEvent = async () => {
    if (!user || !editingEventId || !confirm('Diesen Termin wirklich löschen?')) return;
    setIsLoading(true);
    try { await deleteDoc(doc(db, 'users', user.uid, 'events', editingEventId)); setEventModalOpen(false); setEditingEventId(null); }
    catch { setError('Fehler beim Löschen.'); } finally { setIsLoading(false); }
  };

  // ─── Derived / Filtered Data ───────────────────────────────────────────────
  const filteredEvents = events.filter(ev => visibleCalendars[ev.calendarId] && (!searchQuery || ev.title.toLowerCase().includes(searchQuery.toLowerCase()) || (ev.description ?? '').toLowerCase().includes(searchQuery.toLowerCase()) || (ev.location ?? '').toLowerCase().includes(searchQuery.toLowerCase())));
  const upcomingEvents = events.filter(ev => ev.start >= today() && visibleCalendars[ev.calendarId]).slice(0, 8);
  const calendarEvents: EventInput[] = filteredEvents.map(e => ({ id: e.id, title: e.title, start: e.start, end: e.end, backgroundColor: e.color, borderColor: e.color, allDay: e.allDay ?? true, extendedProps: { location: e.location, description: e.description } }));

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      {/* Toolbars, etc. */}
      <div style={s.topBar}>
        <div style={s.topBarLeft}>
          <button style={s.todayBtn} onClick={goToday}>Heute</button>
          <div style={s.navGroup}><button style={s.navBtn} onClick={goPrev}>‹</button><button style={s.navBtn} onClick={goNext}>›</button></div>
          <h2 style={s.currentTitle}>{currentTitle}</h2>
        </div>
        <div style={s.topBarCenter}>
          <div style={s.searchWrapper}><span style={s.searchIcon}>🔍</span><input style={s.searchInput} placeholder="Termine suchen..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />{searchQuery && <button style={s.searchClear} onClick={() => setSearchQuery('')}>✕</button>}</div>
        </div>
        <div style={s.topBarRight}>
          <div style={s.viewToggle}>{(['dayGridMonth', 'dayGridWeek', 'dayGridDay'] as ViewMode[]).map(v => <button key={v} style={view === v ? { ...s.viewBtn, ...s.viewBtnActive } : s.viewBtn} onClick={() => changeView(v)}>{v === 'dayGridMonth' ? 'Monat' : v === 'dayGridWeek' ? 'Woche' : 'Tag'}</button>)}</div>
          <button style={s.newEventBtn} onClick={() => openCreateEvent()}>+ Neuer Termin</button>
          <button style={s.sidebarToggle} onClick={() => setSidebarOpen(p => !p)} title={sidebarOpen ? 'Sidebar schließen' : 'Sidebar öffnen'}>{sidebarOpen ? '⊟' : '⊞'}</button>
        </div>
      </div>

      <div style={s.mainLayout}>
        {sidebarOpen && (
          <aside style={s.sidebar}>
            <div style={s.sideSection}><FullCalendar plugins={[dayGridPlugin, interactionPlugin]} initialView="dayGridMonth" locale="de" headerToolbar={false} height="auto" dateClick={arg => { calendarRef.current?.getApi().gotoDate(arg.date); changeView('dayGridDay'); }} /></div>
            <div style={s.sideSection}>
                <div style={s.calendarHeader}><h3 style={s.sideSectionTitle}>Meine Kalender</h3><button style={s.addCalendarBtn} onClick={() => openCalendarModal(null)}>+</button></div>
                {calendars.map(cal => (
                    <div key={cal.id} style={s.calCheckRow}>
                    <input type="checkbox" id={`cal-vis-${cal.id}`} checked={visibleCalendars[cal.id] ?? false} onChange={() => toggleCalendarVisibility(cal.id)} style={{...s.calCheckbox, accentColor: cal.color}} />
                    <label htmlFor={`cal-vis-${cal.id}`} style={{...s.calLabel, color: cal.color}}>{cal.name}</label>
                    <button style={s.editCalendarBtn} onClick={() => openCalendarModal(cal)}>✏️</button>
                    </div>
                ))}
            </div>
            <div style={s.sideSection}>
              <h3 style={s.sideSectionTitle}>Nächste Termine</h3>
              {upcomingEvents.length === 0 && <p style={s.sideEmpty}>Keine kommenden Termine.</p>}
              {upcomingEvents.map(ev => <div key={ev.id} style={{ ...s.upcomingItem, borderLeftColor: ev.color }} onClick={() => openEditEvent(ev)}><div style={s.upcomingInfo}><div style={s.upcomingTitle}>{ev.title}</div><div style={s.upcomingDate}>{new Date(ev.start).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}{ev.location && ` · ${ev.location}`}</div></div></div>)}
            </div>
          </aside>
        )}

        <div style={s.calendarArea}><FullCalendar ref={calendarRef} plugins={[dayGridPlugin, interactionPlugin]} initialView={view} locale="de" headerToolbar={false} events={calendarEvents} dateClick={handleDateClick} eventClick={handleEventClick} eventDrop={handleEventDrop} editable={true} droppable={true} height="auto" dayMaxEvents={4} datesSet={updateTitle} eventDidMount={info => { info.el.title = [ info.event.title, info.event.extendedProps.location, info.event.extendedProps.description ].filter(Boolean).join(' · '); }} /></div>
      </div>

      {/* Event Modal */}
      {isEventModalOpen && eventFormData && (
        <div style={s.overlay} onClick={() => setEventModalOpen(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}><h2 style={s.modalTitle}>{editingEventId ? '✏️ Termin bearbeiten' : '✨ Neuer Termin'}</h2><button style={s.modalClose} onClick={() => setEventModalOpen(false)}>✕</button></div>
            {error && <div style={s.errorBanner}>{error}</div>}
            <div style={s.modalSection}><label style={s.modalLabel}>Kalender</label><select name="calendarId" value={eventFormData.calendarId} onChange={handleEventFormChange} style={s.modalInput}><option value="" disabled>Kalender auswählen</option>{calendars.map(cal => <option key={cal.id} value={cal.id}>{cal.name}</option>)}</select></div>
            <div style={s.modalSection}><label style={s.modalLabel}>Titel *</label><input name="title" value={eventFormData.title} onChange={handleEventFormChange} placeholder="z. B. Pfarrmesse..." style={s.modalInput} autoFocus /></div>
            <div style={s.modalSection}><div style={s.allDayRow}><label style={s.modalLabel}>Datum & Zeit</label><label style={s.checkLabel}><input type="checkbox" name="allDay" checked={eventFormData.allDay} onChange={handleEventFormChange} style={{ marginRight: '6px' }} />Ganztägig</label></div><div style={s.dateTimeGrid}><div><div style={s.subLabel}>Von</div><input name="start" type="date" value={eventFormData.start} onChange={handleEventFormChange} style={s.modalInput} /></div>{!eventFormData.allDay && <div><div style={s.subLabel}>Uhrzeit</div><input name="startTime" type="time" value={eventFormData.startTime} onChange={handleEventFormChange} style={s.modalInput} /></div>}<div><div style={s.subLabel}>Bis</div><input name="end" type="date" value={eventFormData.end} onChange={handleEventFormChange} style={s.modalInput} /></div>{!eventFormData.allDay && <div><div style={s.subLabel}>Uhrzeit</div><input name="endTime" type="time" value={eventFormData.endTime} onChange={handleEventFormChange} style={s.modalInput} /></div>}</div></div>
            <div style={s.modalSection}><label style={s.modalLabel}>📍 Ort</label><input name="location" value={eventFormData.location} onChange={handleEventFormChange} placeholder="z. B. Pfarrkirche St. Maria" style={s.modalInput} /></div>
            <div style={s.modalSection}><label style={s.modalLabel}>📝 Beschreibung</label><textarea name="description" value={eventFormData.description} onChange={handleEventFormChange} placeholder="Notizen, Hinweise, Ablauf..." style={{ ...s.modalInput, height: '90px', resize: 'vertical' }} /></div>
            <div style={{...s.previewStrip, backgroundColor: eventFormData.color}}><span style={s.previewTitle}>{eventFormData.title || 'Vorschau Titel'}</span>{eventFormData.location && <span style={s.previewLocation}>· {eventFormData.location}</span>}</div>
            <div style={s.modalActions}>{editingEventId && <button onClick={handleDeleteEvent} disabled={isLoading} style={s.deleteBtn}>🗑 Löschen</button>}<button onClick={() => setEventModalOpen(false)} style={s.cancelBtn}>Abbrechen</button><button onClick={handleSaveEvent} disabled={isLoading} style={s.saveBtn}>{isLoading ? 'Speichert...' : editingEventId ? '✓ Aktualisieren' : '✓ Erstellen'}</button></div>
          </div>
        </div>
      )}

      {/* Calendar Management Modal */}
       {isCalendarModalOpen && (
        <div style={s.overlay} onClick={() => setCalendarModalOpen(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}><h2 style={s.modalTitle}>{editingCalendar ? 'Kalender bearbeiten' : 'Neuer Kalender'}</h2><button style={s.modalClose} onClick={() => setCalendarModalOpen(false)}>✕</button></div>
            <div style={s.modalSection}><label style={s.modalLabel}>Name</label><input value={calendarFormData.name} onChange={e => setCalendarFormData({...calendarFormData, name: e.target.value})} placeholder="Name des Kalenders" style={s.modalInput} autoFocus /></div>
            <div style={s.modalSection}><label style={s.modalLabel}>Farbe</label><div style={s.colorRow}>{COLOR_OPTIONS.map(color => <button key={color} onClick={() => setCalendarFormData({...calendarFormData, color})} style={{...s.colorSwatch, backgroundColor: color, outline: calendarFormData.color === color ? '3px solid #1a1a1a' : 'none', outlineOffset: '2px' }} />)}</div></div>
            <div style={s.modalActions}>{editingCalendar && <button onClick={handleDeleteCalendar} disabled={isLoading} style={s.deleteBtn}>🗑 Löschen</button>}<button onClick={() => setCalendarModalOpen(false)} style={s.cancelBtn}>Abbrechen</button><button onClick={handleSaveCalendar} disabled={isLoading} style={s.saveBtn}>{isLoading ? 'Speichert...' : '✓ Erstellen'}</button></div>
          </div>
        </div>
      )}

      <style>{`.fc { font-family: 'Georgia', serif; } .fc-daygrid-day:hover { background: #f0f4ff !important; cursor: pointer; } .fc-daygrid-day-number { font-size: 0.85rem; padding: 6px 8px; } .fc-daygrid-day.fc-day-today { background: #fef9f0 !important; } .fc-daygrid-day.fc-day-today .fc-daygrid-day-number { background: #2c3e50; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; } .fc-col-header-cell-cushion { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: none !important; } .fc-event { border-radius: 4px !important; border: none !important; padding: 2px 6px !important; font-size: 0.78rem !important; cursor: pointer !important; } .fc-theme-standard td, .fc-theme-standard th, .fc-scrollgrid { border-color: #eef0f3 !important; }`}</style>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s: { [key: string]: React.CSSProperties } = {
  // Page & Layout
  page: { display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f7f8fc', fontFamily: 'Georgia, serif', overflow: 'hidden' },
  mainLayout: { display: 'flex', flex: 1, overflow: 'hidden' },
  calendarArea: { flex: 1, overflowY: 'auto', padding: '16px 20px', minWidth: 0 },
  
  // Top Bar
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', backgroundColor: 'white', borderBottom: '1px solid #eef0f3', flexShrink: 0, gap: '12px' },
  topBarLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  topBarCenter: { flex: 1, minWidth: '180px', maxWidth: '380px' },
  topBarRight: { display: 'flex', alignItems: 'center', gap: '8px' },
  currentTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#2c3e50', margin: 0 },
  todayBtn: { padding: '7px 14px', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' },
  navGroup: { display: 'flex', gap: '2px' },
  navBtn: { width: '30px', height: '30px', border: '1px solid #dde', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' },
  searchWrapper: { display: 'flex', alignItems: 'center', backgroundColor: '#f3f5f9', borderRadius: '8px', padding: '0 12px', border: '1px solid #e8eaf0', gap: '8px' },
  searchInput: { border: 'none', background: 'transparent', outline: 'none', padding: '8px 0', fontSize: '0.9rem', width: '100%' },
  searchClear: { background: 'none', border: 'none', cursor: 'pointer', color: '#999' },
  viewToggle: { display: 'flex', border: '1px solid #dde', borderRadius: '8px', overflow: 'hidden' },
  viewBtn: { padding: '7px 12px', border: 'none', borderRight: '1px solid #dde', backgroundColor: 'white', cursor: 'pointer', fontSize: '0.82rem', color: '#555' },
  viewBtnActive: { backgroundColor: '#2c3e50', color: 'white' },
  newEventBtn: { padding: '8px 16px', backgroundColor: '#80397B', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' },
  sidebarToggle: { width: '34px', height: '34px', border: '1px solid #dde', borderRadius: '7px', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  // Sidebar
  sidebar: { width: '260px', minWidth: '260px', backgroundColor: 'white', borderRight: '1px solid #eef0f3', overflowY: 'auto', flexShrink: 0 },
  sideSection: { padding: '18px 16px', borderBottom: '1px solid #f0f2f7' },
  sideSectionTitle: { fontSize: '0.72rem', fontWeight: 700, color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 12px 0' },
  calendarHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  addCalendarBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#888', padding: '4px' },
  editCalendarBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#aaa', opacity: 0, transition: 'opacity 0.15s' },
  calCheckRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', 'hover .editCalendarBtn': { opacity: 1 } },
  calCheckbox: { width: '16px', height: '16px', cursor: 'pointer' },
  calLabel: { fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', flex: 1 },
  upcomingItem: { display: 'flex', gap: '10px', padding: '8px', borderRadius: '8px', cursor: 'pointer', marginBottom: '6px', borderLeft: '3px solid', backgroundColor: '#fafbfd' },
  upcomingInfo: { flex: 1, minWidth: 0 },
  upcomingTitle: { fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  upcomingDate:  { fontSize: '0.75rem', color: '#888', marginTop: '2px' },
  sideEmpty: { fontSize: '0.85rem', color: '#aaa' },

  // Modal
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(10,12,20,0.5)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' },
  modal: { backgroundColor: 'white', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  modalTitle: { fontSize: '1.25rem', fontWeight: 700, color: '#2c3e50', margin: 0 },
  modalClose: { background: '#f3f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: '#555' },
  modalSection: { marginBottom: '18px' },
  modalLabel: { display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#555', marginBottom: '8px', textTransform: 'uppercase' },
  modalInput: { width: '100%', padding: '10px 14px', borderRadius: '9px', border: '1px solid #dde', fontSize: '0.95rem', boxSizing: 'border-box', backgroundColor: '#fafbfd' },
  allDayRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  checkLabel: { fontSize: '0.82rem', display: 'flex', alignItems: 'center', cursor: 'pointer' },
  dateTimeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  subLabel: { fontSize: '0.75rem', color: '#888', marginBottom: '5px' },
  colorRow: { display: 'flex', gap: '8px', alignItems: 'center' },
  colorSwatch: { width: '26px', height: '26px', borderRadius: '50%', border: 'none', cursor: 'pointer' },
  previewStrip: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: '9px', color: 'white' },
  previewTitle: { fontWeight: 700, flex: 1 },
  previewLocation: { opacity: 0.85 },
  errorBanner: { backgroundColor: '#fff5f5', border: '1px solid #fcc', color: '#c0392b', padding: '10px 14px', borderRadius: '9px', marginBottom: '16px' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center', paddingTop: '4px' },
  saveBtn: { padding: '10px 22px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' },
  cancelBtn: { padding: '10px 18px', backgroundColor: '#f0f2f5', border: '1px solid #dde', borderRadius: '9px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' },
  deleteBtn: { padding: '10px 16px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: 700, marginRight: 'auto' },
};
