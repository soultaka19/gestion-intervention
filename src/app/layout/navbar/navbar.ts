import { Component, output } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'app-navbar',
  imports: [ToolbarModule, ButtonModule, BadgeModule, AvatarModule, InputTextModule],
  template: `
    <p-toolbar class="navbar-custom border-none shadow-md">
      <ng-template pTemplate="start">
      </ng-template>

      <ng-template pTemplate="end">
          <i class="pi pi-bell pi-bell mr-4" style="font-size: 1.2rem;color:white"></i>
          <i class="pi pi-spin pi-cog" style="font-size: 1.5rem;color:white"></i>
      </ng-template>
    </p-toolbar>
  `,
  styles: `
    ::ng-deep .navbar-custom {
      background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-700) 100%) !important;
      border: none !important;
      padding: 0.75rem 1.5rem !important;
      height: 4rem;
    }
    
    ::ng-deep .navbar-custom .p-toolbar-group-start,
    ::ng-deep .navbar-custom .p-toolbar-group-end {
      display: flex;
      align-items: center;
    }

    ::ng-deep .navbar-custom .p-inputtext {
      background: rgba(255, 255, 255, 0.1) !important;
      border-color: rgba(255, 255, 255, 0.2) !important;
      color: white !important;
    }

    ::ng-deep .navbar-custom .p-inputtext::placeholder {
      color: rgba(255, 255, 255, 0.6) !important;
    }

    ::ng-deep .navbar-custom .p-inputtext:focus {
      background: rgba(255, 255, 255, 0.2) !important;
      border-color: rgba(255, 255, 255, 0.4) !important;
      box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.1) !important;
    }

    ::ng-deep .navbar-custom .p-button {
      color: rgba(255, 255, 255, 0.9) !important;
    }

    ::ng-deep .navbar-custom .p-button:hover {
      background: rgba(255, 255, 255, 0.1) !important;
      color: white !important;
    }

    ::ng-deep .navbar-custom .p-badge {
      background: var(--color-red-500) !important;
      color: white !important;
      min-width: 1.25rem;
      height: 1.25rem;
      line-height: 1.25rem;
    }

    ::ng-deep .navbar-custom .p-input-icon-left > i {
      color: rgba(255, 255, 255, 0.6) !important;
    }
  `,
})
export class Navbar {
  toggleSidebar = output();
}