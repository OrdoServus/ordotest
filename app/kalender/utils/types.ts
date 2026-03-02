export interface Calendar  { id: string; name: string; color: string; visible: boolean; }
export interface CalEvent  { id: string; calendarId: string; title: string; start: string; end?: string | null; color: string; category: string; description?: string; location?: string; allDay?: boolean; }
export interface EventForm { calendarId: string; title: string; start: string; end: string; startTime: string; endTime: string; color: string; category: string; description: string; location: string; allDay: boolean; }
export type ViewMode = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';
