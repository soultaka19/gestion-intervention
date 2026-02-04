export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  intervention: CalendarIntervention;
}

export interface CalendarIntervention {
  id: string;
  clientName: string;
  clientAddress: string;
  technicianName: string | null;
  type: number;
  status: number;
  description: string;
}

export interface WeekDay {
  date: Date;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  events: CalendarEvent[];
}

export interface TimeSlot {
  hour: number;
  label: string;
}

export const TIME_SLOTS: TimeSlot[] = Array.from({ length: 12 }, (_, i) => ({
  hour: 7 + i,
  label: `${(7 + i).toString().padStart(2, '0')}:00`,
}));

export const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
export const FULL_DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
export const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];
