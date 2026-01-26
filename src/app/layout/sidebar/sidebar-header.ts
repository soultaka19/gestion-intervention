import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-sidebar-header',
  imports: [ButtonModule],
  template: `
    <div class="h-16 flex items-center px-4 border-b border-primary-100 justify-between flex-shrink-0 bg-gradient-to-r from-primary-50 to-white">
      @if (!isCollapsed()) {
        <div class="flex items-center gap-3 min-w-0 animate-fade-in">
          <div class="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-primary-100">
            <i class="pi pi-wrench text-white text-xl"></i>
          </div>
          <div class="overflow-hidden">
            <h1 class="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent whitespace-nowrap">
              TechMaint
            </h1>
            <p class="text-xs text-primary-600/70 font-medium whitespace-nowrap">Gestion Interventions</p>
          </div>
        </div>
        <button
        pButton
        type="button"
        icon="pi pi-angle-left"
        class="p-button-text p-button-rounded p-button-sm !text-primary-600 hover:!text-primary-700 hover:!bg-primary-50 transition-colors hidden md:flex"
        (click)="toggle.emit()"
      ></button>
      } @else {
        <div class="w-10 h-10  flex items-center justify-center mx-auto">
        <button
            pButton
            type="button"
            icon="pi pi-bars"
            class="p-button-text p-button-rounded md:hidden !text-primary-600 hover:!text-primary-700 hover:!bg-primary-50 transition-colors"
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