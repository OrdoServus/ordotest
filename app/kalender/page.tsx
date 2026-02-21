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
} from 'firebase/firestore';

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface CalendarEvent {
  id: string;
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
type ModalMode = 'create' | 'edit' | 'view';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: 'Gottesdienst', value: 'gottesdienst', color: '#2c3e50', icon: '⛪' },
  { label: 'Taufe',        value: 'taufe',        color: '#3498db', icon: '💧' },
  { label: 'Beerdigung',   value: 'beerdigung',   color: '#7f8c8d', icon: '🕯️' },
  { label: 'Hochzeit',     value: 'hochzeit',     color: '#e84393', icon: '💍' },
  { label: 'Sitzung',      value: 'sitzung',      color: '#8e44ad', icon: '👥' },
  { label: 'Pastoral',     value: 'pastoral',     color: '#27ae60', icon: '🌿' },
  { label: 'Persönlich',   value: 'persoenlich',  color: '#e67e22', icon: '🗓️' },
  { label: 'Feiertag',     value: 'feiertag',     color: '#c0392b', icon: '🎉' },
];

const EMPTY_FORM: EventFormData = {
  title: '',
  start: '',
  end: '',
  startTime: '09:00',
  endTime: '10:00',
  color: '#2c3e50',
  category: 'gottesdienst',
  description: '',
  location: '',
  allDay: true,
};

// ─── Helper ───────────────────────────────────────────────────────────────────
const toDateStr = (d: Date) => d.toISOString().slice(0, 10);
const today = () => toDateStr(new Date());

const getCategoryMeta = (value: string) =>
  CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[0];

