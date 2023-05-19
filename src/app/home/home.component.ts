import { Component, OnInit } from '@angular/core';
import {FireService} from "../fire.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  gotchiData: any;
  userData: any;
  makeQuest: boolean = false;


  constructor(public fireService: FireService) {
  }

  async ngOnInit() {
   await this.getGotchi();
   await this.getUserQuests();
  }


  async getGotchi() {
    try {
      this.gotchiData = await this.fireService.getGotchi();
    } catch (error) {
      console.error('Error retrieving gotchi:', error);
    }
  }

  async getUserQuests(){
    try {
      this.userData = await this.fireService.getUserQuests();
      console.log(this.userData)
    } catch (error) {
      console.error('Error retriveing userData:', error)
    }
  }

  async signOut() {
    await this.fireService.signOut();
  }

  toggleQuestComponent() {
    if (this.makeQuest) {
      // Switch to sign-in mode
      this.makeQuest = false;
    }
    // Switch to sign-up mode
    else {
      this.makeQuest = true;
    }
  }

}
