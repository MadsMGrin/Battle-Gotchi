import { Component, OnInit } from '@angular/core';
import {FireService} from "../fire.service";
import {gotchi} from "../../entities/gotchi";
import {Router} from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  gotchiData: any;
  userData: any;
  makeQuest: boolean = false;
  onlineUsers: any[] = [];




  constructor(public fireService: FireService, private router: Router) {}

  async ngOnInit() {
   await this.getGotchi();
   await this.getUserQuests();
   await this.getOnlineUsers();
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
  async getOnlineUsers() {
    try {
      this.onlineUsers = await this.fireService.getOnlineUsers();
      console.log(this.onlineUsers)
    } catch (error) {
      console.error('Error retrieving online users:', error);
    }
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
  async requestBattle(userId: string) {
    try {
      await this.fireService.sendBattleRequest(userId);
      alert('Battle request sent!');
    } catch (error) {
      console.error('Error sending battle request:', error);
    }
  }

  async itemsOverview() {
    await this.router.navigateByUrl("itemview");
  }

  async gotToMaintainance(){
    await this.router.navigateByUrl("gotchiMain");
  }
}
