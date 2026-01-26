import { Component, input, output } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { SidebarHeader } from "./sidebar-header";
import { SidebarMenu } from "./sidebar-menu";
import { SidebarUser } from "./sidebar-user";

@Component({
  selector: 'app-sidebar',
  imports: [SidebarHeader, SidebarMenu, SidebarUser],
  template: `
    <aside 
      class="bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300 ease-in-out shadow-sm relative"
      [class.w-64]="!isCollapsed()"
      [class.w-18]="isCollapsed()"
    >
      <app-sidebar-header 
        [isCollapsed]="isCollapsed()"
        (toggle)="toggleSidebar.emit()"
      />
      
      <app-sidebar-menu 
        [menuItems]="menuItems" 
        [reportItems]="reportItems"
        [isCollapsed]="isCollapsed()"
      />
      
      <app-sidebar-user 
        [isCollapsed]="isCollapsed()"
        class="mt-auto" 
      />
    </aside>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }
  `,
})
export class Sidebar {
  isCollapsed = input(false);
  toggleSidebar = output();

  menuItems: MenuItem[] = [
    {
      label: 'Tableau de bord',
      icon: 'pi pi-home',
      routerLink: ['/home/dashbord'],
    },
    {
      label: 'Interventions',
      icon: 'pi pi-briefcase',
      routerLink: ['/interventions'],
    },
    {
      label: 'Techniciens',
      icon: 'pi pi-users',
      routerLink: ['/techniciens'],
    },
    {
      label: 'Planning',
      icon: 'pi pi-calendar',
      routerLink: ['/planning'],
    },
    {
      label: 'Équipements',
      icon: 'pi pi-cog',
      routerLink: ['/equipements'],
    },
  ];

  reportItems: MenuItem[] = [
    {
      label: 'Statistiques',
      icon: 'pi pi-chart-bar',
      routerLink: ['/rapports/statistiques'],
    },
    {
      label: 'Performance',
      icon: 'pi pi-chart-line',
      routerLink: ['/rapports/performance'],
    },
  ];
}