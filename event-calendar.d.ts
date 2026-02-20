declare module '@event-calendar/core' {
    export function createCalendar(element: HTMLElement, plugins: any[], options: any): any;
    export function destroyCalendar(calendar: any): void;
}
declare module '@event-calendar/day-grid' {
    export const DayGrid: any;
}
declare module '@event-calendar/interaction' {
    export const Interaction: any;
}
