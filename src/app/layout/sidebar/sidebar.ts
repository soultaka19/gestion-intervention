import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { SidebarHeader } from "./sidebar-header";
import { SidebarMenu } from "./sidebar-menu";
import { SidebarUser } from "./sidebar-user";
@Component({
  selector: 'app-sidebar',
  imports: [SidebarHeader, SidebarMenu, SidebarUser],
  template: `
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <app-sidebar-header />
      <app-sidebar-menu [menuItems]="menuItems" [reportItems]="reportItems" />
      <app-sidebar-user class="mt-auto" />
    </aside>
  `,
  styles: ``,
})
export class Sidebar {
  menuItems: MenuItem[] = [
    {
      label: 'Tableau de bord',
      icon: 'pi pi-home',
      routerLink: ['/home/dashbord'],
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

  reportItems: MenuItem[] = [
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
