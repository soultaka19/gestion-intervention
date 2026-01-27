import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-sidebar-header',
  imports: [ButtonModule],
  template: `
    <div class="h-20 flex items-center px-4 justify-between flex-shrink-0 border-b border-indigo-700/30">
      @if (!isCollapsed()) {
        <div class="flex items-center gap-3 min-w-0 animate-fade-in">
          <div 
            class="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl 
            flex items-center justify-center flex-shrink-0 shadow-lg"
            >
            <i class="pi pi-wrench text-white text-2xl"></i>
          </div>
          <div class="overflow-hidden">
            <h1 class="text-xl font-bold text-white whitespace-nowrap">
              TechMaint
            </h1>
            <p class="text-xs text-indigo-300 font-medium whitespace-nowrap">Gestion Interventions</p>
          </div>
        </div>
        
        <!-- Bouton pour collapse -->
        <button
          pButton
          type="button"
          icon="pi pi-angle-left"
          class="p-button-text p-button-rounded p-button-sm !text-indigo-300 hover:!text-white hover:!bg-indigo-800/50 transition-colors"
          (click)="toggle.emit()"
        ></button>
      } @else {
        <div class="w-full flex flex-col items-center gap-3">
          <!-- Bouton burger pour expand -->
          <button
            pButton
            type="button"
            icon="pi pi-bars"
            class="p-button-text p-button-rounded p-button-xxl !text-indigo-300 hover:!text-white hover:!bg-indigo-800/50 transition-colors"
            (click)="toggle.emit()"
          ></button>
        </div>
      }
    </div>
  `,
})
export class SidebarHeader {
  isCollapsed = input(false);
  toggle = output();
}