import { Component, input, output } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'app-navbar',
  imports: [ToolbarModule, ButtonModule, BadgeModule, AvatarModule, InputTextModule],
  template: `
    <p-toolbar class="navbar-custom border-b border-gray-200 bg-white shadow-sm">
      <ng-template pTemplate="start">
        <div class="flex items-center gap-4">
          <!-- Bouton toggle pour mobile -->
          <!-- <button
            pButton
            type="button"
            icon="pi pi-bars"
            class="p-button-text p-button-rounded md:hidden !text-primary-600 hover:!text-primary-700 hover:!bg-primary-50 transition-colors"
            (click)="toggleSidebar.emit()"
          ></button> -->

          <!-- Breadcrumb ou titre de page -->
          <div class="hidden sm:block">
            <h2 class="text-lg font-semibold text-gray-900">Tableau de bord</h2>
          </div>
        </div>
      </ng-template>

      <ng-template pTemplate="end">
        <div class="flex items-center gap-2 md:gap-4">
          <!-- Boutons d'action - cachés sur petit mobile -->
          <div class="hidden sm:flex gap-2">
            <button
              pButton
              label="Ajouter"
              icon="pi pi-plus"
              class="p-button-sm !bg-primary-600 hover:!bg-primary-700 !text-white !border-primary-600 hover:!border-primary-700 transition-all shadow-sm hover:shadow-md"
            ></button>
            <button
              pButton
              label="Planning"
              icon="pi pi-calendar"
              class="p-button-sm p-button-outlined !text-primary-600 !border-primary-600 hover:!bg-primary-50 hover:!text-primary-700 hover:!border-primary-700 transition-all"
            ></button>
          </div>

          <!-- Notifications -->
          <button
            pButton
            type="button"
            icon="pi pi-bell"
            class="p-button-text p-button-rounded !text-primary-600 hover:!text-primary-700 hover:!bg-primary-50 transition-colors relative"
            pBadge="3"
            severity="danger"
          ></button>

          <!-- Avatar utilisateur - caché sur très petit écran -->
          <div class="hidden md:block">
            <p-avatar
              label="JD"
              shape="circle"
              styleClass="bg-gradient-to-br from-primary-600 to-primary-700 text-white cursor-pointer hover:ring-2 hover:ring-primary-300 transition-all"
            ></p-avatar>
          </div>
        </div>
      </ng-template>
    </p-toolbar>
  `,
  styles: `
    .navbar-custom {
      padding: 0.75rem 1rem !important;
      height: 4rem;
      
      @media (min-width: 768px) {
        padding: 0.75rem 1.5rem !important;
      }
    }
  `,
})
export class Navbar {
  isCollapsed = input(false);
  toggleSidebar = output();
}