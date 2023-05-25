import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { LoginComponent } from './landingPages/login/login.component';
import { FormsModule} from "@angular/forms";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import { MatSnackBarModule} from "@angular/material/snack-bar";
import { GotchiMaintainanceComponent } from './landingPages/gotchi-maintainance/gotchi-maintainance.component';
import { ItemoverviewComponent } from './landingPages/itemoverview/itemoverview.component';
import { appRoutingModule } from "./app.router";
import {AngularFireModule} from "@angular/fire/compat";
import {AngularFireAuthModule} from "@angular/fire/compat/auth";
import {firebaseConfig} from "../../firebaseconfig";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {NgOptimizedImage} from "@angular/common";
import { UserQuestListComponent } from './landingPages/user-quest-list/user-quest-list.component';
import { TradeWindowComponent } from './landingPages/trade-window/trade-window.component';
import { OnlineUserListComponent } from './minorComponents/online-user-list/online-user-list.component';
import { BattleRequestListComponent } from './minorComponents/battle-request-list/battle-request-list.component';
import { TradeRequestListComponent } from './minorComponents/trade-request-list/trade-request-list.component';
import { ChatComponent } from './minorComponents/chat/chat.component';
import { CommHubComponent } from './landingPages/comm-hub/comm-hub.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    GotchiMaintainanceComponent,
    ItemoverviewComponent,
    UserQuestListComponent,
    TradeWindowComponent,
    OnlineUserListComponent,
    BattleRequestListComponent,
    TradeRequestListComponent,
    ChatComponent,
    CommHubComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    MatCardModule,
    MatButtonModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    BrowserModule,
    appRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    MatProgressBarModule,
    NgOptimizedImage,
    MatButtonModule,
    MatCardModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
