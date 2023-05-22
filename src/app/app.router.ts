import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ItemoverviewComponent } from './itemoverview/itemoverview.component';
import {GotchiMaintainanceComponent} from "./gotchi-maintainance/gotchi-maintainance.component";
import {AuthGuard} from "./authGuard";
import {QuestComponent} from "./quest/quest.component";
import {HomeComponent} from "./home/home.component";

const  routes: Routes = [
  {path: "itemview", component: ItemoverviewComponent, canActivate: [AuthGuard]},
  {path: "gotchiMain", component: GotchiMaintainanceComponent, canActivate: [AuthGuard]},
  {path: "quest", component: QuestComponent, canActivate: [AuthGuard]},
  {path: "oldhome", component: HomeComponent, canActivate: [AuthGuard]},
  {path: "home", component: GotchiMaintainanceComponent, canActivate: [AuthGuard]},
  {path: "login", component: LoginComponent},
  {path: "**", redirectTo: "home"}
];

export const appRoutingModule = RouterModule.forRoot(routes);
