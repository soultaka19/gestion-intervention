import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "./navbar/navbar";
import { Sidebar } from "./sidebar/sidebar";

@Component({
  selector: 'app-layout',
  imports: [Sidebar, Navbar, RouterOutlet],
  template: `
    <div class="flex h-screen bg-gray-50 overflow-hidden">

      <app-sidebar />

      <div class="flex-1 flex flex-col overflow-hidden">
        <app-navbar (toggleSidebar)="toggleSidebar()" />

        <main class="flex-1 overflow-y-auto p-6">
          <div class="container-app">
            <router-outlet></router-outlet>        
          </div>
        </main>
      </div>
    </div>
  `,
  styles:`
    
  `,
})
export class Layout {
  isCollapsed = signal(false);

  toggleSidebar(){
    this.isCollapsed.update(value => !value);
  }
}
