import React from 'react';
import { Calendar } from '../utils/types';

interface CalendarModalProps {
  calForm: { name: string; color: string; description?: string };
  editingCalendar: Calendar | null;
  isLoading: boolean;
  COLORS: string[];
  handleSaveCal: () => void;
  handleDeleteCal: () => void;
  setCalModalOpen: (open: boolean) => void;
  setCalForm: (form: { name: string; color: string; description?: string }) => void;
  s: { [key: string]: React.CSSProperties };
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  calForm, editingCalendar, isLoading, COLORS, handleSaveCal, handleDeleteCal,
  setCalModalOpen, setCalForm, s
}) => (
  <div style={s.overlay} onClick={() => setCalModalOpen(false)}>
    <div style={{ ...s.modal, maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
      <div style={s.modalHeader}>
        <h2 style={s.modalTitle}>
          {editingCalendar ? 'Kalender bearbeiten' : 'Neuer Kalender'}
        </h2>
        <button style={s.modalClose} onClick={() => setCalModalOpen(false)}>✕</button>
      </div>

      <label style={s.ml}>Name *</label>
      <input
        value={calForm.name}
        onChange={e => setCalForm({ ...calForm, name: e.target.value })}
        placeholder="z. B. Pfarrkalender, Beerdigungen…"
        style={s.mi}
        autoFocus
      />

      <label style={s.ml}>Beschreibung</label>
      <input
        value={calForm.description ?? ''}
        onChange={e => setCalForm({ ...calForm, description: e.target.value })}
        placeholder="Kurze Beschreibung (optional)"
        style={s.mi}
      />

      <label style={s.ml}>Farbe</label>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {COLORS.map(c => (
          <button
            key={c}
            onClick={() => setCalForm({ ...calForm, color: c })}
            title={c}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              border: calForm.color === c ? '3px solid #2C1F14' : '2px solid transparent',
              outline: calForm.color === c ? '2px solid white' : 'none',
              outlineOffset: '-4px',
              cursor: 'pointer',
              backgroundColor: c,
              boxShadow: calForm.color === c ? `0 0 0 2px ${c}40, 0 2px 8px ${c}60` : '0 1px 4px rgba(0,0,0,0.15)',
              transform: calForm.color === c ? 'scale(1.12)' : 'scale(1)',
              transition: 'all 0.15s',
            }}
          />
        ))}
      </div>

      {/* Preview */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 14px', borderRadius: '8px', marginBottom: '20px',
        backgroundColor: '#F8FAFC', border: '1px solid #EEF0F3',
      }}>
        <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: calForm.color }} />
        <span style={{ fontWeight: 600, color: '#2C1F14', fontSize: '0.93rem' }}>
          {calForm.name || 'Kalender-Vorschau'}
        </span>
        {calForm.description && (
          <span style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>— {calForm.description}</span>
        )}
      </div>

      <div style={s.modalActions}>
        {editingCalendar && (
          <button onClick={handleDeleteCal} disabled={isLoading} style={s.deleteBtn}>
            🗑 Löschen
          </button>
        )}
        <button onClick={() => setCalModalOpen(false)} style={s.cancelBtn}>Abbrechen</button>
        <button
          onClick={handleSaveCal}
          disabled={isLoading || !calForm.name.trim()}
          style={{ ...s.saveBtn, opacity: (isLoading || !calForm.name.trim()) ? 0.6 : 1 }}
        >
          {isLoading ? '⏳ Speichert…' : '✓ Speichern'}
        </button>
      </div>
    </div>
  </div>
);