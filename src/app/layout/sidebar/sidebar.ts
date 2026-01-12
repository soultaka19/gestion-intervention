import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { PanelMenuModule } from 'primeng/panelmenu';
@Component({
  selector: 'app-sidebar',
  imports: [MenuModule, AvatarModule, ButtonModule, PanelMenuModule],
  template: `
    <!-- Sidebar -->
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <!-- Logo -->
      <div class="h-16 flex items-center px-6 border-b border-gray-200">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <i class="pi pi-cog text-white text-xl"></i>
          </div>
          <div>
            <h1 class="text-lg font-bold text-gray-900">TechMaint</h1>
            <p class="text-xs text-gray-500">Gestion Interventions</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 overflow-y-auto">
        <p-panelMenu [model]="menuItems" class="custom-panel-menu"></p-panelMenu>

        <!-- Section Rapports -->
        <h3 class="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-8 mb-3">
          Rapports
        </h3>
        <p-panelMenu [model]="reportItems" class="custom-panel-menu"></p-panelMenu>
      </nav>

      <!-- User Section -->
      <div class="p-4 border-t border-gray-200">
        <div class="flex items-center gap-3">
          <p-avatar
            label="JD"
            shape="circle"
          ></p-avatar>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">Jean Dupont</p>
            <p class="text-xs text-gray-500 truncate">Administrateur</p>
          </div>
          <button
            pButton
            type="button"
            icon="pi pi-sign-out"
            class="p-button-text p-button-rounded text-gray-400 hover:text-gray-600"
          ></button>
        </div>
      </div>
    </aside>
  `,
  styles: ``,
})
export class Sidebar implements OnInit {
  menuItems: MenuItem[] = [];
  reportItems: MenuItem[] = [];
  ngOnInit(): void {
    this.menuItems = [
      {
        label: 'Tableau de bord',
        icon: 'pi pi-home',
        routerLink: ['/dashboard'],
        style: { border: 'none' },

      },
      {
        label: 'Interventions',
        icon: 'pi pi-briefcase',
        routerLink: ['/interventions'],
        style: { border: 'none' },
      },
      {
        label: 'Techniciens',
        icon: 'pi pi-users',
        routerLink: ['/techniciens'],
        style: { border: 'none' },
      },
      {
        label: 'Planning',
        icon: 'pi pi-calendar',
        routerLink: ['/planning'],
        style: { border: 'none' },
      },
      {
        label: 'Équipements',
        icon: 'pi pi-cog',
        routerLink: ['/equipements'],
        style: { border: 'none' },
      },
    ];

    this.reportItems = [
      {
        label: 'Statistiques',
        icon: 'pi pi-chart-bar',
        routerLink: ['/rapports/statistiques'],
        style: { border: 'none' },
      },
      {
        label: 'Performance',
        icon: 'pi pi-chart-line',
        routerLink: ['/rapports/performance'],
        style: { border: 'none' },
      },
    ];
  }
}
