import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "./navbar/navbar";
import { Sidebar } from "./sidebar/sidebar";

@Component({
  selector: 'app-layout',
  imports: [Sidebar, Navbar, RouterOutlet],
  templateUrl: './layout.html',
  styles:``,
})
export class Layout {

}
