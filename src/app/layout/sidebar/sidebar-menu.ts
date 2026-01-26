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
      <div class="space-y-2">
        @for (item of menuItems(); track item.label) {
          <a
            [routerLink]="item.routerLink"
            routerLinkActive="!bg-indigo-700/50 !text-white shadow-lg"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-indigo-200 hover:bg-indigo-800/50 hover:text-white transition-all duration-200 group relative"
            [class.justify-center]="isCollapsed()"
            [pTooltip]="isCollapsed() ? item.label : ''"
            tooltipPosition="right"
          >
            <i [class]="item.icon + ' text-xl flex-shrink-0'"></i>
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
        <div class="mt-8 mb-3">
          <h3 class="px-4 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Rapports
          </h3>
        </div>
      } @else {
        <div class="mt-8 border-t border-indigo-700/30 pt-4"></div>
      }

      <div class="space-y-2">
        @for (item of reportItems(); track item.label) {
          <a
            [routerLink]="item.routerLink"
            routerLinkActive="!bg-indigo-700/50 !text-white shadow-lg"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-indigo-200 hover:bg-indigo-800/50 hover:text-white transition-all duration-200 group"
            [class.justify-center]="isCollapsed()"
            [pTooltip]="isCollapsed() ? item.label : ''"
            tooltipPosition="right"
          >
            <i [class]="item.icon + ' text-xl flex-shrink-0'"></i>
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