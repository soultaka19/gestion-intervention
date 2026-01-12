import { Component } from '@angular/core';
import { Navbar } from "./navbar/navbar";
import { Sidebar } from "./sidebar/sidebar";

@Component({
  selector: 'app-layout',
  imports: [Sidebar, Navbar],
  templateUrl: './layout.html',
  styles:``,
})
export class Layout {

}
