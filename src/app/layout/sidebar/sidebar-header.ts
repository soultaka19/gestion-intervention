import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-sidebar-header',
  imports: [ButtonModule],
  template: `
    <div class="h-16 flex items-center px-4 border-b border-primary-100 justify-between flex-shrink-0 bg-gradient-to-r from-primary-50 to-white">
      <div 
        class="flex items-center gap-3 min-w-0 transition-all duration-300"
        [class.opacity-0]="isCollapsed()"
        [class.opacity-100]="!isCollapsed()"
      >
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

      
    </div>
  `,
  styles: `
  
  `,
})
export class SidebarHeader {
  isCollapsed = input(false);
  toggle = output();
}
