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
    <div class="flex h-screen bg-gray-50 overflow-hidden">
      <!-- Overlay pour mobile seulement quand sidebar est ouverte -->
      @if (!isCollapsed() && isMobileView()) {
        <div 
          class="fixed inset-0 bg-black/50 z-20 md:hidden animate-fade-in"
          (click)="collapseSidebar()"
        ></div>
      }

      <!-- Sidebar - toujours visible avec icônes -->
      <app-sidebar 
        [isCollapsed]="isCollapsed()"
        (toggleSidebar)="toggleSidebar()"
        class="z-30"
      />

      <!-- Contenu principal -->
      <div class="flex-1 flex flex-col overflow-hidden transition-all duration-300">
        <app-navbar 
          (toggleSidebar)="toggleSidebar()"
          [isCollapsed]="isCollapsed()"
        />

        <main 
          class="flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-300"
        >
          <div 
            class="container-app transition-all duration-300"
            [class.max-w-full]="isCollapsed()"
            [class.max-w-7xl]="!isCollapsed()"
          >
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
  isCollapsed = signal(false); // Toujours collapsed par défaut (mode icônes)
  private previousIsMobile = this.isMobileView();

  constructor() {
    // Écouter les changements de taille d'écran avec RxJS
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(150),
        map(() => this.isMobileView())
      )
      .subscribe(isMobile => {
        // Sur changement de breakpoint, retour en mode collapsed
        if (isMobile !== this.previousIsMobile) {
          this.isCollapsed.set(true);
          this.previousIsMobile = isMobile;
        }
      });

    effect(() => {
      const collapsed = this.isCollapsed();
      // Logique additionnelle si nécessaire
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