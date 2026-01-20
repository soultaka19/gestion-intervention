import { Component, input } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { PanelMenuModule } from 'primeng/panelmenu';

@Component({
  selector: 'app-sidebar-menu',
  imports: [PanelMenuModule,MenuModule],
  template: `
     <nav class="flex-1 px-4 py-6 overflow-y-auto">
        <p-panelMenu [model]="menuItems()" class="custom-panel-menu"></p-panelMenu>

        <!-- Section Rapports -->
        <h3 class="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-8 mb-3">
          Rapports
        </h3>
        <p-panelMenu [model]="reportItems()" class="custom-panel-menu"></p-panelMenu>
      </nav>
  `,
  styles: ``,
})
export class SidebarMenu {
  menuItems = input.required<MenuItem[]>();
  reportItems = input.required<MenuItem[]>();
}
