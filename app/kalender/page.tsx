'use client';
import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import '@fullcalendar/core/main.css'; 
import '@fullcalendar/daygrid/main.css';

export default function KalenderPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '20px' }}>Mein Kalender</h1>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="de"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek,dayGridDay'
          }}
          buttonText={{
            today: 'Heute',
            month: 'Monat',
            week: 'Woche',
            day: 'Tag',
          }}
          // We will add event handling later
          // dateClick={handleDateClick}
          // eventClick={handleEventClick}
        />
      </div>
    </div>
  );
}
