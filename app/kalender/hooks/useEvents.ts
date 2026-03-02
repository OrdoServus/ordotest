import { useState, useEffect, useCallback } from 'react';
import { CalEvent, EventForm } from '../utils/types';
import { addEvent, updateEvent, deleteEvent, subscribeToEvents } from '../utils/firebase';
import { useAuth } from '../../AuthContext';

const todayStr = () => new Date().toISOString().slice(0, 10);

const EMPTY_FORM = (calendars: any[]): EventForm => ({
  calendarId: calendars.find(c => c.visible)?.id ?? '',
  title: '', start: todayStr(), end: todayStr(),
  startTime: '09:00', endTime: '10:00',
  color: calendars.find(c => c.visible)?.color ?? '#2c3e50',
  category: 'termin', description: '', location: '', allDay: true,
});

export const useEvents = (calendars: any[]) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState<EventForm | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToEvents(user.uid, setEvents);
    return () => unsubscribe();
  }, [user]);

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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!eventForm) return;
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setEventForm(p => {
        const updated = { ...p!, [name]: val };
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
    if (!eventForm.start) return setFormError('Bitte ein Startdatum wählen.');
    if (!eventForm.calendarId) return setFormError('Bitte einen Kalender auswählen.');

    setIsLoading(true); setFormError(null);
    try {
      const payload: Omit<CalEvent, 'id'> = {
        ...eventForm,
        start: eventForm.allDay ? eventForm.start : `${eventForm.start}T${eventForm.startTime}`,
        end:   eventForm.end && eventForm.end !== eventForm.start
          ? (eventForm.allDay ? eventForm.end : `${eventForm.end}T${eventForm.endTime}`)
          : null,
      };
      if (editingEventId) {
        await updateEvent(user.uid, editingEventId, payload);
      } else {
        await addEvent(user.uid, payload);
      }
      setEventModalOpen(false); setEventForm(null); setEditingEventId(null);
    } catch { setFormError('Fehler beim Speichern.'); }
    finally { setIsLoading(false); }
  };

  const handleDeleteEvent = async () => {
    if (!user || !editingEventId || !confirm('Termin wirklich löschen?')) return;
    setIsLoading(true);
    try {
      await deleteEvent(user.uid, editingEventId);
      setEventModalOpen(false); setEditingEventId(null);
    } catch { setFormError('Fehler beim Löschen.'); }
    finally { setIsLoading(false); }
  };

  return {
    events,
    eventModalOpen,
    eventForm,
    editingEventId,
    formError,
    isLoading,
    setEventModalOpen,
    openCreate,
    openEdit,
    handleFormChange,
    handleSaveEvent,
    handleDeleteEvent,
  };
};