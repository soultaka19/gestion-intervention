import { Component, HostListener, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "./navbar/navbar";
import { Sidebar } from "./sidebar/sidebar";

@Component({
  selector: 'app-layout',
  imports: [Sidebar, Navbar, RouterOutlet],
  template: `
    <div class="flex h-screen bg-gray-50 overflow-hidden">
      <!-- Overlay pour mobile -->
      @if (!isCollapsed() && isMobile()) {
        <div 
          class="fixed inset-0 bg-black/50 z-20 md:hidden animate-fade-in"
          (click)="toggleSidebar()"
        ></div>
      }

      <!-- Sidebar -->
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
          [class.md:ml-0]="!isCollapsed()"
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
export class Layout implements OnInit, OnDestroy {
  isCollapsed = signal(this.getInitialCollapseState());
  private resizeTimeout: any;

  ngOnInit() {
    // Ajuster l'état initial au chargement
    this.adjustSidebarOnResize();
  }

  ngOnDestroy() {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    // Debounce pour éviter trop d'appels
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    
    this.resizeTimeout = setTimeout(() => {
      this.adjustSidebarOnResize();
    }, 150);
  }

  toggleSidebar() {
    this.isCollapsed.update(value => !value);
  }

  isMobile(): boolean {
    return window.innerWidth < 768;
  }

  private adjustSidebarOnResize() {
    const wasMobile = this.isMobile();
    
    // Si on passe de mobile à desktop
    if (!wasMobile && this.isCollapsed()) {
      // Ouvrir automatiquement la sidebar sur desktop
      this.isCollapsed.set(false);
    }
    
    // Si on passe de desktop à mobile
    if (wasMobile && !this.isCollapsed()) {
      // Fermer automatiquement la sidebar sur mobile
      this.isCollapsed.set(true);
    }
  }

  private getInitialCollapseState(): boolean {
    // Sur mobile, sidebar fermée par défaut
    // Sur desktop, sidebar ouverte par défaut
    return window.innerWidth < 768;
  }
}