import {Component, OnInit} from '@angular/core';
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import {GotchiFireService} from "../../services/gotchi.service";
import {QuestService} from "../../services/quest.service";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-gotchi-maintainance',
  templateUrl: './gotchi-maintainance.component.html',
  styleUrls: ['./gotchi-maintainance.component.scss']
})

export class GotchiMaintainanceComponent implements OnInit {
  gotchiData: any;
  death: boolean = false;


  constructor(private matSnackbar: MatSnackBar, private router: Router, private gotchiService: GotchiFireService, private questService: QuestService, private userService: UserService) {
  }

  ngOnInit(): void {
    this.getGotchi();
    this.checkDeathState();
  }


  async getGotchi() {
    try {
      this.gotchiData = await this.gotchiService.getGotchiSpecific();

    } catch (error) {
      console.error('Error retrieving gotchi:', error);
    }
  }

  async sleep() {
    try {
      await this.gotchiService.sendReq("increaseSleep");
      await this.getGotchi();
      await this.questService.increaseQuestProgress(1, "sleep");
    } catch (error) {
      this.matSnackbar.open("Something went wrong");
    }
  }

  async eat() {
    try {
      await this.gotchiService.sendReq("increaseHunger");
      await this.getGotchi();
      await this.questService.increaseQuestProgress(1, "eat");
    } catch (error) {
      this.matSnackbar.open("Something went wrong");
    }
  }

  async shower() {
    try {
      await this.gotchiService.sendReq("increaseCleanliness");
      await this.getGotchi();
      await this.questService.increaseQuestProgress(1, "shower");
    } catch (error) {
      this.matSnackbar.open("Something went wrong");
    }
  }

  goBack() {
    this.router.navigateByUrl("home")
  }

  async signOut() {
    await this.userService.signOut();
    this.router.navigateByUrl("login");
  }


  async quest() {
    await this.router.navigateByUrl("quest");
  }

  itemsOverview() {
    this.router.navigateByUrl("itemview")
  }

  async restart(){
    try {
      this.death = await this.gotchiService.restart()
      console.log(this.death)
      this.ngOnInit();
    }
    catch (error){
      console.log("cba")
    }
  }
  async checkDeathState(): Promise<void> {
    try {
      this.death = await this.gotchiService.getMyDeath();
      console.log("Hello, I am death:", this.death);
    } catch (error) {
      console.log('Error checking death state:', error);
    }
  }


  async commButton() {
    await this.router.navigateByUrl("communication");
  }
}

