import { Component, input } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-sidebar-user',
  imports: [AvatarModule, ButtonModule, TooltipModule],
  template: `
    <div class="p-4 border-t border-indigo-700/30">
      @if (!isCollapsed()) {
        <div class="flex items-center gap-3 animate-fade-in">
          <div class="relative">
            <p-avatar
              label="JD"
              shape="circle"
              styleClass="bg-gradient-to-br from-indigo-400 to-purple-500 text-white shadow-lg !w-12 !h-12 !text-lg"
            ></p-avatar>
            <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-indigo-900 rounded-full"></div>
          </div>
          
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-white truncate">Jean Dupont</p>
            <p class="text-xs text-indigo-300 truncate">Administrateur</p>
          </div>
          
          <button
            pButton
            type="button"
            icon="pi pi-sign-out"
            class="p-button-text p-button-rounded p-button-sm !text-indigo-300 hover:!text-white hover:!bg-indigo-800/50 transition-colors"
          ></button>
        </div>
      } @else {
        <div class="flex flex-col items-center gap-3">
          <div class="relative">
            <p-avatar
              label="JD"
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
          ></button>
        </div>
      }
    </div>
  `,
})
export class SidebarUser {
  isCollapsed = input(false);
}