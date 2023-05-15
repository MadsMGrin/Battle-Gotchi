
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { ItemoverviewComponent } from './itemoverview/itemoverview.component';

const  routes: Routes = [
  {path: "itemview", component: ItemoverviewComponent},
  {path: "", component: LoginComponent},
  {path:  "home", component: HomeComponent},
  {path: "**", redirectTo: ""}
];

export const appRoutingModule = RouterModule.forRoot(routes);
