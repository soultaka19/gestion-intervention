import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar-header',
  imports: [],
  template: `
    <div class="h-16 flex items-center px-4 border-b border-gray-200 justify-between flex-shrink-0">
        <div
          class="flex items-center gap-3 min-w-0 transition-opacity duration-300"
        >
          <div class="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
            <i class="pi pi-cog text-white text-xl"></i>
          </div>
          <div class="overflow-hidden">
            <h1 class="text-lg font-bold text-gray-900 whitespace-nowrap">TechMaint</h1>
            <p class="text-xs text-gray-500 whitespace-nowrap">Gestion Interventions</p>
          </div>
        </div>
  `,
  styles: ``,
})
export class SidebarHeader {

}
