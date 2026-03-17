export interface Calendar {
    id: string;
    name: string;
    color: string;
    visible: boolean;
    description?: string;
  }
  
  export interface CalEvent {
    id: string;
    calendarId: string;
    title: string;
    start: string;
    end?: string | null;
    color: string;
    category: string;
    description?: string;
    location?: string;
    allDay?: boolean;
    recurrence?: RecurrenceRule | null;
    reminder?: number | null; // minutes before
    url?: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface RecurrenceRule {
    freq: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    until?: string; // date string YYYY-MM-DD
    count?: number;
  }
  
  export interface EventForm {
    calendarId: string;
    title: string;
    start: string;
    end: string;
    startTime: string;
    endTime: string;
    color: string;
    category: string;
    description: string;
    location: string;
    allDay: boolean;
    url: string;
    reminder: string; // empty or number in minutes
    recurrence: {
      enabled: boolean;
      freq: 'daily' | 'weekly' | 'monthly' | 'yearly';
      interval: number;
      until: string;
    };
  }
  
  export type ViewMode = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';
  
  export type Category =
    | 'gottesdienst'
    | 'seelsorge'
    | 'beerdigung'
    | 'verwaltung'
    | 'treffen'
    | 'privat'
    | 'termin';
  
  export const CATEGORIES: { value: Category; label: string; icon: string }[] = [
    { value: 'gottesdienst', label: 'Gottesdienst', icon: '⛪' },
    { value: 'seelsorge',    label: 'Seelsorge',    icon: '🕊️' },
    { value: 'beerdigung',   label: 'Beerdigung',   icon: '🕯️' },
    { value: 'verwaltung',   label: 'Verwaltung',   icon: '📋' },
    { value: 'treffen',      label: 'Treffen',       icon: '🤝' },
    { value: 'privat',       label: 'Privat',        icon: '🏠' },
    { value: 'termin',       label: 'Allgemein',     icon: '📅' },
  ];