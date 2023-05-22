import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ItemoverviewComponent } from './itemoverview/itemoverview.component';
import {GotchiMaintainanceComponent} from "./gotchi-maintainance/gotchi-maintainance.component";
import {AuthGuard} from "./authGuard";
import {UserQuestListComponent} from "./quest/user-quest-list/user-quest-list.component";

const  routes: Routes = [
  {path: "itemview", component: ItemoverviewComponent, canActivate: [AuthGuard]},
  {path: "gotchiMain", component: GotchiMaintainanceComponent, canActivate: [AuthGuard]},
  {path: "quest", component: UserQuestListComponent, canActivate: [AuthGuard]},
  {path: "home", component: GotchiMaintainanceComponent, canActivate: [AuthGuard]},
  {path: "login", component: LoginComponent},
  {path: "**", redirectTo: "home"}
];

export const appRoutingModule = RouterModule.forRoot(routes);
