"use client";

import React, { useEffect, useRef } from 'react';

// Core braucht die Klammern (Named Export)
import { EventCalendar } from '@event-calendar/core'; 

// Die Plugins brauchen KEINE Klammern (Default Export)
import DayGrid from '@event-calendar/day-grid';
import Interaction from '@event-calendar/interaction';

import '@event-calendar/core/index.css';

export default function KalenderPage() {
    const calendarRef = useRef<HTMLDivElement>(null);
    const ecRef = useRef<any>(null);

    useEffect(() => {
        // Sicherstellen, dass wir im Browser sind und das Element existiert
        if (typeof window !== 'undefined' && calendarRef.current && !ecRef.current) {
            ecRef.current = new EventCalendar(calendarRef.current, {
                view: 'dayGridMonth',
                plugins: [DayGrid, Interaction],
                events: [], // Hier kommen später deine Firebase-Daten rein
            });
        }

        // Cleanup beim Verlassen der Seite
        return () => {
            if (ecRef.current) {
                ecRef.current.destroy?.();
                ecRef.current = null;
            }
        };
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Mein Kalender</h1>
            <div ref={calendarRef} className="bg-white rounded-lg shadow p-2" />
        </div>
    );
}