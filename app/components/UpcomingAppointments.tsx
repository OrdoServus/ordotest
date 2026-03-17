'use client';
import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../AuthContext';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
}

export default function UpcomingAppointments() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD

    const eventsQuery = query(
      collection(db, 'users', user.uid, 'events'),
      where('start', '>=', today),
      orderBy('start', 'asc'),
      limit(3)
    );

    const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as CalendarEvent[];
      setEvents(eventsData);
      setLoading(false);
    }, (error) => {
      // Log handled by UI notification system
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Nächste Termine</h3>
      {loading ? (
        <p>Lade Termine...</p>
      ) : events.length > 0 ? (
        <ul style={styles.list}>
          {events.map(event => (
            <li key={event.id} style={styles.listItem}>
              <span style={styles.eventTitle}>{event.title}</span>
              <span style={styles.eventDate}>{formatDate(event.start)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>Keine bevorstehenden Termine.</p>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  title: {
    marginTop: 0,
    marginBottom: '15px',
    fontSize: '1.4rem',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #eee',
  },
  eventTitle: {
    fontWeight: 'bold',
  },
  eventDate: {
    color: '#555',
  },
};
