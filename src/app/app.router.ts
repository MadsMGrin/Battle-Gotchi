import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './landingPages/login/login.component';
import { ItemoverviewComponent } from './landingPages/itemoverview/itemoverview.component';
import {GotchiMaintainanceComponent} from "./landingPages/gotchi-maintainance/gotchi-maintainance.component";
import {AuthGuard} from "./authGuard";
import {UserQuestListComponent} from "./landingPages/user-quest-list/user-quest-list.component";
import {TradeWindowComponent} from "./landingPages/trade-window/trade-window.component";
import {CommHubComponent} from "./landingPages/comm-hub/comm-hub.component";


const  routes: Routes = [
  {path: "itemview", component: ItemoverviewComponent, canActivate: [AuthGuard]},
  {path: "trade-window/:itemId/:uid", component: TradeWindowComponent, canActivate:[AuthGuard]},
  {path: "gotchiMain", component: GotchiMaintainanceComponent, canActivate: [AuthGuard]},
  {path: "quest", component: UserQuestListComponent, canActivate: [AuthGuard]},
  {path: "communication", component: CommHubComponent, canActivate: [AuthGuard]},
  {path: "home", component: GotchiMaintainanceComponent, canActivate: [AuthGuard]},
  {path: "login", component: LoginComponent},
  {path: "**", redirectTo: "home"},


];

export const appRoutingModule = RouterModule.forRoot(routes);
