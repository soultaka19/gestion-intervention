import { Component, computed, inject, input } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Auth } from '../../core/auth/services/auth';

@Component({
  selector: 'app-sidebar-user',
  imports: [AvatarModule, ButtonModule, TooltipModule],
  template: `
    <div class="p-4 border-t border-indigo-700/30">
      @if (!isCollapsed()) {
        <div class="flex items-center gap-3 animate-fade-in">
          <div class="relative">
            <p-avatar
              [label]="userInitials()"
              shape="circle"
              styleClass="bg-gradient-to-br from-indigo-400 to-purple-500 text-white shadow-lg !w-12 !h-12 !text-lg"
            ></p-avatar>
            <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-indigo-900 rounded-full"></div>
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-white truncate">{{ auth.userFullName() }}</p>
            <p class="text-xs text-indigo-300 truncate">{{ userRoleLabel() }}</p>
          </div>

          <button
            pButton
            type="button"
            icon="pi pi-sign-out"
            class="p-button-text p-button-rounded p-button-sm !text-indigo-300 hover:!text-white hover:!bg-indigo-800/50 transition-colors"
            (click)="onLogout()"
          ></button>
        </div>
      } @else {
        <div class="flex flex-col items-center gap-3">
          <div class="relative">
            <p-avatar
              [label]="userInitials()"
              shape="circle"
              styleClass="bg-gradient-to-br from-indigo-400 to-purple-500 text-white shadow-lg !w-12 !h-12 !text-lg"
            ></p-avatar>
            <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-indigo-900 rounded-full"></div>
          </div>

          <button
            pButton
            type="button"
            icon="pi pi-sign-out"
            class="p-button-text p-button-rounded p-button-sm !text-indigo-300 hover:!text-white hover:!bg-indigo-800/50 transition-colors"
            pTooltip="Déconnexion"
            tooltipPosition="right"
            (click)="onLogout()"
          ></button>
        </div>
      }
    </div>
  `,
})
export class SidebarUser {
  auth = inject(Auth);
  isCollapsed = input(false);

  userInitials = computed(() => {
    const user = this.auth.currentUser();
    if (user) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    return 'U';
  });

  userRoleLabel = computed(() => {
    const role = this.auth.userRole();
    const roleLabels: Record<string, string> = {
      'Admin': 'Administrateur',
      'Planificateur': 'Planificateur',
      'Technicien': 'Technicien'
    };
    return role ? roleLabels[role] || role : '';
  });

  onLogout(): void {
    this.auth.logout();
  }
}
