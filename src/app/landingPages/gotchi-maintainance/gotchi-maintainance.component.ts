import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { FireService } from "../../fire.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";

@Component({
  selector: 'app-gotchi-maintainance',
  templateUrl: './gotchi-maintainance.component.html',
  styleUrls: ['./gotchi-maintainance.component.scss']
})

export class GotchiMaintainanceComponent implements OnInit {
  gotchiData: any;
  death: boolean = false;


  constructor(private fireservice: FireService, private matSnackbar: MatSnackBar, private router: Router) {
  }

  ngOnInit(): void {
    this.getGotchi();
    this.checkDeathState();
  }


  async getGotchi() {
    try {
      this.gotchiData = await this.fireservice.getGotchiSpecific();

    } catch (error) {
      console.error('Error retrieving gotchi:', error);
    }
  }

  async sleep() {
    try {
      await this.fireservice.sendReq("increaseSleep");
      await this.getGotchi();
      await this.fireservice.increaseQuestProgress(1, "sleep");
    } catch (error) {
      this.matSnackbar.open("Something went wrong");
    }
  }

  async eat() {
    try {
      await this.fireservice.sendReq("increaseHunger");
      await this.getGotchi();
      await this.fireservice.increaseQuestProgress(1, "eat");
    } catch (error) {
      this.matSnackbar.open("Something went wrong");
    }
  }

  async shower() {
    try {
      await this.fireservice.sendReq("increaseCleanliness");
      await this.getGotchi();
      await this.fireservice.increaseQuestProgress(1, "shower");
    } catch (error) {
      this.matSnackbar.open("Something went wrong");
    }
  }

  goBack() {
    this.router.navigateByUrl("home")
  }

  async signOut() {
    await this.fireservice.signOut();
    this.router.navigateByUrl("login");
  }


  async quest() {
    await this.router.navigateByUrl("quest");
  }




  // used so the chat is scrolled down when you refresh page.


  itemsOverview() {
    this.router.navigateByUrl("itemview")
  }




  async restart(){
    try {
      this.death = await this.fireservice.restart()
      console.log(this.death)
      this.ngOnInit();
    }
    catch (error){
      console.log("cba")
    }
  }
  async checkDeathState(): Promise<void> {
    try {
      this.death = await this.fireservice.getMyDeath();
      console.log("Hello, I am death:", this.death);
    } catch (error) {
      console.log('Error checking death state:', error);
    }
  }


}

