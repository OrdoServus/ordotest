import React from 'react';
import { EventForm, Calendar, CATEGORIES } from '../utils/types';

interface EventModalProps {
  eventForm: EventForm | null;
  calendars: Calendar[];
  editingEventId: string | null;
  formError: string | null;
  isLoading: boolean;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleRecurrenceChange: (field: string, value: any) => void;
  handleSaveEvent: () => void;
  handleDeleteEvent: () => void;
  setEventModalOpen: (open: boolean) => void;
  s: { [key: string]: React.CSSProperties };
}

const REMINDER_OPTIONS = [
  { value: '', label: 'Keine Erinnerung' },
  { value: '0', label: 'Zur Startzeit' },
  { value: '5', label: '5 Minuten vorher' },
  { value: '10', label: '10 Minuten vorher' },
  { value: '15', label: '15 Minuten vorher' },
  { value: '30', label: '30 Minuten vorher' },
  { value: '60', label: '1 Stunde vorher' },
  { value: '120', label: '2 Stunden vorher' },
  { value: '1440', label: '1 Tag vorher' },
  { value: '2880', label: '2 Tage vorher' },
];

export const EventModal: React.FC<EventModalProps> = ({
  eventForm, calendars, editingEventId, formError, isLoading,
  handleFormChange, handleRecurrenceChange, handleSaveEvent, handleDeleteEvent, setEventModalOpen, s
}) => {
  if (!eventForm) return null;

  const selectedCal = calendars.find(c => c.id === eventForm.calendarId);

  return (
    <div style={s.overlay} onClick={() => setEventModalOpen(false)}>
      <div style={{ ...s.modal, maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={s.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {selectedCal && (
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: selectedCal.color, flexShrink: 0 }} />
            )}
            <h2 style={s.modalTitle}>
              {editingEventId ? 'Termin bearbeiten' : 'Neuer Termin'}
            </h2>
          </div>
          <button style={s.modalClose} onClick={() => setEventModalOpen(false)} title="Schließen">✕</button>
        </div>

        {formError && (
          <div style={s.errorBanner}>
            <span>⚠️</span> {formError}
          </div>
        )}

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>

          {/* Kalender */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={s.ml}>Kalender</label>
            <select name="calendarId" value={eventForm.calendarId} onChange={handleFormChange} style={s.mi}>
              <option value="">— Kalender wählen —</option>
              {calendars.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Titel */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={s.ml}>Titel *</label>
            <input
              name="title"
              value={eventForm.title}
              onChange={handleFormChange}
              placeholder="z. B. Pfarrmesse, Taufe, Gemeindeabend…"
              style={{ ...s.mi, fontSize: '1rem', fontWeight: 600 }}
              autoFocus
            />
          </div>

          {/* Kategorie */}
          <div>
            <label style={s.ml}>Kategorie</label>
            <select name="category" value={eventForm.category} onChange={handleFormChange} style={s.mi}>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
              ))}
            </select>
          </div>

          {/* Ort */}
          <div>
            <label style={s.ml}>📍 Ort</label>
            <input
              name="location"
              value={eventForm.location}
              onChange={handleFormChange}
              placeholder="z. B. Pfarrkirche St. Maria"
              style={s.mi}
            />
          </div>

          {/* Datum & Zeit */}
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ ...s.ml, marginBottom: 0 }}>Datum & Uhrzeit</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.82rem', color: '#555', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  name="allDay"
                  checked={eventForm.allDay}
                  onChange={handleFormChange}
                  style={{ accentColor: '#5C2A52', cursor: 'pointer' }}
                />
                Ganztägig
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: eventForm.allDay ? '1fr 1fr' : '1fr auto 1fr auto', gap: '8px', marginBottom: '14px', alignItems: 'end' }}>
              <div>
                <div style={s.subLabel}>Von</div>
                <input name="start" type="date" value={eventForm.start} onChange={handleFormChange} style={{ ...s.mi, marginBottom: 0 }} />
              </div>
              {!eventForm.allDay && (
                <div>
                  <div style={s.subLabel}>Uhrzeit</div>
                  <input name="startTime" type="time" value={eventForm.startTime} onChange={handleFormChange} style={{ ...s.mi, marginBottom: 0, width: '110px' }} />
                </div>
              )}
              <div>
                <div style={s.subLabel}>Bis</div>
                <input name="end" type="date" value={eventForm.end} onChange={handleFormChange} style={{ ...s.mi, marginBottom: 0 }} />
              </div>
              {!eventForm.allDay && (
                <div>
                  <div style={s.subLabel}>Uhrzeit</div>
                  <input name="endTime" type="time" value={eventForm.endTime} onChange={handleFormChange} style={{ ...s.mi, marginBottom: 0, width: '110px' }} />
                </div>
              )}
            </div>
          </div>

          {/* Wiederholung */}
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={s.sectionBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ ...s.ml, marginBottom: 0 }}>🔁 Wiederholung</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.82rem', color: '#555', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={eventForm.recurrence.enabled}
                    onChange={e => handleRecurrenceChange('enabled', e.target.checked)}
                    style={{ accentColor: '#5C2A52', cursor: 'pointer' }}
                  />
                  Aktiv
                </label>
              </div>
              {eventForm.recurrence.enabled && (
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '10px', marginTop: '12px', alignItems: 'end' }}>
                  <div>
                    <div style={s.subLabel}>Alle</div>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={eventForm.recurrence.interval}
                      onChange={e => handleRecurrenceChange('interval', Number(e.target.value))}
                      style={{ ...s.mi, marginBottom: 0, width: '65px', textAlign: 'center' }}
                    />
                  </div>
                  <div>
                    <div style={s.subLabel}>Frequenz</div>
                    <select
                      value={eventForm.recurrence.freq}
                      onChange={e => handleRecurrenceChange('freq', e.target.value)}
                      style={{ ...s.mi, marginBottom: 0 }}
                    >
                      <option value="daily">Tag(e)</option>
                      <option value="weekly">Woche(n)</option>
                      <option value="monthly">Monat(e)</option>
                      <option value="yearly">Jahr(e)</option>
                    </select>
                  </div>
                  <div>
                    <div style={s.subLabel}>Bis (optional)</div>
                    <input
                      type="date"
                      value={eventForm.recurrence.until}
                      onChange={e => handleRecurrenceChange('until', e.target.value)}
                      style={{ ...s.mi, marginBottom: 0 }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Erinnerung */}
          <div>
            <label style={s.ml}>🔔 Erinnerung</label>
            <select name="reminder" value={eventForm.reminder} onChange={handleFormChange} style={s.mi}>
              {REMINDER_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* URL */}
          <div>
            <label style={s.ml}>🔗 Link / URL</label>
            <input
              name="url"
              value={eventForm.url}
              onChange={handleFormChange}
              placeholder="https://…"
              style={s.mi}
              type="url"
            />
          </div>

          {/* Beschreibung */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={s.ml}>📝 Beschreibung</label>
            <textarea
              name="description"
              value={eventForm.description}
              onChange={handleFormChange}
              placeholder="Notizen, Ablauf, Hinweise…"
              style={{ ...s.mi, height: '80px', resize: 'vertical', lineHeight: '1.5' }}
            />
          </div>
        </div>

        {/* Preview */}
        <div style={{ ...s.previewBar, backgroundColor: eventForm.color }}>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>
            {eventForm.title || 'Vorschau'}
          </span>
          {eventForm.location && (
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem' }}>
              · 📍 {eventForm.location}
            </span>
          )}
          {eventForm.recurrence.enabled && (
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.78rem', marginLeft: 'auto' }}>🔁</span>
          )}
        </div>

        {/* Actions */}
        <div style={s.modalActions}>
          {editingEventId && (
            <button onClick={handleDeleteEvent} disabled={isLoading} style={s.deleteBtn}>
              🗑 Löschen
            </button>
          )}
          <button onClick={() => setEventModalOpen(false)} style={s.cancelBtn}>Abbrechen</button>
          <button onClick={handleSaveEvent} disabled={isLoading || !eventForm.title.trim() || !eventForm.calendarId} style={{
            ...s.saveBtn,
            opacity: (isLoading || !eventForm.title.trim() || !eventForm.calendarId) ? 0.6 : 1,
          }}>
            {isLoading ? '⏳ Speichert…' : editingEventId ? '✓ Aktualisieren' : '✓ Erstellen'}
          </button>
        </div>
      </div>
    </div>
  );
};