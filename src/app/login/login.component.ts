import { Component, OnInit } from '@angular/core';
import { FireService } from "../fire.service";
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = "";
  password: string = "";
  username: string = "";

  constructor(public fireService: FireService, private _snackBar: MatSnackBar) {}

  ngOnInit(): void {}

  async register(email: string, password: string, username: string) {
    try {
      await this.fireService.register(email, password, username);
      await this.fireService.createGotchi();
    } catch (error) {
      if (error instanceof Error) {
        this._snackBar.open('Error registering user: ' + error.message, 'Close', { duration: 2000 });
      } else {
        console.error('Error registering user:', error);
      }
    }
  }

  async signIn(email: string, password: string) {
    try {
      await this.fireService.signIn(email, password);
    } catch (error) {
      if (error instanceof Error) {
        this._snackBar.open('Error signing in: ' + error.message, 'Close', { duration: 2000 });
      } else {
        console.error('Error signing in:', error);
      }
    }
  }
}
