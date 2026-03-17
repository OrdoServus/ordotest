import { db } from '../../firebase/config';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, writeBatch, where, getDocs } from 'firebase/firestore';
import { Calendar, CalEvent } from './types';

const DEFAULT_CALS: Omit<Calendar, 'id'>[] = [
  { name: 'Pfarrkalender', color: '#8e44ad', visible: true },
  { name: 'Privat',        color: '#e67e22', visible: true },
  { name: 'Beerdigungen',  color: '#7f8c8d', visible: true },
];

export const subscribeToEvents = (userId: string, callback: (events: CalEvent[]) => void) => {
  const q = query(collection(db, 'users', userId, 'events'), orderBy('start', 'asc'));
  return onSnapshot(q, snap => {
    const events = snap.docs.map(d => ({ id: d.id, ...d.data() } as CalEvent));
    callback(events);
  });
};

export const subscribeToCalendars = (userId: string, callback: (calendars: Calendar[]) => void) => {
  const q = query(collection(db, 'users', userId, 'calendars'));
  return onSnapshot(q, async snap => {
    if (snap.empty) {
      const batch = writeBatch(db);
      const createdCals = DEFAULT_CALS.map(cal => {
        const ref = doc(collection(db, 'users', userId, 'calendars'));
        batch.set(ref, cal);
        return { id: ref.id, ...cal };
      });
      await batch.commit();
      callback(createdCals);
    } else {
      const calendars = snap.docs.map(d => ({ id: d.id, ...d.data() } as Calendar));
      callback(calendars);
    }
  });
};

export const addEvent = (userId: string, event: Omit<CalEvent, 'id'>) => {
  return addDoc(collection(db, 'users', userId, 'events'), event);
};

export const updateEvent = (userId: string, eventId: string, event: Partial<CalEvent>) => {
  return updateDoc(doc(db, 'users', userId, 'events', eventId), event);
};

export const deleteEvent = (userId: string, eventId: string) => {
  return deleteDoc(doc(db, 'users', userId, 'events', eventId));
};

export const addCalendar = (userId: string, calendar: Omit<Calendar, 'id'>) => {
  return addDoc(collection(db, 'users', userId, 'calendars'), calendar);
};

export const updateCalendar = (userId: string, calendarId: string, calendar: Partial<Calendar>) => {
  return updateDoc(doc(db, 'users', userId, 'calendars', calendarId), calendar);
};

export const deleteCalendar = async (userId: string, calendarId: string) => {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'users', userId, 'calendars', calendarId));
  const evSnap = await getDocs(query(collection(db, 'users', userId, 'events'), where('calendarId', '==', calendarId)));
  evSnap.forEach(d => batch.delete(d.ref));
  return batch.commit();
};