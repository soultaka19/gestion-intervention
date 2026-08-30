import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import {
  Intervention,
  INTERVENTION_STATUS_LABELS,
  INTERVENTION_TYPE_LABELS,
} from '../../../intervention/models/intervention';
import { InterventionData } from '../../../intervention/services/intervention-data';
import {
  CalendarEvent,
  DAY_NAMES,
  MONTH_NAMES,
  TIME_SLOTS,
  WeekDay,
} from '../../models/planning';
import { formatDateLocale } from '../../../../core/utils/date';

type ViewMode = 'week' | 'month';

@Component({
  selector: 'app-planning-calendar',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    ButtonModule,
    SelectModule,
    TagModule,
    TooltipModule,
    DialogModule,
    ToastModule,
  ],
  providers: [MessageService],
  template: `
    <p-toast />

    <div class="p-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Planning</h1>
          <p class="text-gray-500 mt-1">Planification des interventions</p>
        </div>

        <div class="flex items-center gap-2">
          <!-- View toggle -->
          <div class="flex bg-gray-100 rounded-lg p-1">
            <button
              class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
              [class.bg-white]="viewMode() === 'week'"
              [class.shadow-sm]="viewMode() === 'week'"
              [class.text-gray-900]="viewMode() === 'week'"
              [class.text-gray-600]="viewMode() !== 'week'"
              (click)="setViewMode('week')"
            >
              Semaine
            </button>
            <button
              class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
              [class.bg-white]="viewMode() === 'month'"
              [class.shadow-sm]="viewMode() === 'month'"
              [class.text-gray-900]="viewMode() === 'month'"
              [class.text-gray-600]="viewMode() !== 'month'"
              (click)="setViewMode('month')"
            >
              Mois
            </button>
          </div>
        </div>
      </div>

      <!-- Calendar Navigation -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
          <div class="flex items-center gap-2">
            <p-button
              icon="pi pi-chevron-left"
              [rounded]="true"
              [text]="true"
              severity="secondary"
              (onClick)="previousPeriod()"
            />
            <p-button
              label="Aujourd'hui"
              severity="secondary"
              [outlined]="true"
              size="small"
              (onClick)="goToToday()"
            />
            <p-button
              icon="pi pi-chevron-right"
              [rounded]="true"
              [text]="true"
              severity="secondary"
              (onClick)="nextPeriod()"
            />
          </div>

          <h2 class="text-lg font-semibold text-gray-900">
            {{ currentPeriodLabel() }}
          </h2>

          <div class="w-48">
            <p-select
              [options]="technicianOptions()"
              [(ngModel)]="selectedTechnician"
              placeholder="Tous les techniciens"
              optionLabel="name"
              optionValue="id"
              [showClear]="true"
              styleClass="w-full"
              (onChange)="loadPlanning()"
            />
          </div>
        </div>

        <!-- Week View -->
        @if (viewMode() === 'week') {
          <div class="overflow-x-auto">
            <div class="min-w-[800px]">
              <!-- Days header -->
              <div class="grid grid-cols-8 border-b border-gray-200">
                <div class="p-2 text-center text-sm text-gray-500 border-r border-gray-100">
                  Heure
                </div>
                @for (day of weekDays(); track day.date) {
                  <div
                    class="p-3 text-center border-r border-gray-100 last:border-r-0"
                    [class.bg-indigo-50]="day.isToday"
                  >
                    <div class="text-xs text-gray-500 uppercase">{{ day.dayName }}</div>
                    <div
                      class="text-lg font-semibold mt-1"
                      [class.text-indigo-600]="day.isToday"
                      [class.text-gray-900]="!day.isToday"
                    >
                      {{ day.dayNumber }}
                    </div>
                  </div>
                }
              </div>

              <!-- Time slots -->
              @for (slot of timeSlots; track slot.hour) {
                <div class="grid grid-cols-8 border-b border-gray-100 last:border-b-0">
                  <div
                    class="p-2 text-center text-xs text-gray-400 border-r border-gray-100 bg-gray-50"
                  >
                    {{ slot.label }}
                  </div>
                  @for (day of weekDays(); track day.date) {
                    <div
                      class="min-h-[60px] p-1 border-r border-gray-100 last:border-r-0 relative"
                      [class.bg-indigo-50/30]="day.isToday"
                    >
                      @for (event of getEventsForSlot(day, slot.hour); track event.id) {
                        <div
                          class="text-xs p-1.5 rounded mb-1 cursor-pointer hover:opacity-80 transition-opacity"
                          [style.background-color]="event.color + '20'"
                          [style.border-left]="'3px solid ' + event.color"
                          (click)="openEventDetail(event)"
                          [pTooltip]="event.intervention.description"
                          tooltipPosition="top"
                        >
                          <div class="font-medium truncate" [style.color]="event.color">
                            {{ event.intervention.clientName }}
                          </div>
                          <div class="text-gray-500 truncate">
                            {{ event.intervention.timeRange }} · {{ getStatusLabel(event.intervention.status) }}
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }

        <!-- Month View -->
        @if (viewMode() === 'month') {
          <div class="p-4">
            <!-- Days header -->
            <div class="grid grid-cols-7 mb-2">
              @for (dayName of dayNames; track dayName) {
                <div class="p-2 text-center text-sm font-medium text-gray-500">
                  {{ dayName }}
                </div>
              }
            </div>

            <!-- Calendar grid -->
            <div class="grid grid-cols-7 border border-gray-200 rounded-lg overflow-hidden">
              @for (day of monthDays(); track $index) {
                <div
                  class="min-h-[100px] p-2 border-r border-b border-gray-100 last:border-r-0"
                  [class.bg-gray-50]="!day"
                  [class.bg-indigo-50]="day?.isToday"
                >
                  @if (day) {
                    <div
                      class="text-sm font-medium mb-1"
                      [class.text-indigo-600]="day.isToday"
                      [class.text-gray-900]="!day.isToday"
                    >
                      {{ day.dayNumber }}
                    </div>
                    <div class="space-y-1">
                      @for (event of day.events.slice(0, 3); track event.id) {
                        <div
                          class="text-xs p-1 rounded cursor-pointer truncate"
                          [style.background-color]="event.color + '20'"
                          [style.color]="event.color"
                          (click)="openEventDetail(event)"
                          [pTooltip]="event.intervention.timeRange + ' · ' + getStatusLabel(event.intervention.status)"
                          tooltipPosition="top"
                        >
                          {{ event.intervention.clientName }}
                        </div>
                      }
                      @if (day.events.length > 3) {
                        <div class="text-xs text-gray-500 pl-1">
                          +{{ day.events.length - 3 }} autres
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Legend -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 class="text-sm font-medium text-gray-700 mb-3">Légende</h3>
        <div class="flex flex-wrap gap-4">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-orange-500"></div>
            <span class="text-sm text-gray-600">En attente</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-blue-500"></div>
            <span class="text-sm text-gray-600">Planifiée</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-purple-500"></div>
            <span class="text-sm text-gray-600">En cours</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
            <span class="text-sm text-gray-600">Terminée</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Detail Dialog -->
    <p-dialog
      header="Détails de l'intervention"
      [(visible)]="showEventDialog"
      [modal]="true"
      [style]="{ width: '450px' }"
      [draggable]="false"
      [resizable]="false"
    >
      @if (selectedEvent()) {
        <div class="space-y-4">
          <div>
            <label class="text-sm text-gray-500">Client</label>
            <p class="font-medium text-gray-900">{{ selectedEvent()!.intervention.clientName }}</p>
            <p class="text-sm text-gray-600">{{ selectedEvent()!.intervention.clientAddress }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-500">Type</label>
              <div class="mt-1">
                <p-tag
                  [value]="getTypeLabel(selectedEvent()!.intervention.type)"
                  [severity]="getTypeSeverity(selectedEvent()!.intervention.type)"
                />
              </div>
            </div>
            <div>
              <label class="text-sm text-gray-500">Statut</label>
              <div class="mt-1">
                <p-tag
                  [value]="getStatusLabel(selectedEvent()!.intervention.status)"
                  [severity]="getStatusSeverity(selectedEvent()!.intervention.status)"
                />
              </div>
            </div>
          </div>

          <div>
            <label class="text-sm text-gray-500">Horaire</label>
            <p class="font-medium text-gray-900">
              {{ selectedEvent()!.start | date:'dd/MM/yyyy HH:mm' }} -
              {{ selectedEvent()!.end | date:'HH:mm' }}
            </p>
          </div>

          @if (selectedEvent()!.intervention.technicianName) {
            <div>
              <label class="text-sm text-gray-500">Technicien</label>
              <p class="font-medium text-gray-900">
                {{ selectedEvent()!.intervention.technicianName }}
              </p>
            </div>
          }

          <div>
            <label class="text-sm text-gray-500">Description</label>
            <p class="text-gray-700">{{ selectedEvent()!.intervention.description }}</p>
          </div>

          <div class="flex justify-end gap-2 pt-4">
            <p-button
              label="Fermer"
              severity="secondary"
              [outlined]="true"
              (onClick)="closeEventDialog()"
            />
            <p-button
              label="Voir détails"
              icon="pi pi-external-link"
              (onClick)="viewIntervention(selectedEvent()!.intervention.id)"
            />
          </div>
        </div>
      }
    </p-dialog>
  `,
})
export class PlanningCalendar implements OnInit {
  private router = inject(Router);
  private interventionData = inject(InterventionData);
  private messageService = inject(MessageService);

