import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FormsModule} from "@angular/forms";
import { HomeComponent } from './home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule} from "@angular/material/snack-bar";
import { GotchiMaintainanceComponent } from './gotchi-maintainance/gotchi-maintainance.component';
import { TestComponent } from './test/test.component';
import { appRoutingModule } from "./app.router";
import {AngularFireModule} from "@angular/fire/compat";
import {AngularFireAuthModule} from "@angular/fire/compat/auth";
import {firebaseConfig} from "../../firebaseconfig";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {NgOptimizedImage} from "@angular/common";
import {ItemoverviewComponent} from "./itemoerview/itemoverview.component";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    GotchiMaintainanceComponent,
    TestComponent,
    ItemoverviewComponent,
  ],
  imports: [
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    BrowserModule,
    appRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    MatProgressBarModule,
    NgOptimizedImage
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
