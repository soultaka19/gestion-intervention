import { Routes } from '@angular/router';
import { Dashbord } from './dashbord/dashbord';
import { Layout } from './layout/layout';

export const routes: Routes = [
  {
    path:'home', 
    component : Layout,
    children:[
      {path:'dashbord',component:Dashbord}
    ]
  },
  {path : '', redirectTo: 'home/dashbord',pathMatch: 'full' }
];