  viewMode = signal<ViewMode>('week');
  currentDate = signal(new Date());
  interventions = signal<Intervention[]>([]);
  loading = signal(false);
  selectedTechnician: string | null = null;
  showEventDialog = false;
  selectedEvent = signal<CalendarEvent | null>(null);

  timeSlots = TIME_SLOTS;
  dayNames = DAY_NAMES;

  technicianOptions = computed(() => {
    const technicians = new Map<string, string>();
    this.interventions().forEach(i => {
      if (i.technicianId && i.technicianName) {
        technicians.set(i.technicianId, i.technicianName);
      }
    });
    return Array.from(technicians, ([id, name]) => ({ id, name }));
  });

  currentPeriodLabel = computed(() => {
    const date = this.currentDate();
    if (this.viewMode() === 'week') {
      const weekStart = this.getWeekStart(date);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${weekStart.getDate()} - ${weekEnd.getDate()} ${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getFullYear()}`;
      } else {
        return `${weekStart.getDate()} ${MONTH_NAMES[weekStart.getMonth()]} - ${weekEnd.getDate()} ${MONTH_NAMES[weekEnd.getMonth()]} ${weekStart.getFullYear()}`;
      }
    } else {
      return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
    }
  });

  weekDays = computed<WeekDay[]>(() => {
    const date = this.currentDate();
    const weekStart = this.getWeekStart(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: WeekDay[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);

      const dayDate = new Date(day);
      dayDate.setHours(0, 0, 0, 0);

      days.push({
        date: day,
        dayName: DAY_NAMES[day.getDay()],
        dayNumber: day.getDate(),
        isToday: dayDate.getTime() === today.getTime(),
        events: this.getEventsForDay(day),
      });
    }
    return days;
  });

  monthDays = computed<(WeekDay | null)[]>(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: (WeekDay | null)[] = [];

    // Add empty cells for days before the first day of the month
    const startDayOfWeek = firstDay.getDay();
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const day = new Date(year, month, i);
      const dayDate = new Date(day);
      dayDate.setHours(0, 0, 0, 0);

      days.push({
        date: day,
        dayName: DAY_NAMES[day.getDay()],
        dayNumber: i,
        isToday: dayDate.getTime() === today.getTime(),
        events: this.getEventsForDay(day),
      });
    }

    // Fill remaining cells to complete the grid
    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  });

  ngOnInit(): void {
    this.loadPlanning();
  }

  loadPlanning(): void {
    this.loading.set(true);

    const date = this.currentDate();
    let startDate: string;
    let endDate: string;

    if (this.viewMode() === 'week') {
      const weekStart = this.getWeekStart(date);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      startDate = this.formatDate(weekStart);
      endDate = this.formatDate(weekEnd);
    } else {
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      startDate = this.formatDate(monthStart);
      endDate = this.formatDate(monthEnd);
    }

    this.interventionData
      .getPlanning(startDate, endDate, this.selectedTechnician || undefined)
      .subscribe({
        next: interventions => {
          this.interventions.set(interventions);
          this.loading.set(false);
        },
        error: err => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: err.message || 'Impossible de charger le planning',
          });
          this.loading.set(false);
        },
      });
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  // F-11 — voir core/utils/date.ts : toISOString() convertit en UTC et
  // decalait la date d'un jour selon le fuseau et l'heure de la saisie.
  private formatDate(date: Date): string {
    return formatDateLocale(date);
  }

  private getEventsForDay(date: Date): CalendarEvent[] {
    const dateStr = this.formatDate(date);
    return this.interventions()
      .filter(i => i.scheduledDate?.split('T')[0] === dateStr)
      .map(i => this.interventionToEvent(i));
  }

  getEventsForSlot(day: WeekDay, hour: number): CalendarEvent[] {
    return day.events.filter(e => {
      const eventHour = e.start.getHours();
      return eventHour === hour;
    });
  }

  private interventionToEvent(intervention: Intervention): CalendarEvent {
    const start = new Date(intervention.scheduledDate!);
    if (intervention.scheduledStartTime) {
      const [h, m] = intervention.scheduledStartTime.split(':');
      start.setHours(parseInt(h), parseInt(m));
    }

    const end = new Date(intervention.scheduledDate!);
    if (intervention.scheduledEndTime) {
      const [h, m] = intervention.scheduledEndTime.split(':');
      end.setHours(parseInt(h), parseInt(m));
    } else {
      end.setHours(start.getHours() + 1);
    }

    const timeRange = this.formatEventTimeRange(start, end);

    return {
      id: intervention.id,
      title: intervention.clientName,
      start,
      end,
      color: this.getStatusColor(intervention.status),
      intervention: {
        id: intervention.id,
        clientName: intervention.clientName,
        clientAddress: intervention.clientAddress,
        technicianName: intervention.technicianName,
        type: intervention.type,
        status: intervention.status,
        description: intervention.description,
        timeRange,
      },
    };
  }

  private formatEventTimeRange(start: Date, end: Date): string {
    const fmt = (d: Date) =>
      `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    return `${fmt(start)} - ${fmt(end)}`;
  }

  private getStatusColor(status: number): string {
    const colors: Record<number, string> = {
      0: '#f97316', // orange - pending
      1: '#3b82f6', // blue - scheduled
      2: '#8b5cf6', // purple - in progress
      3: '#22c55e', // green - completed
      4: '#ef4444', // red - cancelled
    };
    return colors[status] || '#6b7280';
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
    this.loadPlanning();
  }

  previousPeriod(): void {
    const date = this.currentDate();
    if (this.viewMode() === 'week') {
      date.setDate(date.getDate() - 7);
    } else {
      date.setMonth(date.getMonth() - 1);
    }
    this.currentDate.set(new Date(date));
    this.loadPlanning();
  }

  nextPeriod(): void {
    const date = this.currentDate();
    if (this.viewMode() === 'week') {
      date.setDate(date.getDate() + 7);
    } else {
      date.setMonth(date.getMonth() + 1);
    }
    this.currentDate.set(new Date(date));
    this.loadPlanning();
  }

  goToToday(): void {
    this.currentDate.set(new Date());
    this.loadPlanning();
  }

  openEventDetail(event: CalendarEvent): void {
    this.selectedEvent.set(event);
    this.showEventDialog = true;
  }

  closeEventDialog(): void {
    this.showEventDialog = false;
    this.selectedEvent.set(null);
  }

  viewIntervention(id: string): void {
    this.router.navigate(['/home/interventions', id]);
  }

  getStatusLabel(status: number): string {
    return INTERVENTION_STATUS_LABELS[status] || 'Inconnu';
  }

  getStatusSeverity(status: number): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<number, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      0: 'warn',
      1: 'info',
      2: 'success',
      3: 'success',
      4: 'danger',
    };
    return severities[status] || 'secondary';
  }

  getTypeLabel(type: number): string {
    return INTERVENTION_TYPE_LABELS[type] || 'Inconnu';
  }

  getTypeSeverity(type: number): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<number, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      0: 'info',
      1: 'warn',
      2: 'success',
      3: 'secondary',
      4: 'danger',
    };
    return severities[type] || 'secondary';
  }
}
