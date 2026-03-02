'use client';
import React, { useState, useRef, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { EventClickArg, EventDropArg, EventInput } from '@fullcalendar/core';
import { useCalendars } from './hooks/useCalendar';
import { useEvents } from './hooks/useEvents';
import { ViewMode } from './utils/types';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { EventModal } from './components/EventModal';
import { CalendarModal } from './components/CalendarModal';
import { updateEvent } from './utils/firebase';
import { useAuth } from '../AuthContext';

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

export default function KalenderPage() {
  const { user } = useAuth();
  const calRef = useRef<FullCalendar>(null);

  const {
    calendars, visibleCals, calModalOpen, calForm, editingCalendar,
    isLoading: isCalLoading, COLORS, setCalModalOpen, openCalModal,
    handleSaveCal, handleDeleteCal, toggleCalVis, setCalForm
  } = useCalendars();

  const {
    events, eventModalOpen, eventForm, editingEventId, formError,
    isLoading: isEventLoading, setEventModalOpen, openCreate, openEdit,
    handleFormChange, handleSaveEvent, handleDeleteEvent
  } = useEvents(calendars);

  const [view, setView] = useState<ViewMode>('timeGridWeek');
  const [currentTitle, setCurrentTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const updateTitle = useCallback(() => {
    if (calRef.current) {
      setCurrentTitle(calRef.current.getApi().getCurrentData().viewTitle);
    }
  }, []);

  const goToday = () => calRef.current?.getApi().today();
  const goPrev = () => calRef.current?.getApi().prev();
  const goNext = () => calRef.current?.getApi().next();
  const changeView = (v: ViewMode) => {
    setView(v);
    calRef.current?.getApi().changeView(v);
  };

  const handleDateClick = useCallback((arg: DateClickArg) => openCreate(arg.dateStr), [openCreate]);
  const handleEventClick = useCallback((arg: EventClickArg) => {
    const ev = events.find(e => e.id === arg.event.id);
    if (ev) openEdit(ev);
  }, [events, openEdit]);

  const handleEventDrop = useCallback(async (arg: EventDropArg) => {
    if (!user) return;
    try {
      await updateEvent(user.uid, arg.event.id, { start: arg.event.startStr, end: arg.event.endStr || null });
    } catch {
      arg.revert();
    }
  }, [user]);

  const filteredEvents = useMemo(() => events.filter(ev =>
    visibleCals[ev.calendarId] &&
    (!searchQuery || [ev.title, ev.description ?? '', ev.location ?? ''].some(f => f.toLowerCase().includes(searchQuery.toLowerCase())))
  ), [events, visibleCals, searchQuery]);

  const upcomingEvents = useMemo(() => filteredEvents
    .filter(ev => ev.start >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 8), [filteredEvents]);

  const calendarEvents: EventInput[] = useMemo(() => filteredEvents.map(e => ({
    id: e.id, title: e.title, start: e.start, end: e.end,
    backgroundColor: e.color, borderColor: e.color, allDay: e.allDay ?? true,
    extendedProps: { location: e.location, description: e.description },
  })), [filteredEvents]);

  return (
    <div style={s.page}>
      <Toolbar
        s={s}
        view={view}
        currentTitle={currentTitle}
        searchQuery={searchQuery}
        sidebarOpen={sidebarOpen}
        goToday={goToday}
        goPrev={goPrev}
        goNext={goNext}
        changeView={changeView}
        setSearchQuery={setSearchQuery}
        openCreate={openCreate}
        setSidebarOpen={setSidebarOpen}
      />

      <div style={s.body}>
        {sidebarOpen && (
          <Sidebar
            s={s}
            calendars={calendars}
            visibleCals={visibleCals}
            upcomingEvents={upcomingEvents}
            openCalModal={openCalModal}
            toggleCalVis={toggleCalVis}
            openEdit={openEdit}
          />
        )}

        <div style={s.calArea}>
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

      {eventModalOpen && (
        <EventModal
          s={s}
          eventForm={eventForm}
          calendars={calendars}
          editingEventId={editingEventId}
          formError={formError}
          isLoading={isEventLoading}
          handleFormChange={handleFormChange}
          handleSaveEvent={handleSaveEvent}
          handleDeleteEvent={handleDeleteEvent}
          setEventModalOpen={setEventModalOpen}
        />
      )}

      {calModalOpen && (
        <CalendarModal
          s={s}
          calForm={calForm}
          editingCalendar={editingCalendar}
          isLoading={isCalLoading}
          COLORS={COLORS}
          handleSaveCal={handleSaveCal}
          handleDeleteCal={handleDeleteCal}
          setCalModalOpen={setCalModalOpen}
          setCalForm={setCalForm}
        />
      )}
    </div>
  );
}
