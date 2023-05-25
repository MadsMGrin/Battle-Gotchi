import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import {delay} from "rxjs";
import {UserService} from "../../services/user.service";
import {QuestService} from "../../services/quest.service";
import {ItemService} from "../../services/item.service";
import {BaseService} from "../../services/baseService";

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
    private _snackBar: MatSnackBar,
    private router: Router,
    private userService: UserService,
    private questService: QuestService,
    private itemServcie: ItemService,
    private baseService: BaseService
  ) {}

  ngOnInit(): void {}

  async register(email: string, password: string, username: string) {
    try {
      await this.questService.register(email, password, username);
      const user = this.baseService.auth.currentUser;
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
      await this.userService.signIn(email, password);
      const user = this.baseService.auth.currentUser;
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

  async mockQuestDataToFirebase(){
    await this.questService.mockQuestDataToFirebase();
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
    await this.itemServcie.mock();
  }
}
