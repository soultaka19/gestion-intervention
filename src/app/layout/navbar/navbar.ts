import { Component, output } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';


@Component({
  selector: 'app-navbar',
  imports: [
    ToolbarModule,IconFieldModule,InputIconModule,
     ButtonModule,BadgeModule,AvatarModule, InputTextModule],
  template: `
    <p-toolbar class="navbar-custom border-none shadow-sm">
      <ng-template pTemplate="start">
        
        <p-iconfield iconPosition="left" class="mb-2">
          <p-inputicon class="pi pi-search " />
          <input type="text" pInputText placeholder="Search" class="w-300 " />
        </p-iconfield>
      </ng-template>

      <ng-template pTemplate="end">
        <div class="flex items-center gap-1">
          <button 
            pButton 
            size="large"
            icon="pi pi-bell" 
            class="p-button-text p-button-rounded text-gray-600 hover:text-primary-600 hover:bg-primary-50 relative"
            pBadge 
            value="3" 
            severity="danger"
          ></button>

          <button 
          size="large"
            pButton 
            icon="pi pi-cog" 
            class="p-button-text p-button-rounded text-gray-600 hover:text-primary-600 hover:bg-primary-50"
          ></button>

        </div>
      </ng-template>
    </p-toolbar>
  `,
  styles: `
    ::ng-deep .navbar-custom {
      background: white !important;
      border-bottom: 1px solid rgb(229 231 235) !important;
      padding: 0.75rem 1.5rem !important;
      height: 4rem;
    }
    
    ::ng-deep .navbar-custom .p-toolbar-group-start,
    ::ng-deep .navbar-custom .p-toolbar-group-end {
      display: flex;
      align-items: center;
    }
  `,
})
export class Navbar {
  toggleSidebar = output();
}
