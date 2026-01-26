import { Component, effect, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { fromEvent } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { Navbar } from "./navbar/navbar";
import { Sidebar } from "./sidebar/sidebar";

@Component({
  selector: 'app-layout',
  imports: [Sidebar, Navbar, RouterOutlet],
  template: `
    <div class="flex h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">
      <!-- Sidebar - toujours visible avec icônes -->
      <app-sidebar 
        [isCollapsed]="isCollapsed()"
        (toggleSidebar)="toggleSidebar()"
        class="z-30"
      />

      <!-- Contenu principal -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <app-navbar 
          (toggleSidebar)="toggleSidebar()"
          [isCollapsed]="isCollapsed()"
        />

        <main 
          class="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8"
        >
          <div class="max-w-[1600px] mx-auto">
            <router-outlet></router-outlet>        
          </div>
        </main>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }
  `,
})
export class Layout {
  isCollapsed = signal(false);
  private previousIsMobile = this.isMobileView();

  constructor() {
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(150),
        map(() => this.isMobileView())
      )
      .subscribe(isMobile => {
        if (isMobile !== this.previousIsMobile) {
          this.isCollapsed.set(true);
          this.previousIsMobile = isMobile;
        }
      });

    effect(() => {
      const collapsed = this.isCollapsed();
    });
  }

  toggleSidebar() {
    this.isCollapsed.update(value => !value);
  }

  collapseSidebar() {
    this.isCollapsed.set(true);
  }

  isMobileView(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  }
}