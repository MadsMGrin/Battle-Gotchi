import { Component, OnInit } from '@angular/core';
import { FireService } from "../fire.service";
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import {delay, timeout} from "rxjs";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = "";
  password: string = "";
  username: string = "";
  isSignUp: boolean = false;

  constructor(
    public fireService: FireService,
    private _snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {}

  async register(email: string, password: string, username: string) {
    try {
      await this.fireService.register(email, password, username);
      const user = this.fireService.auth.currentUser;
      if (user) {
        delay(2000 );
        await this.router.navigateByUrl("home");
      }
    } catch (error) {
      if (error instanceof Error) {
        this._snackBar.open('Error registering user: ' + error.message, 'Close', { duration: 2000 });
      } else {
        console.error('Error registering user:', error);
      }
    }
  }

  async signIn(email: string, password: string) {
    if (email.trim() === '' || password.trim() === '') {
      this._snackBar.open('Please enter your email and password', 'Close', { duration: 2000 });
      return;
    }

    try {
      await this.fireService.signIn(email, password);
      const user = this.fireService.auth.currentUser;
      if (user) {
        await this.router.navigateByUrl("home"); // Replace '/dashboard' with the actual route of the screen
      }
    } catch (error) {
      if (error instanceof Error) {
        this._snackBar.open('Error signing in: ' + error.message, 'Close', { duration: 2000 });
      } else {
        console.error('Error signing in:', error);
      }
    }
  }

  toggleSignUp() {
    if (this.isSignUp) {
      // Switch to sign-in mode
      this.isSignUp = false;
      this.username = "";
    }
    // Switch to sign-up mode
    else {
      this.isSignUp = true;
    }
  }

  async mock() {
    await this.fireService.mock();
  }
}
