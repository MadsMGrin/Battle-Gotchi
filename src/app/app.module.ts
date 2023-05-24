import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FormsModule} from "@angular/forms";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import { QuestComponent } from './quest/quest.component';
import { MatSnackBarModule} from "@angular/material/snack-bar";
import { GotchiMaintainanceComponent } from './gotchi-maintainance/gotchi-maintainance.component';
import { TestComponent } from './test/test.component';
import { ItemoverviewComponent } from './itemoverview/itemoverview.component';
import { appRoutingModule } from "./app.router";
import {AngularFireModule} from "@angular/fire/compat";
import {AngularFireAuthModule} from "@angular/fire/compat/auth";
import {firebaseConfig} from "../../firebaseconfig";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {NgOptimizedImage} from "@angular/common";
import { UserQuestListComponent } from './quest/user-quest-list/user-quest-list.component';
import { TradeWindowComponent } from './trade-window/trade-window.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    QuestComponent,
    GotchiMaintainanceComponent,
    TestComponent,
    ItemoverviewComponent,
    UserQuestListComponent,
    TradeWindowComponent,
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
