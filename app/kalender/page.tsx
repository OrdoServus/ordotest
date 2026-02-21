'use client';
import React, { useEffect, useRef, useState } from 'react';
import { createCalendar, destroyCalendar } from '@event-calendar/core';
import DayGrid from '@event-calendar/day-grid';
import Interaction from '@event-calendar/interaction';
import '@event-calendar/core/index.css';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../AuthContext';

interface CalendarInstance {
  destroy: () => void;
  setOption: (name: string, value: any) => void;
  [key: string]: any;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  extendedProps?: {
    description?: string;
  };
}

export default function KalenderPage() {
  const calendarRef = useRef<HTMLDivElement>(null);
  const ecRef = useRef<CalendarInstance | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const { user, loading } = useAuth();

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<CalendarEvent> | null>(null);

  useEffect(() => {
    if (loading || !user) return;

    const eventsQuery = query(collection(db, 'users', user.uid, 'events'));
    const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as CalendarEvent[];
      setEvents(eventsData);
    });

    return () => unsubscribe();
  }, [user, loading]);

  useEffect(() => {
    if (!calendarRef.current || !user) return;

    if (ecRef.current) {
      ecRef.current.setOption('events', events);
      return;
    }

    ecRef.current = createCalendar(
      calendarRef.current, 
      {
        plugins: [DayGrid, Interaction],
        view: 'dayGridMonth',
        events: events,
        locale: 'de',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek,dayGridDay'
        },
        buttonText: {
          today: 'Heute',
          month: 'Monat',
          week: 'Woche',
          day: 'Tag',
        },
        eventClick: (info) => {
          setSelectedEvent(info.event as CalendarEvent);
          setIsViewModalOpen(true);
        },
        dateClick: (info) => {
          setEditingEvent({ start: info.dateStr, allDay: true, title: '', extendedProps: { description: '' } });
          setIsEditModalOpen(true);
        }
      }
    ) as CalendarInstance;

    return () => {
      if (ecRef.current) {
        destroyCalendar(ecRef.current);
        ecRef.current = null;
      }
    };
  }, [events, user]);

  const handleSaveEvent = async () => {
    if (!user || !editingEvent) return;

    const eventData = {
      title: editingEvent.title,
      start: editingEvent.start,
      end: editingEvent.end,
      allDay: editingEvent.allDay,
      description: editingEvent.extendedProps?.description || '',
    };

    try {
      if (editingEvent.id) {
        const eventRef = doc(db, 'users', user.uid, 'events', editingEvent.id);
        await updateDoc(eventRef, eventData);
      } else {
        await addDoc(collection(db, 'users', user.uid, 'events'), {
          ...eventData,
          createdAt: serverTimestamp()
        });
      }
      setIsEditModalOpen(false);
      setEditingEvent(null);
    } catch (error) {
      console.error("Error saving event: ", error);
    }
  };

  const handleDeleteEvent = async () => {
    if (!user || !selectedEvent?.id || !confirm("Möchten Sie diesen Termin wirklich löschen?")) return;

    try {
      const eventRef = doc(db, 'users', user.uid, 'events', selectedEvent.id);
      await deleteDoc(eventRef);
      setIsViewModalOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error deleting event: ", error);
    }
  };

  if (loading) {
    return <div style={styles.centered}>Lade Kalender...</div>;
  }

  if (!user) {
    return <div style={styles.centered}>Bitte melden Sie sich an, um den Kalender zu sehen.</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Mein Kalender</h1>
      <div ref={calendarRef} style={styles.calendar} />

      {isViewModalOpen && selectedEvent && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>{selectedEvent.title}</h2>
            <p><strong>Datum:</strong> {new Date(selectedEvent.start).toLocaleDateString('de-DE')}</p>
            {selectedEvent.extendedProps?.description && <p style={{marginTop: '10px'}}>{selectedEvent.extendedProps.description}</p>}
            <div style={styles.modalActions}>
              <button style={{...styles.button, ...styles.buttonSecondary}} onClick={() => setIsViewModalOpen(false)}>Schliessen</button>
              <button style={{...styles.button, ...styles.buttonWarning}} onClick={handleDeleteEvent}>Löschen</button>
              <button style={styles.button} onClick={() => { setIsViewModalOpen(false); setEditingEvent(selectedEvent); setIsEditModalOpen(true); }}>Bearbeiten</button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editingEvent && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>{editingEvent.id ? 'Termin bearbeiten' : 'Neuer Termin'}</h2>
            <input 
              type="text"
              placeholder="Titel des Termins"
              value={editingEvent.title || ''}
              onChange={e => setEditingEvent({...editingEvent, title: e.target.value})}
              style={styles.input}
            />
            <input 
              type="date" 
              value={editingEvent.start?.split('T')[0] || ''}
              onChange={e => setEditingEvent({...editingEvent, start: e.target.value})}
              style={styles.input}
            />
            <textarea 
              placeholder="Beschreibung (optional)"
              value={editingEvent.extendedProps?.description || ''}
              onChange={e => setEditingEvent({...editingEvent, extendedProps: { description: e.target.value }})}
              style={{...styles.input, height: '100px'}}
            />
            <div style={styles.modalActions}>
              <button style={{...styles.button, ...styles.buttonSecondary}} onClick={() => setIsEditModalOpen(false)}>Abbrechen</button>
              <button style={styles.button} onClick={handleSaveEvent}>Speichern</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: { padding: '20px', height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column' },
    centered: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
    title: { fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '20px' },
    calendar: { flex: 1, backgroundColor: 'white', borderRadius: '8px', padding: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { background: 'white', padding: '25px', borderRadius: '8px', width: '90%', maxWidth: '500px' },
    modalTitle: { fontSize: '1.5rem', marginBottom: '20px' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', marginBottom: '15px', boxSizing: 'border-box' },
    button: { padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '1rem', backgroundColor: '#ef5c22', color: 'white' },
    buttonSecondary: { background: '#eee', color: '#333' },
    buttonWarning: { background: '#e74c3c', color: 'white' }
};