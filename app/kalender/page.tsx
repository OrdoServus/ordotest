"use client";

import React, { useEffect, useRef, useState } from 'react';

// In v5.x wird createCalendar statt EventCalendar verwendet  
import { createCalendar, destroyCalendar } from '@event-calendar/core';

// Die Plugins sind Default Exports  
import { DayGrid } from '@event-calendar/day-grid';
import { Interaction } from '@event-calendar/interaction';

import '@event-calendar/core/index.css';

// Firebase imports
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';

// Typ-Definition für die Kalender-Instanz  
interface CalendarInstance {
    destroy: () => void;
    [key: string]: any;
}

// Event interface
interface Event {
    id: string;
    title: string;
    start: string;
    end?: string;
    allDay?: boolean;
}

export default function KalenderPage() {
    const calendarRef = useRef<HTMLDivElement>(null);
    const ecRef = useRef<CalendarInstance | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated || !user) return;

        // Firestore query for user's events
        const eventsQuery = query(
            collection(db, 'events'),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
            const eventsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Event[];
            setEvents(eventsData);
        });

        return () => unsubscribe();
    }, [user, isAuthenticated]);

    useEffect(() => {
        // Erstelle den Kalender beim ersten Render   
        if (calendarRef.current && !ecRef.current) {
            ecRef.current = createCalendar(calendarRef.current, [DayGrid, Interaction], {
                view: 'dayGridMonth',
                events: events,
                eventClick: (info: any) => {
                    console.log('Event clicked:', info.event);
                },
                dateClick: (info: any) => {
                    console.log('Date clicked:', info.dateStr);
                }
            }) as CalendarInstance;
        }

        // Update events when they change
        if (ecRef.current) {
            ecRef.current.setOption('events', events);
        }

        // Cleanup beim Verlassen der Seite    
        return () => {
            if (ecRef.current) {
                destroyCalendar(ecRef.current);
                ecRef.current = null;
            }
        };
    }, [events]);

    if (!isAuthenticated) {
        return (
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Mein Kalender</h1>
                <p>Bitte melden Sie sich an, um Ihren Kalender zu sehen.</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Mein Kalender</h1>
            <div ref={calendarRef} className="bg-white rounded-lg shadow p-2" />
         </div> 
     );
}
