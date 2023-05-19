import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import {GotchiMaintainanceComponent} from "./gotchi-maintainance/gotchi-maintainance.component";
import {AuthGuard} from "./authGuard";
import {ItemoverviewComponent} from "./itemoerview/itemoverview.component";

const  routes: Routes = [
  {path: "itemview", component: ItemoverviewComponent, canActivate: [AuthGuard]},
  {path: "gotchiMain", component: GotchiMaintainanceComponent, canActivate: [AuthGuard]},
  {path: "", component: LoginComponent},
  {path:  "home", component: HomeComponent},
  {path: "**", redirectTo: ""}
];

export const appRoutingModule = RouterModule.forRoot(routes);
