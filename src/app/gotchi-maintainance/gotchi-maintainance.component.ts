import { Component, OnInit } from '@angular/core';
import {FireService} from "../fire.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";

@Component({
  selector: 'app-gotchi-maintainance',
  templateUrl: './gotchi-maintainance.component.html',
  styleUrls: ['./gotchi-maintainance.component.scss']
})
export class GotchiMaintainanceComponent implements OnInit {

  gotchiData: any;
  user: any;

  constructor(private fireservice: FireService, private matSnackbar: MatSnackBar, private router: Router) { }

  ngOnInit(): void {
    this.gotchiData = this.getGotchi();
    this.user = this.fireservice.auth.currentUser;
  }

  async getGotchi() {
    try {
      this.gotchiData = await this.fireservice.getGotchiSpecific();

    } catch (error) {
      console.error('Error retrieving gotchi:', error);
    }
  }

  async sleep(){
    try {
      await this.fireservice.sendReq("increaseSleep");
      await this.getGotchi();
    }
    catch (error){
      this.matSnackbar.open("Something went wrong")
    }
  }

  async eat(){
    try {
      await this.fireservice.sendReq("increaseHunger");
      await this.getGotchi();
    }
    catch (error){
      this.matSnackbar.open("Something went wrong")
    }
  }

  async shower(){
    try {
      await this.fireservice.sendReq("increaseCleanliness");
      await this.getGotchi();
    }
    catch (error){
      this.matSnackbar.open("Something went wrong")
    }
  }
  goBack() {
    this.router.navigateByUrl("home")
  }

}
