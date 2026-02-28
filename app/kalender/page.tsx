'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { EventClickArg, EventInput, EventDropArg } from '@fullcalendar/core';
import { db } from '../firebase/config';
import { useAuth } from '../AuthContext';
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, orderBy, writeBatch, where, getDocs,
} from 'firebase/firestore';

// ── Interfaces ────────────────────────────────────────────────────────────────
interface Calendar  { id: string; name: string; color: string; visible: boolean; }
interface CalEvent  { id: string; calendarId: string; title: string; start: string; end?: string | null; color: string; category: string; description?: string; location?: string; allDay?: boolean; }
interface EventForm { calendarId: string; title: string; start: string; end: string; startTime: string; endTime: string; color: string; category: string; description: string; location: string; allDay: boolean; }
type ViewMode = 'dayGridMonth' | 'dayGridWeek' | 'dayGridDay';

// ── Constants ─────────────────────────────────────────────────────────────────
const DEFAULT_CALS: Omit<Calendar, 'id'>[] = [
  { name: 'Pfarrkalender', color: '#8e44ad', visible: true },
  { name: 'Privat',        color: '#e67e22', visible: true },
  { name: 'Beerdigungen',  color: '#7f8c8d', visible: true },
];
const COLORS = ['#8e44ad','#e67e22','#3498db','#27ae60','#e84393','#c0392b','#2c3e50','#f39c12'];
const todayStr = () => new Date().toISOString().slice(0, 10);
const EMPTY_FORM = (cals: Calendar[]): EventForm => ({
  calendarId: cals.find(c => c.visible)?.id ?? '',
  title: '', start: todayStr(), end: todayStr(),
  startTime: '09:00', endTime: '10:00',
  color: cals.find(c => c.visible)?.color ?? '#2c3e50',
  category: 'termin', description: '', location: '', allDay: true,
});

