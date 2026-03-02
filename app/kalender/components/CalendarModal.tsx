import React from 'react';
import { Calendar } from '../utils/types';

interface CalendarModalProps {
  calForm: { name: string; color: string; };
  editingCalendar: Calendar | null;
  isLoading: boolean;
  COLORS: string[];
  handleSaveCal: () => void;
  handleDeleteCal: () => void;
  setCalModalOpen: (open: boolean) => void;
  setCalForm: (form: { name: string; color: string; }) => void;
  s: { [key: string]: React.CSSProperties };
}

export const CalendarModal: React.FC<CalendarModalProps> = ({ calForm, editingCalendar, isLoading, COLORS, handleSaveCal, handleDeleteCal, setCalModalOpen, setCalForm, s }) => (
  <div style={s.overlay} onClick={() => setCalModalOpen(false)}>
    <div style={{ ...s.modal, maxWidth: '380px' }} onClick={e => e.stopPropagation()}>
      <div style={s.modalHeader}>
        <h2 style={s.modalTitle}>{editingCalendar ? 'Kalender bearbeiten' : 'Neuer Kalender'}</h2>
        <button style={s.modalClose} onClick={() => setCalModalOpen(false)}>✕</button>
      </div>
      <label style={s.ml}>Name</label>
      <input value={calForm.name} onChange={e => setCalForm({ ...calForm, name: e.target.value })} placeholder="Kalendername" style={s.mi} autoFocus />
      <label style={s.ml}>Farbe</label>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {COLORS.map(c => (
          <button key={c} onClick={() => setCalForm({ ...calForm, color: c })}
            style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer', backgroundColor: c, outline: calForm.color === c ? '3px solid #333' : 'none', outlineOffset: '2px' }}
          />
        ))}
      </div>
      <div style={s.modalActions}>
        {editingCalendar && <button onClick={handleDeleteCal} disabled={isLoading} style={s.deleteBtn}>🗑 Löschen</button>}
        <button onClick={() => setCalModalOpen(false)} style={s.cancelBtn}>Abbrechen</button>
        <button onClick={handleSaveCal} disabled={isLoading || !calForm.name.trim()} style={s.saveBtn}>
          {isLoading ? 'Speichert…' : '✓ Speichern'}
        </button>
      </div>
    </div>
  </div>
);