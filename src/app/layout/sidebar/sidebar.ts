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
      class="bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-900 flex flex-col h-full transition-all duration-300 ease-in-out shadow-2xl"
      [class.w-72]="!isCollapsed()"
      [class.w-20]="isCollapsed()"
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
      icon: 'pi pi-th-large',
      routerLink: ['/home/dashbord'],
    },
    {
      label: 'Clients',
      icon: 'pi pi-building',
      routerLink: ['/home/clients'],
    },
    {
      label: 'Interventions',
      icon: 'pi pi-briefcase',
      routerLink: ['/home/interventions'],
    },
    {
      label: 'Techniciens',
      icon: 'pi pi-users',
      routerLink: ['/home/techniciens'],
    },
    {
      label: 'Planning',
      icon: 'pi pi-calendar',
      routerLink: ['/home/planning'],
    },
    {
      label: 'Équipements',
      icon: 'pi pi-cog',
      routerLink: ['/home/equipements'],
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