import React from 'react';
import { EventForm, Calendar } from '../utils/types';

interface EventModalProps {
  eventForm: EventForm | null;
  calendars: Calendar[];
  editingEventId: string | null;
  formError: string | null;
  isLoading: boolean;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSaveEvent: () => void;
  handleDeleteEvent: () => void;
  setEventModalOpen: (open: boolean) => void;
  s: { [key: string]: React.CSSProperties };
}

export const EventModal: React.FC<EventModalProps> = ({ eventForm, calendars, editingEventId, formError, isLoading, handleFormChange, handleSaveEvent, handleDeleteEvent, setEventModalOpen, s }) => {
  if (!eventForm) return null;

  return (
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
  );
};