// ─── Component ────────────────────────────────────────────────────────────────
export default function KalenderPage() {
  const { user } = useAuth();
  const calendarRef = useRef<InstanceType<typeof FullCalendar>>(null);

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<ViewMode>('dayGridMonth');
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<EventFormData>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTitle, setCurrentTitle] = useState('');

  // ─── Firestore Sync ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'events'),
      orderBy('start', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setEvents(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CalendarEvent, 'id'>) }))
      );
    });
    return () => unsub();
  }, [user]);

  // ─── Calendar API helpers ────────────────────────────────────────────────
  const goToday  = () => calendarRef.current?.getApi().today();
  const goPrev   = () => calendarRef.current?.getApi().prev();
  const goNext   = () => calendarRef.current?.getApi().next();
  const changeView = (v: ViewMode) => {
    setView(v);
    calendarRef.current?.getApi().changeView(v);
  };

  const updateTitle = useCallback(() => {
    const api = calendarRef.current?.getApi();
    if (api) setCurrentTitle(api.getCurrentData().viewTitle);
  }, []);

  // ─── Open Modal helpers ──────────────────────────────────────────────────
  const openCreate = useCallback((dateStr?: string) => {
    const d = dateStr ?? today();
    setEditingId(null);
    setModalMode('create');
    setFormData({ ...EMPTY_FORM, start: d, end: d });
    setError(null);
    setIsModalOpen(true);
  }, []);

  const openEdit = useCallback((ev: CalendarEvent) => {
    setEditingId(ev.id);
    setModalMode('edit');
    const startDate = ev.start.slice(0, 10);
    const startTime = ev.start.length > 10 ? ev.start.slice(11, 16) : '09:00';
    const endDate   = ev.end ? ev.end.slice(0, 10) : startDate;
    const endTime   = ev.end && ev.end.length > 10 ? ev.end.slice(11, 16) : '10:00';
    setFormData({
      title:       ev.title,
      start:       startDate,
      end:         endDate,
      startTime,
      endTime,
      color:       ev.color ?? '#2c3e50',
      category:    ev.category ?? 'gottesdienst',
      description: ev.description ?? '',
      location:    ev.location ?? '',
      allDay:      ev.allDay ?? true,
    });
    setError(null);
    setIsModalOpen(true);
  }, []);

  const handleDateClick = useCallback((arg: DateClickArg) => openCreate(arg.dateStr), [openCreate]);

  const handleEventClick = useCallback(
    (arg: EventClickArg) => {
      const ev = events.find((e) => e.id === arg.event.id);
      if (ev) openEdit(ev);
    },
    [events, openEdit]
  );

  // ─── Drag & Drop ─────────────────────────────────────────────────────────
  const handleEventDrop = useCallback(
    async (arg: EventDropArg) => {
      if (!user) return;
      const ev = events.find((e) => e.id === arg.event.id);
      if (!ev) return;
      const newStart = arg.event.startStr;
      const newEnd   = arg.event.endStr || null;
      try {
        await updateDoc(doc(db, 'users', user.uid, 'events', ev.id), {
          start: newStart,
          end: newEnd,
        });
      } catch {
        arg.revert();
      }
    },
    [user, events]
  );

  // ─── Form Helpers ────────────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((p) => ({ ...p, [name]: val }));
    if (name === 'category') {
      const cat = getCategoryMeta(value);
      setFormData((p) => ({ ...p, [name]: value, color: cat.color }));
    }
  };

  // ─── Save ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user) return;
    if (!formData.title.trim()) return setError('Bitte einen Titel eingeben.');
    if (!formData.start)        return setError('Bitte ein Startdatum wählen.');
    setIsLoading(true); setError(null);
    try {
      const startStr = formData.allDay
        ? formData.start
        : `${formData.start}T${formData.startTime}`;
      const endStr = formData.end && formData.end !== formData.start
        ? (formData.allDay ? formData.end : `${formData.end}T${formData.endTime}`)
        : null;

      const payload = {
        title:       formData.title.trim(),
        start:       startStr,
        end:         endStr,
        color:       formData.color,
        category:    formData.category,
        description: formData.description.trim(),
        location:    formData.location.trim(),
        allDay:      formData.allDay,
      };

      if (editingId) {
        await updateDoc(doc(db, 'users', user.uid, 'events', editingId), payload);
      } else {
        await addDoc(collection(db, 'users', user.uid, 'events'), payload);
      }
      setIsModalOpen(false);
      setFormData(EMPTY_FORM);
      setEditingId(null);
    } catch {
      setError('Fehler beim Speichern.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Delete ──────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!user || !editingId || !confirm('Diesen Termin wirklich löschen?')) return;
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'events', editingId));
      setIsModalOpen(false);
      setEditingId(null);
    } catch {
      setError('Fehler beim Löschen.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Derived / Filtered ──────────────────────────────────────────────────
  const filteredEvents = events.filter((ev) => {
    const matchCat = filterCategory === 'all' || ev.category === filterCategory;
    const matchSearch =
      !searchQuery ||
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.description ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.location ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const upcomingEvents = events
    .filter((ev) => ev.start >= today())
    .slice(0, 8);

  const calendarEvents: EventInput[] = filteredEvents.map((e) => ({
    id:              e.id,
    title:           e.title,
    start:           e.start,
    ...(e.end ? { end: e.end } : {}),
    backgroundColor: e.color,
    borderColor:     e.color,
    allDay:          e.allDay ?? true,
  }));

  const eventCountByCategory = CATEGORIES.map((cat) => ({
    ...cat,
    count: events.filter((e) => e.category === cat.value).length,
  }));

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      {/* ── Top Toolbar ── */}
      <div style={s.topBar}>
        <div style={s.topBarLeft}>
          <button style={s.todayBtn} onClick={goToday}>Heute</button>
          <div style={s.navGroup}>
            <button style={s.navBtn} onClick={goPrev}>‹</button>
            <button style={s.navBtn} onClick={goNext}>›</button>
          </div>
          <h2 style={s.currentTitle}>{currentTitle}</h2>
        </div>

        <div style={s.topBarCenter}>
          <div style={s.searchWrapper}>
            <span style={s.searchIcon}>🔍</span>
            <input
              style={s.searchInput}
              placeholder="Termine suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button style={s.searchClear} onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>
        </div>

        <div style={s.topBarRight}>
          <div style={s.viewToggle}>
            {(['dayGridMonth', 'dayGridWeek', 'dayGridDay'] as ViewMode[]).map((v) => (
              <button
                key={v}
                style={view === v ? { ...s.viewBtn, ...s.viewBtnActive } : s.viewBtn}
                onClick={() => changeView(v)}
              >
                {v === 'dayGridMonth' ? 'Monat' : v === 'dayGridWeek' ? 'Woche' : 'Tag'}
              </button>
            ))}
          </div>
          <button style={s.newEventBtn} onClick={() => openCreate()}>
            + Neuer Termin
          </button>
          <button
            style={s.sidebarToggle}
            onClick={() => setSidebarOpen((p) => !p)}
            title={sidebarOpen ? 'Sidebar schließen' : 'Sidebar öffnen'}
          >
            {sidebarOpen ? '⊟' : '⊞'}
          </button>
        </div>
      </div>

      {/* ── Category Filter Strip ── */}
      <div style={s.filterStrip}>
        <button
          style={filterCategory === 'all' ? { ...s.filterChip, ...s.filterChipActive } : s.filterChip}
          onClick={() => setFilterCategory('all')}
        >
          Alle ({events.length})
        </button>
        {CATEGORIES.filter((c) => events.some((e) => e.category === c.value)).map((cat) => (
          <button
            key={cat.value}
            style={
              filterCategory === cat.value
                ? { ...s.filterChip, ...s.filterChipActive, borderColor: cat.color, color: cat.color }
                : s.filterChip
            }
            onClick={() => setFilterCategory(filterCategory === cat.value ? 'all' : cat.value)}
          >
            {cat.icon} {cat.label} ({events.filter((e) => e.category === cat.value).length})
          </button>
        ))}
      </div>

      {/* ── Main Layout ── */}
      <div style={s.mainLayout}>
        {/* ── Sidebar ── */}
        {sidebarOpen && (
          <aside style={s.sidebar}>
            {/* Mini upcoming */}
            <div style={s.sideSection}>
              <h3 style={s.sideSectionTitle}>Nächste Termine</h3>
              {upcomingEvents.length === 0 && (
                <p style={s.sideEmpty}>Keine kommenden Termine.</p>
              )}
              {upcomingEvents.map((ev) => {
                const cat = getCategoryMeta(ev.category);
                return (
                  <div
                    key={ev.id}
                    style={{ ...s.upcomingItem, borderLeftColor: ev.color }}
                    onClick={() => openEdit(ev)}
                  >
                    <span style={s.upcomingIcon}>{cat.icon}</span>
                    <div style={s.upcomingInfo}>
                      <div style={s.upcomingTitle}>{ev.title}</div>
                      <div style={s.upcomingDate}>
                        {new Date(ev.start).toLocaleDateString('de-DE', {
                          weekday: 'short', day: 'numeric', month: 'short',
                        })}
                        {ev.location && ` · ${ev.location}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <div style={s.sideSection}>
              <h3 style={s.sideSectionTitle}>Übersicht</h3>
              <div style={s.statsGrid}>
                <div style={s.statBox}>
                  <div style={s.statNum}>{events.length}</div>
                  <div style={s.statLabel}>Gesamt</div>
                </div>
                <div style={s.statBox}>
                  <div style={s.statNum}>{upcomingEvents.length}</div>
                  <div style={s.statLabel}>Demnächst</div>
                </div>
              </div>
              <div style={{ marginTop: '12px' }}>
                {eventCountByCategory.filter((c) => c.count > 0).map((cat) => (
                  <div key={cat.value} style={s.categoryBar}>
                    <span style={s.catBarIcon}>{cat.icon}</span>
                    <span style={s.catBarLabel}>{cat.label}</span>
                    <div style={s.catBarTrack}>
                      <div
                        style={{
                          ...s.catBarFill,
                          width: `${(cat.count / events.length) * 100}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                    <span style={s.catBarCount}>{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Create */}
            <div style={s.sideSection}>
              <h3 style={s.sideSectionTitle}>Schnell erstellen</h3>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  style={{ ...s.quickBtn, borderColor: cat.color + '55' }}
                  onClick={() => {
                    setFormData({ ...EMPTY_FORM, start: today(), end: today(), category: cat.value, color: cat.color });
                    setEditingId(null);
                    setModalMode('create');
                    setError(null);
                    setIsModalOpen(true);
                  }}
                >
                  <span>{cat.icon}</span>
                  <span style={{ color: cat.color }}>{cat.label}</span>
                </button>
              ))}
            </div>
          </aside>
        )}

        {/* ── Calendar ── */}
        <div style={s.calendarArea}>
          {searchQuery && filteredEvents.length === 0 && (
            <div style={s.noResults}>Keine Termine für „{searchQuery}" gefunden.</div>
          )}
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView={view}
            locale="de"
            headerToolbar={false}
            events={calendarEvents}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            editable={true}
            droppable={true}
            height="auto"
            dayMaxEvents={4}
            datesSet={updateTitle}
            eventDidMount={(info) => {
              // Tooltip on hover
              info.el.title = [
                info.event.title,
                info.event.extendedProps?.location,
                info.event.extendedProps?.description,
              ].filter(Boolean).join(' · ');
            }}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════
          MODAL
      ══════════════════════════════════════ */}
      {isModalOpen && (
        <div style={s.overlay} onClick={() => setIsModalOpen(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>
                {modalMode === 'create' ? '✨ Neuer Termin' : '✏️ Termin bearbeiten'}
              </h2>
              <button style={s.modalClose} onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            {error && <div style={s.errorBanner}>{error}</div>}

            {/* Category Pills */}
            <div style={s.modalSection}>
              <label style={s.modalLabel}>Kategorie</label>
              <div style={s.categoryPills}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setFormData((p) => ({ ...p, category: cat.value, color: cat.color }))}
                    style={
                      formData.category === cat.value
                        ? { ...s.categoryPill, backgroundColor: cat.color, color: 'white', borderColor: cat.color }
                        : { ...s.categoryPill, borderColor: cat.color + '88', color: cat.color }
                    }
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div style={s.modalSection}>
              <label style={s.modalLabel}>Titel *</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="z. B. Pfarrmesse, Trauergespräch..."
                style={s.modalInput}
                autoFocus
              />
            </div>

            {/* Date + Time Row */}
            <div style={s.modalSection}>
              <div style={s.allDayRow}>
                <label style={s.modalLabel}>Datum & Zeit</label>
                <label style={s.checkLabel}>
                  <input
                    type="checkbox"
                    name="allDay"
                    checked={formData.allDay}
                    onChange={handleChange}
                    style={{ marginRight: '6px' }}
                  />
                  Ganztägig
                </label>
              </div>
              <div style={s.dateTimeGrid}>
                <div>
                  <div style={s.subLabel}>Von</div>
                  <input name="start" type="date" value={formData.start} onChange={handleChange} style={s.modalInput} />
                </div>
                {!formData.allDay && (
                  <div>
                    <div style={s.subLabel}>Uhrzeit</div>
                    <input name="startTime" type="time" value={formData.startTime} onChange={handleChange} style={s.modalInput} />
                  </div>
                )}
                <div>
                  <div style={s.subLabel}>Bis</div>
                  <input name="end" type="date" value={formData.end} onChange={handleChange} style={s.modalInput} />
                </div>
                {!formData.allDay && (
                  <div>
                    <div style={s.subLabel}>Uhrzeit</div>
                    <input name="endTime" type="time" value={formData.endTime} onChange={handleChange} style={s.modalInput} />
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div style={s.modalSection}>
              <label style={s.modalLabel}>📍 Ort</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="z. B. Pfarrkirche St. Maria"
                style={s.modalInput}
              />
            </div>

            {/* Description */}
            <div style={s.modalSection}>
              <label style={s.modalLabel}>📝 Beschreibung</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Notizen, Hinweise, Ablauf..."
                style={{ ...s.modalInput, height: '90px', resize: 'vertical' }}
              />
            </div>

            {/* Color picker */}
            <div style={s.modalSection}>
              <label style={s.modalLabel}>🎨 Farbe</label>
              <div style={s.colorRow}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    title={cat.label}
                    onClick={() => setFormData((p) => ({ ...p, color: cat.color }))}
                    style={{
                      ...s.colorSwatch,
                      backgroundColor: cat.color,
                      outline: formData.color === cat.color ? '3px solid #1a1a1a' : 'none',
                      outlineOffset: '2px',
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData((p) => ({ ...p, color: e.target.value }))}
                  style={s.colorPickerInput}
                  title="Benutzerdefinierte Farbe"
                />
              </div>
            </div>

            {/* Preview strip */}
            <div style={{ ...s.previewStrip, backgroundColor: formData.color }}>
              <span style={s.previewCatIcon}>{getCategoryMeta(formData.category).icon}</span>
              <span style={s.previewTitle}>{formData.title || 'Vorschau Titel'}</span>
              {formData.location && <span style={s.previewLocation}>· {formData.location}</span>}
            </div>

            {/* Actions */}
            <div style={s.modalActions}>
              {editingId && (
                <button onClick={handleDelete} disabled={isLoading} style={s.deleteBtn}>
                  🗑 Löschen
                </button>
              )}
              <button onClick={() => setIsModalOpen(false)} style={s.cancelBtn}>Abbrechen</button>
              <button onClick={handleSave} disabled={isLoading} style={s.saveBtn}>
                {isLoading ? 'Speichert...' : editingId ? '✓ Aktualisieren' : '✓ Erstellen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Global Styles for FullCalendar theming ── */}
      <style>{`
        .fc {
          font-family: 'Georgia', serif;
        }
        .fc-daygrid-day:hover {
          background: #f0f4ff !important;
          cursor: pointer;
          transition: background 0.15s;
        }
        .fc-daygrid-day-number {
          font-size: 0.85rem;
          padding: 6px 8px;
          font-weight: 500;
          color: #333;
        }
        .fc-daygrid-day.fc-day-today {
          background: #fef9f0 !important;
        }
        .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
          background: #2c3e50;
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
        }
        .fc-col-header-cell-cushion {
          font-size: 0.78rem;
          font-weight: 600;
          color: #7f8c8d;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 10px 0;
          text-decoration: none !important;
        }
        .fc-event {
          border-radius: 4px !important;
          border: none !important;
          padding: 2px 6px !important;
          font-size: 0.78rem !important;
          font-weight: 500 !important;
          cursor: pointer !important;
          transition: opacity 0.15s, transform 0.1s !important;
        }
        .fc-event:hover {
          opacity: 0.88 !important;
          transform: translateY(-1px) !important;
        }
        .fc-daygrid-more-link {
          font-size: 0.72rem;
          font-weight: 600;
          color: #555;
          padding: 2px 6px;
        }
        .fc-theme-standard td, .fc-theme-standard th {
          border-color: #eef0f3 !important;
        }
        .fc-scrollgrid {
          border-color: #eef0f3 !important;
        }
      `}</style>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s: { [key: string]: React.CSSProperties } = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#f7f8fc',
    fontFamily: 'Georgia, serif',
    overflow: 'hidden',
  },

  // Top Bar
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
    backgroundColor: 'white',
    borderBottom: '1px solid #eef0f3',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    flexShrink: 0,
    gap: '12px',
    flexWrap: 'wrap',
  },
  topBarLeft: { display: 'flex', alignItems: 'center', gap: '10px', flex: '0 0 auto' },
  topBarCenter: { flex: 1, minWidth: '180px', maxWidth: '380px' },
  topBarRight: { display: 'flex', alignItems: 'center', gap: '8px', flex: '0 0 auto' },

  currentTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#2c3e50', margin: 0, minWidth: '160px' },

  todayBtn: {
    padding: '7px 14px', backgroundColor: '#2c3e50', color: 'white',
    border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
    fontFamily: 'Georgia, serif',
  },
  navGroup: { display: 'flex', gap: '2px' },
  navBtn: {
    width: '30px', height: '30px', border: '1px solid #dde', borderRadius: '6px',
    backgroundColor: 'white', cursor: 'pointer', fontSize: '1.1rem', display: 'flex',
    alignItems: 'center', justifyContent: 'center', color: '#555', lineHeight: 1,
  },

  searchWrapper: {
    display: 'flex', alignItems: 'center', backgroundColor: '#f3f5f9',
    borderRadius: '8px', padding: '0 12px', border: '1px solid #e8eaf0', gap: '8px',
  },
  searchIcon: { fontSize: '0.85rem', opacity: 0.5 },
  searchInput: {
    border: 'none', background: 'transparent', outline: 'none', padding: '8px 0',
    fontSize: '0.9rem', fontFamily: 'Georgia, serif', width: '100%', color: '#333',
  },
  searchClear: {
    background: 'none', border: 'none', cursor: 'pointer', color: '#999',
    fontSize: '0.85rem', padding: '2px 4px',
  },

  viewToggle: {
    display: 'flex', border: '1px solid #dde', borderRadius: '8px', overflow: 'hidden',
  },
  viewBtn: {
    padding: '7px 12px', border: 'none', borderRight: '1px solid #dde', backgroundColor: 'white',
    cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, color: '#555', fontFamily: 'Georgia, serif',
  },
  viewBtnActive: { backgroundColor: '#2c3e50', color: 'white' },

  newEventBtn: {
    padding: '8px 16px', backgroundColor: '#80397B', color: 'white', border: 'none',
    borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
    letterSpacing: '0.02em', fontFamily: 'Georgia, serif',
  },
  sidebarToggle: {
    width: '34px', height: '34px', border: '1px solid #dde', borderRadius: '7px',
    backgroundColor: 'white', cursor: 'pointer', fontSize: '1rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555',
  },

  // Filter Strip
  filterStrip: {
    display: 'flex', gap: '8px', padding: '10px 20px', backgroundColor: 'white',
    borderBottom: '1px solid #eef0f3', flexShrink: 0, overflowX: 'auto',
    scrollbarWidth: 'none',
  },
  filterChip: {
    padding: '5px 12px', borderRadius: '20px', border: '1px solid #dde',
    backgroundColor: 'white', cursor: 'pointer', fontSize: '0.8rem',
    fontWeight: 500, color: '#555', whiteSpace: 'nowrap', fontFamily: 'Georgia, serif',
    transition: 'all 0.15s',
  },
  filterChipActive: { backgroundColor: '#f0f4ff', fontWeight: 700 },

  // Main layout
  mainLayout: { display: 'flex', flex: 1, overflow: 'hidden' },

  // Sidebar
  sidebar: {
    width: '260px', minWidth: '260px', backgroundColor: 'white',
    borderRight: '1px solid #eef0f3', overflowY: 'auto', flexShrink: 0,
    display: 'flex', flexDirection: 'column', gap: '0',
  },
  sideSection: {
    padding: '18px 16px', borderBottom: '1px solid #f0f2f7',
  },
  sideSectionTitle: {
    fontSize: '0.72rem', fontWeight: 700, color: '#7f8c8d', textTransform: 'uppercase',
    letterSpacing: '0.07em', margin: '0 0 12px 0',
  },
  sideEmpty: { fontSize: '0.85rem', color: '#aaa', margin: '4px 0' },

  upcomingItem: {
    display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 10px',
    borderRadius: '8px', cursor: 'pointer', marginBottom: '6px',
    borderLeft: '3px solid #ccc', backgroundColor: '#fafbfd',
    transition: 'background 0.15s',
  },
  upcomingIcon: { fontSize: '1rem', flexShrink: 0, marginTop: '1px' },
  upcomingInfo: { flex: 1, minWidth: 0 },
  upcomingTitle: { fontSize: '0.85rem', fontWeight: 600, color: '#2c3e50', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  upcomingDate:  { fontSize: '0.75rem', color: '#888', marginTop: '2px' },

  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  statBox: {
    backgroundColor: '#f7f8fc', borderRadius: '10px', padding: '12px',
    textAlign: 'center', border: '1px solid #eef0f3',
  },
  statNum: { fontSize: '1.8rem', fontWeight: 700, color: '#2c3e50' },
  statLabel: { fontSize: '0.72rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' },

  categoryBar: {
    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px',
  },
  catBarIcon: { fontSize: '0.85rem', width: '18px', textAlign: 'center' },
  catBarLabel: { fontSize: '0.78rem', color: '#555', width: '68px', flexShrink: 0 },
  catBarTrack: { flex: 1, height: '5px', backgroundColor: '#eee', borderRadius: '3px', overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: '3px', transition: 'width 0.4s' },
  catBarCount: { fontSize: '0.75rem', color: '#888', width: '18px', textAlign: 'right' },

  quickBtn: {
    display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
    padding: '8px 12px', backgroundColor: 'white', border: '1px solid',
    borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
    marginBottom: '6px', fontFamily: 'Georgia, serif', transition: 'background 0.15s',
  },

  // Calendar Area
  calendarArea: {
    flex: 1, overflowY: 'auto', padding: '16px 20px', minWidth: 0,
  },
  noResults: {
    textAlign: 'center', padding: '20px', color: '#888',
    backgroundColor: '#f7f8fc', borderRadius: '10px', marginBottom: '16px',
    fontSize: '0.9rem',
  },

  // Modal
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(10,12,20,0.5)',
    zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(3px)',
  },
  modal: {
    backgroundColor: 'white', borderRadius: '16px', padding: '28px',
    width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
    fontFamily: 'Georgia, serif',
  },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  modalTitle: { fontSize: '1.25rem', fontWeight: 700, color: '#2c3e50', margin: 0 },
  modalClose: {
    background: '#f3f5f9', border: 'none', borderRadius: '50%',
    width: '32px', height: '32px', cursor: 'pointer', fontSize: '0.9rem', color: '#555',
  },
  modalSection: { marginBottom: '18px' },
  modalLabel: { display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#555', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  subLabel: { fontSize: '0.75rem', color: '#888', marginBottom: '5px', fontWeight: 600 },
  modalInput: {
    width: '100%', padding: '10px 14px', borderRadius: '9px', border: '1px solid #dde',
    fontSize: '0.95rem', boxSizing: 'border-box', fontFamily: 'Georgia, serif',
    backgroundColor: '#fafbfd', color: '#2c3e50', outline: 'none',
  },

  allDayRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  checkLabel: { fontSize: '0.82rem', display: 'flex', alignItems: 'center', color: '#555', cursor: 'pointer' },
  dateTimeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },

  categoryPills: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  categoryPill: {
    padding: '5px 12px', borderRadius: '20px', border: '1.5px solid',
    backgroundColor: 'transparent', cursor: 'pointer', fontSize: '0.82rem',
    fontWeight: 600, fontFamily: 'Georgia, serif', transition: 'all 0.15s',
  },

  colorRow: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
  colorSwatch: {
    width: '26px', height: '26px', borderRadius: '50%', border: 'none',
    cursor: 'pointer', transition: 'outline 0.1s, transform 0.1s', flexShrink: 0,
  },
  colorPickerInput: {
    width: '34px', height: '34px', borderRadius: '8px', border: '1px solid #dde',
    cursor: 'pointer', padding: '2px', backgroundColor: 'white',
  },

  previewStrip: {
    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px',
    borderRadius: '9px', marginBottom: '18px', color: 'white',
  },
  previewCatIcon: { fontSize: '1.1rem' },
  previewTitle: { fontWeight: 700, fontSize: '0.95rem', flex: 1 },
  previewLocation: { fontSize: '0.8rem', opacity: 0.85 },

  errorBanner: {
    backgroundColor: '#fff5f5', border: '1px solid #fcc', color: '#c0392b',
    padding: '10px 14px', borderRadius: '9px', fontSize: '0.88rem', marginBottom: '16px',
  },

  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center', paddingTop: '4px' },
  saveBtn: {
    padding: '10px 22px', backgroundColor: '#27ae60', color: 'white', border: 'none',
    borderRadius: '9px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'Georgia, serif',
  },
  cancelBtn: {
    padding: '10px 18px', backgroundColor: '#f0f2f5', color: '#2c3e50',
    border: '1px solid #dde', borderRadius: '9px', cursor: 'pointer', fontWeight: 600,
    fontSize: '0.9rem', fontFamily: 'Georgia, serif',
  },
  deleteBtn: {
    padding: '10px 16px', backgroundColor: '#e74c3c', color: 'white', border: 'none',
    borderRadius: '9px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
    marginRight: 'auto', fontFamily: 'Georgia, serif',
  },
};