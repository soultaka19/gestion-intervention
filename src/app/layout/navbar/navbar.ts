import { Component, input, output } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-navbar',
  imports: [ButtonModule, BadgeModule, AvatarModule, InputTextModule],
  template: `
    <nav class="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
      <div class="flex items-center justify-between px-6 py-4">
        <!-- Titre de la page -->
        <div class="flex items-center gap-4">
          <h2 class="text-2xl font-bold text-gray-800">Tableau de bord</h2>
        </div>

        <!-- Actions à droite -->
        <div class="flex items-center gap-3">
          <!-- Boutons d'action -->
          <div class="hidden sm:flex gap-2">
            <button
              pButton
              label="Ajouter"
              icon="pi pi-plus"
              class="p-button-sm !bg-indigo-600 hover:!bg-indigo-700 !text-white !border-indigo-600 hover:!border-indigo-700 transition-all shadow-sm hover:shadow-md !rounded-xl"
            ></button>
            <button
              pButton
              label="Planning"
              icon="pi pi-calendar"
              class="p-button-sm !bg-white !text-indigo-600 !border-gray-300 hover:!bg-gray-50 hover:!border-indigo-600 transition-all !rounded-xl"
            ></button>
          </div>

          <!-- Notifications -->
          <button
            pButton
            type="button"
            icon="pi pi-bell"
            class="p-button-text p-button-rounded !text-gray-600 hover:!text-indigo-600 hover:!bg-indigo-50 transition-colors relative"
            pBadge="3"
            severity="danger"
          ></button>

          <!-- Avatar utilisateur -->
          <div class="hidden md:block">
            <p-avatar
              label="JD"
              shape="circle"
              styleClass="bg-gradient-to-br from-indigo-600 to-purple-600 text-white cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all"
            ></p-avatar>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class Navbar {
  isCollapsed = input(false);
  toggleSidebar = output();
}