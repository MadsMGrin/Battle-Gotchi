import { Component, OnInit } from '@angular/core';
import {FireService} from "../fire.service";
import {Router} from "@angular/router";
import { quest } from "../../entities/quest";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  gotchiData: any;
  userData: any;
  onlineUsers: any[] = [];

  constructor(public fireService: FireService, private router: Router) {}

  async ngOnInit() {
   await this.getGotchi();
   await this.getUserQuests();
   await this.getOnlineUsers();
  }


  async getUserQuests(){
    try {
      this.userData = await this.fireService.getUserQuests();
      console.log(this.userData)
    } catch (error) {
      console.error('Error retriveing userData:', error)
    }
  }

  async getGotchi() {
    try {
      this.gotchiData = await this.fireService.getGotchi();
    } catch (error) {
      console.error('Error retrieving gotchi:', error);
    }
  }

  async signOut() {
    await this.fireService.signOut();
    await this.router.navigateByUrl("");

  }

  async getOnlineUsers() {
    try {
      this.onlineUsers = await this.fireService.getOnlineUsers();
      console.log(this.onlineUsers)
    } catch (error) {
      console.error('Error retrieving online users:', error);
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

  async questComponent() {
    await this.router.navigateByUrl("quest");
  }

  async itemsOverview() {
    await this.router.navigateByUrl("itemview");
  }

  async gotToMaintainance(){
    await this.router.navigateByUrl("gotchiMain");
  }
}
