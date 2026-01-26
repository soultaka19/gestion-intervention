import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-sidebar-menu',
  imports: [RouterLink, RouterLinkActive, TooltipModule],
  template: `
    <nav class="flex-1 px-3 py-6 overflow-y-auto">
      <!-- Menu principal -->
      <div class="space-y-1">
        @for (item of menuItems(); track item.label) {
          <a
            [routerLink]="item.routerLink"
            routerLinkActive="bg-primary-50 text-primary-700 border-primary-600"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 border-l-3 border-transparent group relative"
            [class.justify-center]="isCollapsed()"
            [pTooltip]="isCollapsed() ? item.label : ''"
            tooltipPosition="right"
          >
            <i [class]="item.icon + ' text-lg flex-shrink-0'"></i>
            @if (!isCollapsed()) {
              <span class="font-medium text-sm whitespace-nowrap">
                {{ item.label }}
              </span>
            }
          </a>
        }
      </div>

      <!-- Section Rapports -->
      @if (!isCollapsed()) {
        <div class="mt-8">
          <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Rapports
          </h3>
        </div>
      } @else {
        <div class="mt-8 border-t border-gray-200 pt-4"></div>
      }

      <div class="space-y-1">
        @for (item of reportItems(); track item.label) {
          <a
            [routerLink]="item.routerLink"
            routerLinkActive="bg-primary-50 text-primary-700 border-primary-600"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 border-l-3 border-transparent group"
            [class.justify-center]="isCollapsed()"
            [pTooltip]="isCollapsed() ? item.label : ''"
            tooltipPosition="right"
          >
            <i [class]="item.icon + ' text-lg flex-shrink-0'"></i>
            @if (!isCollapsed()) {
              <span class="font-medium text-sm whitespace-nowrap">
                {{ item.label }}
              </span>
            }
          </a>
        }
      </div>
    </nav>
  `,
})
export class SidebarMenu {
  menuItems = input.required<MenuItem[]>();
  reportItems = input.required<MenuItem[]>();
  isCollapsed = input(false);
}