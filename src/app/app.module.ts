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
import { ItemoverviewComponent } from './itemoverview/itemoverview.component';
import { appRoutingModule } from "./app.router";

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
        BrowserModule,
        appRoutingModule,
        FormsModule,
        BrowserAnimationsModule,
      MatSnackBarModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
