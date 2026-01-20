import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-sidebar-user',
  imports: [AvatarModule, ButtonModule],
  template: `
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
  `,
  styles: ``,
})
export class SidebarUser {

}