// ── Component ─────────────────────────────────────────────────────────────────
export default function KalenderPage() {
  const { user } = useAuth();
  const calRef = useRef<InstanceType<typeof FullCalendar>>(null);

  const [calendars,    setCalendars]    = useState<Calendar[]>([]);
  const [visibleCals,  setVisibleCals]  = useState<Record<string, boolean>>({});
  const [events,       setEvents]       = useState<CalEvent[]>([]);
  const [view,         setView]         = useState<ViewMode>('dayGridMonth');
  const [currentTitle, setCurrentTitle] = useState('');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [isLoading,    setIsLoading]    = useState(false);
  const [formError,    setFormError]    = useState<string | null>(null);

  // Event modal
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventForm,      setEventForm]      = useState<EventForm | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Calendar modal
  const [calModalOpen,    setCalModalOpen]    = useState(false);
  const [calForm,         setCalForm]         = useState({ name: '', color: COLORS[0] });
  const [editingCalendar, setEditingCalendar] = useState<Calendar | null>(null);

  // ── Firestore Listeners ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const unsubEvents = onSnapshot(
      query(collection(db, 'users', user.uid, 'events'), orderBy('start', 'asc')),
      snap => setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as CalEvent)))
    );

    const unsubCals = onSnapshot(
      query(collection(db, 'users', user.uid, 'calendars')),
      async snap => {
        if (snap.empty) {
          // Create default calendars
          const batch = writeBatch(db);
          const created = DEFAULT_CALS.map(cal => {
            const ref = doc(collection(db, 'users', user.uid, 'calendars'));
            batch.set(ref, cal);
            return { id: ref.id, ...cal };
          });
          await batch.commit();
          setCalendars(created);
          setVisibleCals(Object.fromEntries(created.map(c => [c.id, c.visible])));
        } else {
          const cals = snap.docs.map(d => ({ id: d.id, ...d.data() } as Calendar));
          setCalendars(cals);
          setVisibleCals(prev => cals.reduce((acc, c) => ({ ...acc, [c.id]: prev[c.id] ?? c.visible }), {} as Record<string, boolean>));
        }
      }
    );

    return () => { unsubEvents(); unsubCals(); };
  }, [user]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const updateTitle  = useCallback(() => { if (calRef.current) setCurrentTitle(calRef.current.getApi().getCurrentData().viewTitle); }, []);
  const goToday      = () => calRef.current?.getApi().today();
  const goPrev       = () => calRef.current?.getApi().prev();
  const goNext       = () => calRef.current?.getApi().next();
  const changeView   = (v: ViewMode) => { setView(v); calRef.current?.getApi().changeView(v); };

  // ── Event Modal ──────────────────────────────────────────────────────────
  const openCreate = useCallback((dateStr?: string) => {
    setEditingEventId(null);
    setEventForm({ ...EMPTY_FORM(calendars), start: dateStr ?? todayStr(), end: dateStr ?? todayStr() });
    setFormError(null);
    setEventModalOpen(true);
  }, [calendars]);

  const openEdit = useCallback((ev: CalEvent) => {
    setEditingEventId(ev.id);
    setEventForm({
      calendarId: ev.calendarId,
      title:      ev.title,
      start:      ev.start.slice(0, 10),
      end:        ev.end ? ev.end.slice(0, 10) : ev.start.slice(0, 10),
      startTime:  ev.start.length > 10 ? ev.start.slice(11, 16) : '09:00',
      endTime:    ev.end && ev.end.length > 10 ? ev.end.slice(11, 16) : '10:00',
      color:      ev.color,
      category:   ev.category,
      description:ev.description ?? '',
      location:   ev.location ?? '',
      allDay:     ev.allDay ?? true,
    });
    setFormError(null);
    setEventModalOpen(true);
  }, []);

  const handleDateClick  = useCallback((arg: DateClickArg) => openCreate(arg.dateStr), [openCreate]);
  const handleEventClick = useCallback((arg: EventClickArg) => {
    const ev = events.find(e => e.id === arg.event.id);
    if (ev) openEdit(ev);
  }, [events, openEdit]);

  const handleEventDrop = useCallback(async (arg: EventDropArg) => {
    if (!user) return;
    try { await updateDoc(doc(db, 'users', user.uid, 'events', arg.event.id), { start: arg.event.startStr, end: arg.event.endStr || null }); }
    catch { arg.revert(); }
  }, [user]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!eventForm) return;
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setEventForm(p => {
      const updated = { ...p!, [name]: val };
      // Auto-set color when calendar changes
      if (name === 'calendarId') {
        const cal = calendars.find(c => c.id === value);
        if (cal) updated.color = cal.color;
      }
      return updated;
    });
  };

  const handleSaveEvent = async () => {
    if (!user || !eventForm) return;
    if (!eventForm.title.trim()) return setFormError('Bitte einen Titel eingeben.');
    if (!eventForm.start)        return setFormError('Bitte ein Startdatum wählen.');
    if (!eventForm.calendarId)   return setFormError('Bitte einen Kalender auswählen.');

    setIsLoading(true); setFormError(null);
    try {
      const payload = {
        ...eventForm,
        start: eventForm.allDay ? eventForm.start : `${eventForm.start}T${eventForm.startTime}`,
        end:   eventForm.end && eventForm.end !== eventForm.start
          ? (eventForm.allDay ? eventForm.end : `${eventForm.end}T${eventForm.endTime}`)
          : null,
      };
      if (editingEventId) {
        await updateDoc(doc(db, 'users', user.uid, 'events', editingEventId), payload);
      } else {
        await addDoc(collection(db, 'users', user.uid, 'events'), payload);
      }
      setEventModalOpen(false); setEventForm(null); setEditingEventId(null);
    } catch { setFormError('Fehler beim Speichern.'); }
    finally { setIsLoading(false); }
  };

  const handleDeleteEvent = async () => {
    if (!user || !editingEventId || !confirm('Termin wirklich löschen?')) return;
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'events', editingEventId));
      setEventModalOpen(false); setEditingEventId(null);
    } catch { setFormError('Fehler beim Löschen.'); }
    finally { setIsLoading(false); }
  };

  // ── Calendar Modal ────────────────────────────────────────────────────────
  const openCalModal = (cal: Calendar | null) => {
    setEditingCalendar(cal);
    setCalForm(cal ? { name: cal.name, color: cal.color } : { name: '', color: COLORS[0] });
    setCalModalOpen(true);
  };

  const handleSaveCal = async () => {
    if (!user || !calForm.name.trim()) return;
    setIsLoading(true);
    try {
      const payload = { name: calForm.name.trim(), color: calForm.color };
      if (editingCalendar) {
        await updateDoc(doc(db, 'users', user.uid, 'calendars', editingCalendar.id), payload);
      } else {
        await addDoc(collection(db, 'users', user.uid, 'calendars'), { ...payload, visible: true });
      }
      setCalModalOpen(false);
    } finally { setIsLoading(false); }
  };

  const handleDeleteCal = async () => {
    if (!user || !editingCalendar || !confirm(`Kalender "${editingCalendar.name}" und alle Termine löschen?`)) return;
    setIsLoading(true);
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'users', user.uid, 'calendars', editingCalendar.id));
      const evSnap = await getDocs(query(collection(db, 'users', user.uid, 'events'), where('calendarId', '==', editingCalendar.id)));
      evSnap.forEach(d => batch.delete(d.ref));
      await batch.commit();
      setCalModalOpen(false);
    } finally { setIsLoading(false); }
  };

  const toggleCalVis = async (id: string) => {
    if (!user) return;
    const next = !visibleCals[id];
    setVisibleCals(p => ({ ...p, [id]: next }));
    try { await updateDoc(doc(db, 'users', user.uid, 'calendars', id), { visible: next }); }
    catch { setVisibleCals(p => ({ ...p, [id]: !next })); }
  };

  // ── Derived Data ──────────────────────────────────────────────────────────
  const filteredEvents = events.filter(ev =>
    visibleCals[ev.calendarId] &&
    (!searchQuery || [ev.title, ev.description ?? '', ev.location ?? ''].some(f => f.toLowerCase().includes(searchQuery.toLowerCase())))
  );
  const upcomingEvents = events
    .filter(ev => ev.start >= todayStr() && visibleCals[ev.calendarId])
    .slice(0, 8);
  const calendarEvents: EventInput[] = filteredEvents.map(e => ({
    id: e.id, title: e.title, start: e.start, end: e.end,
    backgroundColor: e.color, borderColor: e.color, allDay: e.allDay ?? true,
    extendedProps: { location: e.location, description: e.description },
  }));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      {/* Top Bar */}
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
            {(['dayGridMonth','dayGridWeek','dayGridDay'] as ViewMode[]).map(v => (
              <button key={v} style={view === v ? { ...s.viewBtn, ...s.viewBtnActive } : s.viewBtn} onClick={() => changeView(v)}>
                {v === 'dayGridMonth' ? 'Monat' : v === 'dayGridWeek' ? 'Woche' : 'Tag'}
              </button>
            ))}
          </div>
          <button style={s.newBtn} onClick={() => openCreate()}>+ Neuer Termin</button>
          <button style={s.sidebarToggle} onClick={() => setSidebarOpen(p => !p)} title="Sidebar">
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
      </div>

      <div style={s.body}>
        {/* Sidebar */}
        {sidebarOpen && (
          <aside style={s.sidebar}>
            {/* Mini calendar */}
            <div style={s.sideSection}>
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale="de"
                headerToolbar={false}
                height="auto"
                dateClick={arg => { calRef.current?.getApi().gotoDate(arg.date); changeView('dayGridDay'); }}
              />
            </div>
            {/* Calendars */}
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
            {/* Upcoming */}
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
        )}

        {/* Main Calendar */}
        <div style={s.calArea}>
          <FullCalendar
            ref={calRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView={view}
            locale="de"
            headerToolbar={false}
            events={calendarEvents}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            editable
            droppable
            height="auto"
            dayMaxEvents={4}
            datesSet={updateTitle}
            eventDidMount={info => {
              const parts = [info.event.title, info.event.extendedProps.location, info.event.extendedProps.description].filter(Boolean);
              info.el.title = parts.join(' · ');
            }}
          />
        </div>
      </div>

      {/* ── Event Modal ─────────────────────────────────────────────────────── */}
      {eventModalOpen && eventForm && (
        <div style={s.overlay} onClick={() => setEventModalOpen(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>{editingEventId ? '✏️ Termin bearbeiten' : '✨ Neuer Termin'}</h2>
              <button style={s.modalClose} onClick={() => setEventModalOpen(false)}>✕</button>
            </div>
            {formError && <div style={s.errorBanner}>{formError}</div>}

            <label style={s.ml}>Kalender</label>
            <select name="calendarId" value={eventForm.calendarId} onChange={handleFormChange} style={s.mi}>
              <option value="">Kalender auswählen</option>
              {calendars.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <label style={s.ml}>Titel *</label>
            <input name="title" value={eventForm.title} onChange={handleFormChange} placeholder="z. B. Pfarrmesse…" style={s.mi} autoFocus />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={s.ml}>Datum & Zeit</label>
              <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" name="allDay" checked={eventForm.allDay} onChange={handleFormChange} /> Ganztägig
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: eventForm.allDay ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div><div style={{ fontSize: '0.72rem', color: '#888', marginBottom: '4px' }}>Von</div><input name="start" type="date" value={eventForm.start} onChange={handleFormChange} style={s.mi} /></div>
              {!eventForm.allDay && <div><div style={{ fontSize: '0.72rem', color: '#888', marginBottom: '4px' }}>Uhrzeit</div><input name="startTime" type="time" value={eventForm.startTime} onChange={handleFormChange} style={s.mi} /></div>}
              <div><div style={{ fontSize: '0.72rem', color: '#888', marginBottom: '4px' }}>Bis</div><input name="end" type="date" value={eventForm.end} onChange={handleFormChange} style={s.mi} /></div>
              {!eventForm.allDay && <div><div style={{ fontSize: '0.72rem', color: '#888', marginBottom: '4px' }}>Uhrzeit</div><input name="endTime" type="time" value={eventForm.endTime} onChange={handleFormChange} style={s.mi} /></div>}
            </div>

            <label style={s.ml}>📍 Ort</label>
            <input name="location" value={eventForm.location} onChange={handleFormChange} placeholder="z. B. Pfarrkirche St. Maria" style={s.mi} />

            <label style={s.ml}>📝 Beschreibung</label>
            <textarea name="description" value={eventForm.description} onChange={handleFormChange} placeholder="Notizen, Ablauf…" style={{ ...s.mi, height: '80px', resize: 'vertical' }} />

            {/* Color preview */}
            <div style={{ ...s.previewBar, backgroundColor: eventForm.color }}>
              <span style={{ color: 'white', fontWeight: 600 }}>{eventForm.title || 'Vorschau'}</span>
              {eventForm.location && <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>· {eventForm.location}</span>}
            </div>

            <div style={s.modalActions}>
              {editingEventId && <button onClick={handleDeleteEvent} disabled={isLoading} style={s.deleteBtn}>🗑 Löschen</button>}
              <button onClick={() => setEventModalOpen(false)} style={s.cancelBtn}>Abbrechen</button>
              <button onClick={handleSaveEvent} disabled={isLoading} style={s.saveBtn}>
                {isLoading ? 'Speichert…' : editingEventId ? '✓ Aktualisieren' : '✓ Erstellen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Calendar Modal ───────────────────────────────────────────────────── */}
      {calModalOpen && (
        <div style={s.overlay} onClick={() => setCalModalOpen(false)}>
          <div style={{ ...s.modal, maxWidth: '380px' }} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>{editingCalendar ? 'Kalender bearbeiten' : 'Neuer Kalender'}</h2>
              <button style={s.modalClose} onClick={() => setCalModalOpen(false)}>✕</button>
            </div>
            <label style={s.ml}>Name</label>
            <input value={calForm.name} onChange={e => setCalForm(p => ({ ...p, name: e.target.value }))} placeholder="Kalendername" style={s.mi} autoFocus />
            <label style={s.ml}>Farbe</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => setCalForm(p => ({ ...p, color: c }))}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer', backgroundColor: c, outline: calForm.color === c ? '3px solid #333' : 'none', outlineOffset: '2px' }}
                />
              ))}
            </div>
            <div style={s.modalActions}>
              {editingCalendar && <button onClick={handleDeleteCal} disabled={isLoading} style={s.deleteBtn}>🗑 Löschen</button>}
              <button onClick={() => setCalModalOpen(false)} style={s.cancelBtn}>Abbrechen</button>
              <button onClick={handleSaveCal} disabled={isLoading || !calForm.name.trim()} style={s.saveBtn}>
                {isLoading ? 'Speichert…' : '✓ Speichern'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s: { [key: string]: React.CSSProperties } = {
  page:         { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f7f8fc', fontFamily: 'Georgia, serif', overflow: 'hidden' },
  body:         { display: 'flex', flex: 1, overflow: 'hidden' },
  calArea:      { flex: 1, overflowY: 'auto', padding: '16px 20px', minWidth: 0 },
  // Top bar
  topBar:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', backgroundColor: 'white', borderBottom: '1px solid #eef0f3', flexShrink: 0, gap: '12px', flexWrap: 'wrap' },
  topLeft:      { display: 'flex', alignItems: 'center', gap: '10px' },
  topCenter:    { flex: 1, minWidth: '160px', maxWidth: '360px' },
  topRight:     { display: 'flex', alignItems: 'center', gap: '8px' },
  currentTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#2c3e50', margin: 0 },
  todayBtn:     { padding: '7px 14px', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' },
  navGroup:     { display: 'flex', gap: '2px' },
  navBtn:       { width: '30px', height: '30px', border: '1px solid #dde', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' },
  searchWrap:   { display: 'flex', alignItems: 'center', backgroundColor: '#f3f5f9', borderRadius: '8px', padding: '0 12px', border: '1px solid #e8eaf0', gap: '8px' },
  searchInput:  { border: 'none', background: 'transparent', outline: 'none', padding: '8px 0', fontSize: '0.9rem', width: '100%' },
  clearBtn:     { background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '0.9rem' },
  viewGroup:    { display: 'flex', border: '1px solid #dde', borderRadius: '8px', overflow: 'hidden' },
  viewBtn:      { padding: '7px 12px', border: 'none', borderRight: '1px solid #dde', backgroundColor: 'white', cursor: 'pointer', fontSize: '0.82rem', color: '#555' },
  viewBtnActive:{ backgroundColor: '#2c3e50', color: 'white' },
  newBtn:       { padding: '8px 16px', backgroundColor: '#80397B', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' },
  sidebarToggle:{ width: '34px', height: '34px', border: '1px solid #dde', borderRadius: '7px', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' },
  // Sidebar
  sidebar:      { width: '255px', minWidth: '255px', backgroundColor: 'white', borderRight: '1px solid #eef0f3', overflowY: 'auto', flexShrink: 0 },
  sideSection:  { padding: '14px', borderBottom: '1px solid #f0f2f7' },
  sideHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  sideTitle:    { fontSize: '0.72rem', fontWeight: 700, color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.07em' },
  addBtn:       { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#888', padding: '2px 6px' },
  calRow:       { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  calLabel:     { flex: 1, fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' },
  editCalBtn:   { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', opacity: 0.5 },
  upcomingItem: { borderLeft: '3px solid', padding: '7px 8px', borderRadius: '6px', cursor: 'pointer', marginBottom: '6px', backgroundColor: '#fafbfd' },
  upcomingTitle:{ fontSize: '0.84rem', fontWeight: 600 },
  upcomingDate: { fontSize: '0.74rem', color: '#888', marginTop: '2px' },
  sideEmpty:    { fontSize: '0.83rem', color: '#aaa', margin: '8px 0 0' },
  // Modal
  overlay:      { position: 'fixed', inset: 0, backgroundColor: 'rgba(10,12,20,0.5)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal:        { backgroundColor: 'white', borderRadius: '16px', padding: '26px', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' },
  modalHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' },
  modalTitle:   { fontSize: '1.2rem', fontWeight: 700, color: '#2c3e50', margin: 0 },
  modalClose:   { background: '#f3f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  ml:           { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#555', marginBottom: '6px', textTransform: 'uppercase' },
  mi:           { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dde', fontSize: '0.93rem', boxSizing: 'border-box', backgroundColor: '#fafbfd', marginBottom: '14px', fontFamily: 'inherit' },
  previewBar:   { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', marginBottom: '18px' },
  errorBanner:  { backgroundColor: '#fff5f5', border: '1px solid #fcc', color: '#c0392b', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.9rem' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center' },
  saveBtn:      { padding: '10px 22px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' },
  cancelBtn:    { padding: '10px 16px', backgroundColor: '#f0f2f5', border: '1px solid #dde', borderRadius: '9px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' },
  deleteBtn:    { padding: '10px 14px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: 700, marginRight: 'auto' },
};
