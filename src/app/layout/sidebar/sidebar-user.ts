import { Component, input } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-sidebar-user',
  imports: [AvatarModule, ButtonModule, TooltipModule],
  template: `
    <div class="p-4 border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white">
      @if (!isCollapsed()) {
        <div class="flex items-center gap-3 animate-fade-in">
          <p-avatar
            label="JD"
            shape="circle"
            styleClass="bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-md"
          ></p-avatar>
          
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 truncate">Jean Dupont</p>
            <p class="text-xs text-gray-500 truncate">Administrateur</p>
          </div>
          
          <button
            pButton
            type="button"
            icon="pi pi-sign-out"
            class="p-button-text p-button-rounded p-button-sm !text-primary-600 hover:!text-primary-700 hover:!bg-primary-50 transition-colors"
          ></button>
        </div>
      } @else {
        <div class="flex flex-col items-center gap-3">
          <p-avatar
            label="JD"
            shape="circle"
            styleClass="bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-md"
          ></p-avatar>
          
          <button
            pButton
            type="button"
            icon="pi pi-sign-out"
            class="p-button-text p-button-rounded p-button-sm !text-primary-600 hover:!text-primary-700 hover:!bg-primary-50 transition-colors"
            pTooltip="Déconnexion"
            tooltipPosition="right"
          ></button>
        </div>
      }
    </div>
  `,
})
export class SidebarUser {
  isCollapsed = input(false);
}