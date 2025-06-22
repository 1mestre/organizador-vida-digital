
export interface Contribution {
  id: string;
  amountUSD: number;
  amountCOP: number;
  originalAmountUSD?: number; // Gross amount before fees
  exchangeRate: number;
  date: string; // ISO string
  monthYear: string; // YYYY-MM
}

export interface MonthlyTargets {
  [monthYear: string]: number; // COP target for YYYY-MM
}

export enum EventType {
  TIMETABLE = 'timetable',
  CALENDAR = 'calendar',
}

export interface TimetableEvent {
  id: string;
  subject: string;
  teacher?: string;
  day: string; // e.g., "LUNES"
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  color: string; // hex color
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO string or YYYY-MM-DD
  end?: string; // Optional: ISO string or YYYY-MM-DD
  allDay: boolean;
  color: string; // hex color
  estimatedTime?: number; // New field for time estimation in hours
  // FullCalendar specific fields if needed, like groupId, extendedProps etc.
}


export interface AppState {
  contributions: Contribution[];
  monthlyTargets: MonthlyTargets;
  selectedInputCurrencyIngresos: 'USD' | 'COP';
  timetableData: TimetableEvent[];
  calendarEventsData: CalendarEvent[];
  overallTargetCOP: number; // Current month's overall target
}

export interface FirebaseData extends Omit<AppState, 'overallTargetCOP'>{ // overallTargetCOP is derived or set dynamically
  lastUpdated?: any; // firebase.firestore.FieldValue.serverTimestamp()
}


export type PageId = 'calendario-page' | 'ingresos-page' | 'universidad-page' | 'productividad-page';


// For Productividad Page
export interface ProductivityTask {
  id: string | number;
  text: string;
  time?: string;    // e.g., "1.5h"
  result?: string;  // e.g., "Profile updated"
}

export interface ProductivityTaskState {
  todo: ProductivityTask[];
  inProgress: ProductivityTask[];
  completed: ProductivityTask[];
}

// For FullCalendar instance
declare global {
  interface Window {
    FullCalendar: any;
    firebase: any; // Firebase compat
  }
}